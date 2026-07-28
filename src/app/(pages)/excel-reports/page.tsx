"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Bar, Doughnut, Line, Pie, Radar } from "react-chartjs-2";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  RadialLinearScale,
  Title,
  Tooltip,
} from "chart.js";
import { ComboboxForData } from "@/components/ui/comboboxForGraficData";
import { ComboboxForGrafic } from "@/components/ui/comboboxForGrafic";
import { ToastContainer, toast } from "react-toastify";
import dynamic from "next/dynamic";
import { apiGet } from "@/lib/api-client";
import type { ExamDetail } from "@/features/exams/types";

/**
 * Dışa aktarma bileşenleri tembel yükleniyor.
 *
 * Bunlar ExcelJS ve `@react-pdf/renderer` bağımlılıklarını çekiyor; statik
 * import edildiklerinde sayfanın ilk yükünü 976 kB'a çıkarıyorlardı. Oysa
 * kodun tamamı yalnızca indirme düğmesine basıldığında gerekiyor.
 *
 * `ssr: false` çünkü hepsi tarayıcı API'lerine (Blob, saveAs) dayanıyor.
 */
const loading = () => (
  <div className="h-9 rounded-md bg-white/10 animate-pulse" />
);

const StudentAnalysisExport = dynamic(
  () => import("@/features/exports/StudentAnalysis").then((m) => m.StudentAnalysisExport),
  { ssr: false, loading }
);
const QuestionAnalysisExport = dynamic(
  () => import("@/features/exports/QuestionAnalysis").then((m) => m.QuestionAnalysisExport),
  { ssr: false, loading }
);
const TestAnalysisExport = dynamic(
  () => import("@/features/exports/TestAnalysis").then((m) => m.TestAnalysisExport),
  { ssr: false, loading }
);
const OptionAnalysisExport = dynamic(
  () => import("@/features/exports/OptionAnalysis").then((m) => m.OptionAnalysisExport),
  { ssr: false, loading }
);
const StudentAnswersExport = dynamic(
  () => import("@/features/exports/StudentAnswers").then((m) => m.StudentAnswersExport),
  { ssr: false, loading }
);
const TestResults = dynamic(() => import("@/app/(functions)/TestResults"), {
  ssr: false,
  loading,
});

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend
);

/**
 * Rapor ekranı.
 *
 * Bu dosya eskiden 1244 satırdı ve bunun ~700 satırı psikometri hesabıydı:
 * KR-20, madde güçlüğü, ayırt edicilik, biserial korelasyon, seçenek analizi…
 * Hepsi `src/features/analysis/` altına saf, test edilmiş modüllere taşındı
 * (49 birim testi). Burada artık yalnızca sunum var.
 *
 * Hesaplama da sunucuda yapılıyor: sayfa hazır `ExamAnalysis` alıyor. Eskiden
 * 30'dan fazla `useState` bir `useEffect` zinciriyle dolduruluyor ve her
 * render'da baştan hesaplanıyordu.
 */
