"use client";

import { Download } from "lucide-react";
import dynamic from "next/dynamic";
import { useMemo, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import type { AnswerOption, ExamAnalysis } from "@/features/analysis";
import { fmt } from "@/lib/format";

import { DistractorPanel } from "./DistractorPanel";
import { ItemDifficultyArea } from "./ItemDifficultyArea";
import { ItemMap } from "./ItemMap";
import { ItemTable } from "./ItemTable";
import { classifyItems } from "./quality";
import { ReliabilityGauge } from "./ReliabilityGauge";
import { ScoreHistogram } from "./ScoreHistogram";
import { StatTile } from "./StatTile";
import { StudentTable } from "./StudentTable";

/**
 * Sınav raporu: güvenirlik, özet, dikkat isteyen maddeler, grafikler, tablolar
 * ve dışa aktarma. Kayıtlı sınav ekranı ile girişsiz deneme aynı bileşeni
 * kullanır; ikisi arasındaki tek fark verinin nereden geldiği.
 */

// Dışa aktarma bileşenleri ExcelJS ve @react-pdf/renderer çekiyor; yalnızca
// düğmeye basılınca yükleniyorlar.
const loading = () => <div className="h-9 animate-pulse rounded-md bg-gray-100" />;

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
const TestResults = dynamic(() => import("@/app/(functions)/TestResults"), { ssr: false, loading });

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-gray-200 bg-surface p-5 ${className}`}>{children}</div>;
}

export type ExamReportProps = {
  analysis: ExamAnalysis;
  studentNames: string[];
  answerKey: AnswerOption[];
  responses: AnswerOption[][];
  title: string;
  meta: ReactNode;
  /** PDF ve Excel çıktılarında kullanılan tarih. */
  examDate?: string;
  /** Başlığın sağındaki ek düğmeler (ör. Düzenle). */
  actions?: ReactNode;
};

export function ExamReport({ analysis, studentNames, answerKey, responses, title, meta, examDate, actions }: ExamReportProps) {
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [exportsOpen, setExportsOpen] = useState(false);
  const items = useMemo(() => classifyItems(analysis), [analysis]);

  const { descriptive: d, reliability } = analysis;
  const attention = items.filter((i) => i.needsAttention);
  const exportProps = { analysis, studentNames, answerKey, responses, examName: title };

  return (
    <div className="space-y-4">
      <Panel>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-xl font-semibold text-gray-900">{title}</h2>
            <p className="mt-1 text-sm text-gray-500">{meta}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {actions}
            <Button
              onClick={() => setExportsOpen((prev) => !prev)}
              aria-expanded={exportsOpen}
              className="bg-blue-600 text-sm text-white hover:bg-blue-700"
            >
              <Download aria-hidden="true" />
              Raporları indir
            </Button>
          </div>
        </div>

        {exportsOpen && (
          <div className="mt-4 grid gap-2 border-t border-gray-100 pt-4 sm:grid-cols-2 lg:grid-cols-3">
            <StudentAnalysisExport {...exportProps} />
            <QuestionAnalysisExport {...exportProps} />
            <TestAnalysisExport {...exportProps} />
            <OptionAnalysisExport {...exportProps} />
            <StudentAnswersExport {...exportProps} />
            <StudentAnswersExport {...exportProps} binary />
            <TestResults
              analysis={analysis}
              studentNames={studentNames}
              examName={title}
              examDate={examDate ?? new Date().toISOString()}
            />
          </div>
        )}
      </Panel>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel>
          <ReliabilityGauge kr20={reliability.kr20} />
        </Panel>

        <div className="grid grid-cols-2 gap-3 lg:col-span-2 xl:grid-cols-4">
          <StatTile label="Ortalama" value={fmt(d.mean, 1)} hint={`${d.questionCount} üzerinden`} />
          <StatTile label="Standart sapma" value={fmt(d.stdDeviation, 1)} />
          <StatTile label="Ortanca" value={fmt(d.median, 1)} />
          <StatTile label="Başarı" value={`%${fmt(d.successRate, 0)}`} />
        </div>
      </div>

      {attention.length > 0 && (
        <Panel className="border-orange-200 dark:border-orange-900/60">
          <h3 className="text-base font-semibold text-gray-900">{attention.length} madde gözden geçirilmeli</h3>
          <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
            {attention.slice(0, 6).map((item) => (
              <li key={item.questionNo} className="text-sm">
                <button onClick={() => setSelectedItem(item.questionNo)} className="text-left hover:underline">
                  <span className="font-semibold text-gray-900">M{item.questionNo}</span>
                  <span className="text-orange-600"> {item.label}</span>
                  <span className="text-gray-500"> — {item.explanation}</span>
                </button>
              </li>
            ))}
          </ul>
          {attention.length > 6 && (
            <p className="mt-2 text-xs text-gray-500">ve {attention.length - 6} madde daha — tabloda tümü listeli.</p>
          )}
        </Panel>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <ScoreHistogram analysis={analysis} />
        </Panel>
        <Panel>
          <ItemMap items={items} selected={selectedItem} onSelect={setSelectedItem} />
        </Panel>
      </div>

      <Panel>
        <ItemDifficultyArea items={items} />
      </Panel>

      {selectedItem !== null && (
        <Panel>
          <DistractorPanel
            analysis={analysis}
            answerKey={answerKey}
            questionNo={selectedItem}
            onClose={() => setSelectedItem(null)}
          />
        </Panel>
      )}

      <Panel>
        <ItemTable analysis={analysis} items={items} selected={selectedItem} onSelect={setSelectedItem} />
      </Panel>

      <Panel>
        <StudentTable analysis={analysis} studentNames={studentNames} />
      </Panel>
    </div>
  );
}
