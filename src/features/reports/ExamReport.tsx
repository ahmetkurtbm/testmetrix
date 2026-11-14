"use client";

import { AlertTriangle, Download } from "lucide-react";
import dynamic from "next/dynamic";
import { useMemo, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import type { AnswerOption, ExamAnalysis } from "@/features/analysis";
import { fmt } from "@/lib/format";

import { DistractorPanel } from "./DistractorPanel";
import { ItemDifficultyArea } from "./ItemDifficultyArea";
import { ItemMap } from "./ItemMap";
import { ItemTable } from "./ItemTable";
import { classifyItems, type ItemFlag } from "./quality";
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

/** Uyarı listesinin sırası: cevap anahtarı şüphesi en üstte. */
const SEVERITY: Record<ItemFlag, number> = {
  negative: 0,
  weakDiscrimination: 1,
  tooHard: 2,
  tooEasy: 3,
  ok: 4,
};
const ATTENTION_PREVIEW = 6;

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
  /** Cevap anahtarını düzeltme sayfası; girişsiz denemede yok. */
  editHref?: string;
};

export function ExamReport({ analysis, studentNames, answerKey, responses, title, meta, examDate, actions, editHref }: ExamReportProps) {
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [exportsOpen, setExportsOpen] = useState(false);
  const [showAllAttention, setShowAllAttention] = useState(false);
  const items = useMemo(() => classifyItems(analysis), [analysis]);

  const { descriptive: d, reliability } = analysis;
  const attention = items
    .filter((i) => i.needsAttention)
    .sort((a, b) => SEVERITY[a.flag] - SEVERITY[b.flag] || a.questionNo - b.questionNo);
  const keySuspects = attention.filter((i) => i.flag === "negative");
  const others = attention.filter((i) => i.flag !== "negative");
  const visibleOthers = showAllAttention ? others : others.slice(0, ATTENTION_PREVIEW);
  const exportProps = { analysis, studentNames, answerKey, responses, examName: title };

  return (
    <div className="space-y-4">
      <Panel>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate font-display text-2xl font-semibold tracking-tight text-gray-900">{title}</h2>
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
          <div className="mt-4 grid gap-5 border-t border-gray-100 pt-4 lg:grid-cols-[16rem_1fr]">
            <div>
              <p className="mb-2 text-sm font-semibold text-gray-900">Grafikli rapor (PDF)</p>
              <TestResults
                analysis={analysis}
                studentNames={studentNames}
                examName={title}
                examDate={examDate ?? new Date().toISOString()}
              />
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-gray-900">Excel tabloları</p>
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                <StudentAnalysisExport {...exportProps} />
                <QuestionAnalysisExport {...exportProps} />
                <TestAnalysisExport {...exportProps} />
                <OptionAnalysisExport {...exportProps} />
                <StudentAnswersExport {...exportProps} />
                <StudentAnswersExport {...exportProps} binary />
              </div>
            </div>
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

      {keySuspects.length > 0 && (
        <Panel className="border-orange-300 bg-orange-50/60 dark:border-orange-900/70 dark:bg-orange-950/20">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex gap-3">
              <AlertTriangle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-orange-700 dark:text-orange-400" />
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  {keySuspects.length === 1
                    ? "1 maddede cevap anahtarı hatası olabilir"
                    : `${keySuspects.length} maddede cevap anahtarı hatası olabilir`}
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  Testte başarılı olanlar bu maddeleri daha çok yanlış yapmış. Anahtarı kontrol edip düzeltirseniz rapor
                  yeniden hesaplanır.
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {keySuspects.map((item) => (
                    <button
                      key={item.questionNo}
                      onClick={() => setSelectedItem(item.questionNo)}
                      className="rounded-md border border-orange-300 bg-surface px-2.5 py-1 text-sm font-semibold text-gray-900 hover:border-orange-500 dark:border-orange-800"
                    >
                      Madde {item.questionNo}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {editHref ? (
              <a href={editHref}>
                <Button variant="outline" className="text-sm">
                  Cevap anahtarını düzenle
                </Button>
              </a>
            ) : null}
          </div>
        </Panel>
      )}

      {others.length > 0 && (
        <Panel>
          <h3 className="text-base font-semibold text-gray-900">
            {others.length} madde {keySuspects.length > 0 ? "daha " : ""}gözden geçirilmeli
          </h3>
          <p className="mt-1 text-sm text-gray-500">Önem sırasına göre. Ayrıntı için maddeye dokunun.</p>
          <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
            {visibleOthers.map((item) => (
              <li key={item.questionNo} className="text-sm">
                <button onClick={() => setSelectedItem(item.questionNo)} className="text-left hover:underline">
                  <span className="font-semibold text-gray-900">M{item.questionNo}</span>
                  <span className="text-orange-700 dark:text-orange-400"> {item.label}</span>
                  <span className="text-gray-500"> · {item.explanation}</span>
                </button>
              </li>
            ))}
          </ul>
          {others.length > ATTENTION_PREVIEW && (
            <button
              onClick={() => setShowAllAttention((value) => !value)}
              className="mt-3 text-sm font-medium text-blue-600 hover:underline"
            >
              {showAllAttention ? "Daha az göster" : `Tümünü göster (${others.length})`}
            </button>
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

      <Sheet open={selectedItem !== null} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto bg-surface sm:max-w-xl">
          <SheetTitle className="sr-only">Madde {selectedItem} ayrıntısı</SheetTitle>
          <SheetDescription className="sr-only">Seçeneklerin üst ve alt gruba göre dağılımı</SheetDescription>
          {selectedItem !== null && (
            <div className="pt-6">
              {(() => {
                const item = items[selectedItem - 1];
                return item ? (
                  <p className="mb-4 text-sm">
                    <span className="font-semibold text-gray-900">{item.label}</span>
                    <span className="text-gray-600"> · {item.explanation}</span>
                    <span className="mt-1 block text-gray-500">
                      Güçlük {fmt(item.difficulty)} · Ayırt edicilik {fmt(item.discrimination)}
                    </span>
                  </p>
                ) : null;
              })()}
              <DistractorPanel analysis={analysis} answerKey={answerKey} questionNo={selectedItem} />
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Panel>
        <ItemTable analysis={analysis} items={items} selected={selectedItem} onSelect={setSelectedItem} />
      </Panel>

      <Panel>
        <StudentTable analysis={analysis} studentNames={studentNames} />
      </Panel>
    </div>
  );
}
