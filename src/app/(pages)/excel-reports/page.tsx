"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ToastContainer, toast } from "react-toastify";
import { apiGet } from "@/lib/api-client";
import type { ExamDetail } from "@/features/exams/types";
import { classifyItems, interpretReliability } from "@/features/reports/quality";
import { fmt } from "@/features/reports/svg-utils";
import { StatTile } from "@/features/reports/StatTile";
import { ScoreHistogram } from "@/features/reports/ScoreHistogram";
import { ItemMap } from "@/features/reports/ItemMap";
import { ItemTable } from "@/features/reports/ItemTable";
import { StudentTable } from "@/features/reports/StudentTable";
import { DistractorPanel } from "@/features/reports/DistractorPanel";

/**
 * Rapor panosu.
 *
 * Eski tasarım 12 veri seçeneğini tek açılır menüye bağlayıp aynı anda tek
 * grafik gösteriyordu — 30'dan fazla metrik varken verinin çoğu görünmüyordu.
 * Artık her şey aynı ekranda ve en değerli görünüm (madde haritası) merkezde.
 *
 * Grafikler satır içi SVG; `chart.js` kaldırıldı.
 */

// Dışa aktarma bileşenleri ExcelJS ve @react-pdf/renderer çekiyor; yalnızca
// düğmeye basılınca gerekiyorlar.
const loading = () => <div className="h-9 rounded-md bg-black/5 dark:bg-white/10 animate-pulse" />;

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

const Card = ({ children }: { children: React.ReactNode }) => (
  <section className="rounded-xl border border-black/5 dark:border-white/10 bg-[var(--viz-surface-raised)] p-5">
    {children}
  </section>
);

export default function ExcelReports() {
  const searchParams = useSearchParams();
  const examId = searchParams.get("exam");

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
          { theme: "dark" }
        )
      )
      .finally(() => setLoadingData(false));
  }, [examId]);

  const items = useMemo(
    () => (detail ? classifyItems(detail.analysis) : []),
    [detail]
  );

  if (loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--viz-surface)]">
        <p className="text-[var(--viz-text-secondary)]">Yükleniyor...</p>
      </div>
    );
  }

  if (!examId || !detail) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-[var(--viz-surface)]">
        <p className="text-[var(--viz-text-secondary)]">
          Rapor görüntülemek için bir sınav seçin.
        </p>
        <Link href="/folders" className="text-sm text-[var(--viz-series)] underline">
          Klasörlere git
        </Link>
      </div>
    );
  }

  const { analysis, exam } = detail;
  const { descriptive: d, reliability } = analysis;
  const reliabilityInfo = interpretReliability(reliability.kr20);
  const attention = items.filter((i) => i.needsAttention);

  const exportProps = {
    analysis,
    studentNames: detail.studentNames,
    answerKey: detail.answerKey,
    responses: detail.responses,
    examName: exam.name,
  };

  return (
    <div className="min-h-screen bg-[var(--viz-surface)]">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-5">
        {/* Başlık şeridi */}
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-[var(--viz-text)]">
              {exam.name}
            </h1>
            <p className="mt-0.5 text-sm text-[var(--viz-text-secondary)]">
              {exam.studentCount} öğrenci · {exam.questionCount} madde ·{" "}
              {new Date(exam.createdAt).toLocaleDateString("tr")}
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/excel-update?exam=${exam.id}`}
              className="px-3 py-2 text-sm rounded-md border border-black/10 dark:border-white/15 text-[var(--viz-text-secondary)] hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              Düzenle
            </Link>
            <button
              onClick={() => setExportsOpen((prev) => !prev)}
              className="px-3 py-2 text-sm rounded-md bg-[var(--viz-series)] text-white hover:opacity-90 transition-opacity"
            >
              Raporları indir
            </button>
          </div>
        </header>

        {exportsOpen && (
          <Card>
            <h2 className="mb-3 text-sm font-medium text-[var(--viz-text)]">
              Dışa aktarma
            </h2>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
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
          </Card>
        )}

        {/* Hero + KPI */}
        <div className="grid gap-4 lg:grid-cols-3">
          <Card>
            <div className="text-xs text-[var(--viz-text-secondary)]">
              KR-20 güvenirlik
            </div>
            {/* Panonun önderlik ettiği tek sayı; orantılı rakam, sistem sans'ı */}
            <div className="mt-1 text-5xl font-semibold leading-none text-[var(--viz-text)]">
              {fmt(reliability.kr20)}
            </div>
            <div className="mt-2 text-sm font-medium text-[var(--viz-text)]">
              {reliabilityInfo.label}
            </div>
            <p className="mt-1 text-xs text-[var(--viz-text-secondary)] leading-relaxed">
              {reliabilityInfo.detail}
            </p>
          </Card>

          <div className="lg:col-span-2 grid gap-3 grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            <StatTile label="Ortalama" value={fmt(d.mean, 1)} hint={`${d.questionCount} üzerinden`} />
            <StatTile label="Standart sapma" value={fmt(d.stdDeviation, 1)} />
            <StatTile label="Ortanca" value={fmt(d.median, 1)} />
            <StatTile label="Başarı" value={`%${fmt(d.successRate, 0)}`} />
          </div>
        </div>

        {/* Gözden geçirilmesi gereken maddeler — varsa öne çıkar */}
        {attention.length > 0 && (
          <Card>
            <h2 className="text-sm font-medium text-[var(--viz-text)]">
              {attention.length} madde gözden geçirilmeli
            </h2>
            <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
              {attention.slice(0, 6).map((item) => (
                <li key={item.questionNo} className="text-xs">
                  <button
                    onClick={() => setSelectedItem(item.questionNo)}
                    className="text-left hover:underline"
                  >
                    <span className="font-medium text-[var(--viz-text)]">
                      M{item.questionNo}
                    </span>
                    <span style={{ color: "var(--viz-accent)" }}> {item.label}</span>
                    <span className="text-[var(--viz-text-secondary)]">
                      {" "}
                      — {item.explanation}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            {attention.length > 6 && (
              <p className="mt-2 text-xs text-[var(--viz-text-muted)]">
                ve {attention.length - 6} madde daha — tabloda tümü listeli.
              </p>
            )}
          </Card>
        )}

        {/* Grafikler */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <ScoreHistogram analysis={analysis} />
          </Card>
          <Card>
            <ItemMap
              items={items}
              selected={selectedItem}
              onSelect={setSelectedItem}
            />
          </Card>
        </div>

        {selectedItem !== null && (
          <DistractorPanel
            analysis={analysis}
            answerKey={detail.answerKey}
            questionNo={selectedItem}
            onClose={() => setSelectedItem(null)}
          />
        )}

        <Card>
          <ItemTable
            analysis={analysis}
            items={items}
            selected={selectedItem}
            onSelect={setSelectedItem}
          />
        </Card>

        <Card>
          <StudentTable analysis={analysis} studentNames={detail.studentNames} />
        </Card>
      </div>

      <ToastContainer position="bottom-right" theme="dark" />
    </div>
  );
}
