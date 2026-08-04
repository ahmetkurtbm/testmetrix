"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ToastContainer, toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { apiGet } from "@/lib/api-client";
import { fmt } from "@/lib/format";
import type { ExamDetail } from "@/features/exams/types";
import { classifyItems } from "@/features/reports/quality";
import { StatTile } from "@/features/reports/StatTile";
import { ScoreHistogram } from "@/features/reports/ScoreHistogram";
import { ItemDifficultyArea } from "@/features/reports/ItemDifficultyArea";
import { ItemMap } from "@/features/reports/ItemMap";
import { ItemTable } from "@/features/reports/ItemTable";
import { StudentTable } from "@/features/reports/StudentTable";
import { DistractorPanel } from "@/features/reports/DistractorPanel";
import { ReliabilityGauge } from "@/features/reports/ReliabilityGauge";

/**
 * Rapor ekranı.
 *
 * Görünüm diğer ekranlarla aynı dilde: arka plan görseli, yumuşak gradyan ve
 * `bg-white/95` kartlar. Grafikler Recharts ile çiziliyor.
 */

// Dışa aktarma bileşenleri ExcelJS ve @react-pdf/renderer çekiyor; yalnızca
// düğmeye basılınca yükleniyorlar.
const loading = () => (
  <div className="h-9 rounded-md bg-gray-100 animate-pulse" />
);

const StudentAnalysisExport = dynamic(
  () =>
    import("@/features/exports/StudentAnalysis").then(
      (m) => m.StudentAnalysisExport
    ),
  { ssr: false, loading }
);
const QuestionAnalysisExport = dynamic(
  () =>
    import("@/features/exports/QuestionAnalysis").then(
      (m) => m.QuestionAnalysisExport
    ),
  { ssr: false, loading }
);
const TestAnalysisExport = dynamic(
  () => import("@/features/exports/TestAnalysis").then((m) => m.TestAnalysisExport),
  { ssr: false, loading }
);
const OptionAnalysisExport = dynamic(
  () =>
    import("@/features/exports/OptionAnalysis").then((m) => m.OptionAnalysisExport),
  { ssr: false, loading }
);
const StudentAnswersExport = dynamic(
  () =>
    import("@/features/exports/StudentAnswers").then((m) => m.StudentAnswersExport),
  { ssr: false, loading }
);
const TestResults = dynamic(() => import("@/app/(functions)/TestResults"), {
  ssr: false,
  loading,
});

const Panel = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`bg-white/95 backdrop-blur-sm shadow-lg rounded-xl p-5 ${className}`}
  >
    {children}
  </div>
);