export default function ExcelReports() {
  const searchParams = useSearchParams();
  const examId = searchParams.get("exam");

  const [detail, setDetail] = useState<ExamDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedData, setSelectedData] = useState("Öğrencilerin Puanları");
  const [selectedChart, setSelectedChart] = useState("bar");

  useEffect(() => {
    if (!examId) {
      setLoading(false);
      return;
    }
    apiGet<ExamDetail>(`/api/exams/${examId}`)
      .then(setDetail)
      .catch((error) =>
        toast.error(
          error instanceof Error ? error.message : "Rapor yüklenemedi.",
          { theme: "dark" }
        )
      )
      .finally(() => setLoading(false));
  }, [examId]);

  const stats = useMemo(() => {
    if (!detail) return [];
    const { descriptive: d, reliability } = detail.analysis;
    const fmt = (value: number | null, digits = 2) =>
      value === null || !Number.isFinite(value) ? "—" : value.toFixed(digits);

    return [
      { label: "Öğrenci Sayısı", value: String(d.studentCount) },
      { label: "Madde Sayısı", value: String(d.questionCount) },
      { label: "Ortalama Puan", value: fmt(d.mean) },
      { label: "Standart Sapma", value: fmt(d.stdDeviation) },
      { label: "Varyans", value: fmt(d.variance) },
      { label: "Ortanca", value: fmt(d.median) },
      { label: "Maksimum Puan", value: fmt(d.max, 0) },
      { label: "Minimum Puan", value: fmt(d.min, 0) },
      { label: "Ranj", value: fmt(d.range, 0) },
      { label: "Çarpıklık", value: fmt(d.skewness) },
      { label: "Basıklık", value: fmt(d.kurtosis) },
      { label: "Başarı Yüzdesi", value: fmt(d.successRate) },
      { label: "KR-20", value: fmt(reliability.kr20) },
      { label: "KR-21", value: fmt(reliability.kr21) },
    ];
  }, [detail]);

  /**
   * Grafik verisi. `null` değerler grafikte boşluk olarak görünür — eskiden
   * hesaplanamayan değerler 0'a çevriliyordu ve grafikte "sıfır" gibi
   * okunuyordu.
   */
  const chart = useMemo(() => {
    if (!detail) return { labels: [] as string[], values: [] as (number | null)[] };
    const { students, items, frequency } = detail.analysis;
    const studentLabels = detail.studentNames;
    const itemLabels = items.difficulty.map((_, i) => `M${i + 1}`);

    switch (selectedData) {
      case "Öğrencilerin Puanları":
        return { labels: studentLabels, values: students.points };
      case "Öğrenci Puanlarının Frekansları":
        return {
          labels: frequency.map((f) => String(f.score)),
          values: frequency.map((f) => f.count),
        };
      case "Madde Güçlük İndeksi":
        return { labels: itemLabels, values: items.difficulty };
      case "Başarı Yüzdeleri":
        return {
          labels: studentLabels,
          values: students.successRates.map((r) => r * 100),
        };
      case "Z Puanları":
        return { labels: studentLabels, values: students.zScores };
      case "T Puanları":
        return { labels: studentLabels, values: students.tScores };
      case "Madde Bazında Varyans":
        return { labels: itemLabels, values: items.variance };
      case "Madde Bazında Standart Sapma":
        return { labels: itemLabels, values: items.stdDeviation };
      case "Madde Toplam Korelasyon Katsayısı (Bis)":
        return { labels: itemLabels, values: items.rbis };
      case "Çift Katsayılı Kolerasyon Değeri (pBis)":
        return { labels: itemLabels, values: items.prbis };
      case "Ayırt Edicilik İndeksi":
        return { labels: itemLabels, values: items.discrimination };
      case "Güvenirlik İndeksi":
        return { labels: itemLabels, values: items.reliabilityIndex };
      default:
        return { labels: [], values: [] };
    }
  }, [detail, selectedData]);

  // Renk dizisi ve veri nesnesi her render'da yeniden üretiliyordu; Chart.js
  // referans değişince grafiği baştan çiziyor.
  const chartData = useMemo(
    () => ({
      labels: chart.labels,
      datasets: [
        {
          label: selectedData,
          data: chart.values,
          borderColor: "rgb(54, 162, 235)",
          backgroundColor: chart.labels.map(
            (_, index) => `hsl(${(index * 47) % 360}, 70%, 60%)`
          ),
          borderWidth: 2,
          pointRadius: chart.labels.length > 60 ? 0 : 4,
        },
      ],
    }),
    [chart, selectedData]
  );

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      // Kalabalık sınıflarda (200 öğrenci gibi) animasyon çizimi belirgin
      // şekilde yavaşlatıyor.
      animation: (chart.labels.length > 60 ? false : undefined) as false | undefined,
      plugins: {
        legend: { display: true, position: "top" as const, labels: { color: "#fff" } },
        title: { display: true, text: selectedData, color: "#fff", font: { size: 18 } },
      },
      scales: {
        y: { ticks: { color: "#fff" }, grid: { color: "rgba(200,200,200,0.2)" } },
        x: {
          ticks: {
            color: "#fff",
            // Etiketler sığmayınca üst üste biniyordu.
            autoSkip: true,
            maxRotation: 60,
          },
          grid: { color: "rgba(200,200,200,0.2)" },
        },
      },
    }),
    [chart.labels.length, selectedData]
  );

  const renderChart = () => {
    switch (selectedChart) {
      case "pie":
        return <Pie data={chartData} options={chartOptions} />;
      case "radar":
        return <Radar data={chartData} options={chartOptions} />;
      case "doughnut":
        return <Doughnut data={chartData} options={chartOptions} />;
      case "line":
        return <Line data={chartData} options={chartOptions} />;
      default:
        return <Bar data={chartData} options={chartOptions} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Yükleniyor...</p>
      </div>
    );
  }

  if (!examId || !detail) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">
          Rapor görüntülemek için Klasörler sayfasından bir sınav seçin.
        </p>
      </div>
    );
  }

  const exportProps = {
    analysis: detail.analysis,
    studentNames: detail.studentNames,
    answerKey: detail.answerKey,
    responses: detail.responses,
    examName: detail.exam.name,
  };

  return (
    <div className="h-screen overflow-y-auto bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-white/40 backdrop-blur-sm" />
        <img
          className="w-full h-full object-cover opacity-20"
          src="/bg-anaekran.jpg"
          alt=""
        />
      </div>

      <div className="relative z-10 h-full p-2 sm:p-4">
        <div className="flex flex-col lg:flex-row gap-4 h-full">
          {/* Değerler */}
          <div className="w-full order-2 lg:order-3 lg:w-1/4 bg-slate-800/80 backdrop-blur-sm rounded-xl">
            <div className="max-h-[280px] lg:max-h-none lg:h-[calc(100vh-2rem)] overflow-y-auto p-2 sm:p-4">
              <div className="mb-2 pb-1 border-b border-white/20">
                <h2 className="text-xl font-bold text-center text-white">
                  📈 Değerler
                </h2>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-1">
                {stats.map((item) => (
                  <div
                    key={item.label}
                    className="bg-white/10 p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                  >
                    <div className="text-xs sm:text-sm text-gray-300">
                      {item.label}
                    </div>
                    <div className="text-base sm:text-lg font-semibold text-white">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Raporlar */}
          <div className="w-full order-3 lg:order-1 lg:w-1/4 bg-slate-800/80 backdrop-blur-sm rounded-xl">
            <div className="max-h-[400px] lg:max-h-none lg:h-[calc(100vh-2rem)] overflow-y-auto p-2 sm:p-3">
              <div className="mb-2 pb-1 border-b border-white/20">
                <h2 className="text-xl font-bold text-center text-white">
                  📊 Raporlar
                </h2>
                <p className="text-xs text-center text-gray-400 mt-1 truncate">
                  {detail.exam.name}
                </p>
              </div>
              <div className="space-y-2">
                {[
                  <StudentAnalysisExport key="s" {...exportProps} />,
                  <QuestionAnalysisExport key="q" {...exportProps} />,
                  <TestAnalysisExport key="t" {...exportProps} />,
                  <OptionAnalysisExport key="o" {...exportProps} />,
                  <StudentAnswersExport key="a" {...exportProps} />,
                  <StudentAnswersExport key="b" {...exportProps} binary />,
                  <TestResults
                    key="p"
                    analysis={detail.analysis}
                    studentNames={detail.studentNames}
                    examName={detail.exam.name}
                    examDate={detail.exam.createdAt}
                  />,
                ].map((node, index) => (
                  <div
                    key={index}
                    className="bg-white/10 rounded-lg p-3 hover:bg-white/20 transition-colors"
                  >
                    {node}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Grafikler */}
          {/* Mobilde ilk sırada: eskiden grafiğe ulaşmak için ~880px kaydırmak
              gerekiyordu, çünkü değerler ve raporlar panelleri sabit yükseklikle
              üstte duruyordu. */}
          <div className="w-full order-1 lg:order-2 lg:w-1/2 bg-slate-800/80 backdrop-blur-sm rounded-xl p-2 sm:p-4 flex flex-col">
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="w-full sm:w-1/2">
                <ComboboxForData value={selectedData} setValue={setSelectedData} />
              </div>
              <div className="w-full sm:w-1/2">
                <ComboboxForGrafic
                  value={selectedChart}
                  setValue={setSelectedChart}
                />
              </div>
            </div>
            <div className="h-[360px] sm:h-[420px] lg:h-auto lg:flex-1 lg:min-h-[400px]">
              {renderChart()}
            </div>
          </div>
        </div>
      </div>

      <ToastContainer position="bottom-right" theme="dark" />
    </div>
  );
}