export default function ExcelReports() {
  const examId = useSearchParams().get("exam");

  const [detail, setDetail] = useState<ExamDetail | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [exportsOpen, setExportsOpen] = useState(false);

  useEffect(() => {
    if (!examId) {
      setLoadingData(false);
      return;
    }
    apiGet<ExamDetail>(`/api/exams/${examId}`)
      .then(setDetail)
      .catch((error) =>
        toast.error(
          error instanceof Error ? error.message : "Rapor yüklenemedi.",
          { position: "bottom-right", theme: "dark" }
        )
      )
      .finally(() => setLoadingData(false));
  }, [examId]);

  const items = useMemo(
    () => (detail ? classifyItems(detail.analysis) : []),
    [detail]
  );

  const shell = (children: React.ReactNode) => (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 max-w-7xl mx-auto space-y-4">{children}</div>
      <ToastContainer position="bottom-right" theme="dark" />
    </div>
  );

  if (loadingData) {
    return shell(
      <Panel>
        <p className="text-sm text-gray-600">Yükleniyor...</p>
      </Panel>
    );
  }

  if (!examId || !detail) {
    return shell(
      <Panel className="text-center">
        <p className="text-base font-semibold text-gray-700">
          Rapor görüntülemek için bir sınav seçin
        </p>
        <Link
          href="/folders"
          className="mt-3 inline-block text-sm text-blue-600 hover:underline"
        >
          Klasörlere git
        </Link>
      </Panel>
    );
  }

  const { analysis, exam } = detail;
  const { descriptive: d, reliability } = analysis;
  const attention = items.filter((i) => i.needsAttention);

  const exportProps = {
    analysis,
    studentNames: detail.studentNames,
    answerKey: detail.answerKey,
    responses: detail.responses,
    examName: exam.name,
  };

  return shell(
    <>
      {/* Başlık */}
      <Panel>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-gray-800 truncate">
              {exam.name}
            </h1>
            <p className="mt-0.5 text-xs text-gray-500">
              {exam.studentCount} öğrenci · {exam.questionCount} madde ·{" "}
              {new Date(exam.createdAt).toLocaleDateString("tr")}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href={`/excel-update?exam=${exam.id}`}>
              <Button variant="outline" className="text-sm">
                ✏️ Düzenle
              </Button>
            </Link>
            <Button
              onClick={() => setExportsOpen((prev) => !prev)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
            >
              📊 Raporları İndir
            </Button>
          </div>
        </div>

        {exportsOpen && (
          <div className="mt-4 pt-4 border-t border-gray-100 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <StudentAnalysisExport {...exportProps} />
            <QuestionAnalysisExport {...exportProps} />
            <TestAnalysisExport {...exportProps} />
            <OptionAnalysisExport {...exportProps} />
            <StudentAnswersExport {...exportProps} />
            <StudentAnswersExport {...exportProps} binary />
            <TestResults
              analysis={analysis}
              studentNames={detail.studentNames}
              examName={exam.name}
              examDate={exam.createdAt}
            />
          </div>
        )}
      </Panel>

      {/* Güvenirlik + özet */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel>
          <ReliabilityGauge kr20={reliability.kr20} />
        </Panel>

        <div className="lg:col-span-2 grid gap-3 grid-cols-2 xl:grid-cols-4">
          <StatTile
            label="Ortalama"
            value={fmt(d.mean, 1)}
            hint={`${d.questionCount} üzerinden`}
          />
          <StatTile label="Standart sapma" value={fmt(d.stdDeviation, 1)} />
          <StatTile label="Ortanca" value={fmt(d.median, 1)} />
          <StatTile label="Başarı" value={`%${fmt(d.successRate, 0)}`} />
        </div>
      </div>

      {/* Dikkat isteyen maddeler */}
      {attention.length > 0 && (
        <Panel>
          <h2 className="text-base font-semibold text-gray-800">
            {attention.length} madde gözden geçirilmeli
          </h2>
          <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
            {attention.slice(0, 6).map((item) => (
              <li key={item.questionNo} className="text-xs">
                <button
                  onClick={() => setSelectedItem(item.questionNo)}
                  className="text-left hover:underline"
                >
                  <span className="font-medium text-gray-800">
                    M{item.questionNo}
                  </span>
                  <span className="text-orange-600"> {item.label}</span>
                  <span className="text-gray-500"> — {item.explanation}</span>
                </button>
              </li>
            ))}
          </ul>
          {attention.length > 6 && (
            <p className="mt-2 text-xs text-gray-400">
              ve {attention.length - 6} madde daha — tabloda tümü listeli.
            </p>
          )}
        </Panel>
      )}

      {/* Grafikler */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <ScoreHistogram analysis={analysis} />
        </Panel>
        <Panel>
          <ItemMap
            items={items}
            selected={selectedItem}
            onSelect={setSelectedItem}
          />
        </Panel>
      </div>

      <Panel>
        <ItemDifficultyArea items={items} />
      </Panel>

      {selectedItem !== null && (
        <Panel>
          <DistractorPanel
            analysis={analysis}
            answerKey={detail.answerKey}
            questionNo={selectedItem}
            onClose={() => setSelectedItem(null)}
          />
        </Panel>
      )}

      <Panel>
        <ItemTable
          analysis={analysis}
          items={items}
          selected={selectedItem}
          onSelect={setSelectedItem}
        />
      </Panel>

      <Panel>
        <StudentTable analysis={analysis} studentNames={detail.studentNames} />
      </Panel>
    </>
  );
}
