"use client";

import { ANSWER_OPTIONS, type AnswerOption, type ExamAnalysis } from "@/features/analysis";
import { fmt } from "./svg-utils";

/**
 * Çeldirici analizi — seçilen maddede kimin hangi şıkkı işaretlediği.
 *
 * Beklenen desen: doğru yanıtı üst grup daha çok, çeldiricileri alt grup daha
 * çok işaretler. Tersi bir dağılım maddenin ya da anahtarın sorunlu olduğunu
 * gösterir. Bu görünüm eskiden yalnızca indirilen Excel dosyasında vardı.
 */
export function DistractorPanel({
  analysis,
  answerKey,
  questionNo,
  onClose,
}: {
  analysis: ExamAnalysis;
  answerKey: AnswerOption[];
  questionNo: number;
  onClose: () => void;
}) {
  const option = analysis.options[questionNo - 1];
  const correct = answerKey[questionNo - 1];
  if (!option) return null;

  const maxCount = Math.max(1, ...ANSWER_OPTIONS.map((o) => option.counts[o]));

  return (
    <div className="rounded-lg border border-black/5 dark:border-white/10 bg-[var(--viz-surface-raised)] p-5">
      <div className="flex items-start justify-between gap-4 mb-1">
        <h3 className="text-sm font-medium text-[var(--viz-text)]">
          Madde {questionNo} — seçenek dağılımı
        </h3>
        <button
          onClick={onClose}
          className="text-xs text-[var(--viz-text-muted)] hover:text-[var(--viz-text)]"
        >
          Kapat
        </button>
      </div>
      <p className="mb-4 text-xs text-[var(--viz-text-secondary)]">
        Doğru yanıt <strong className="text-[var(--viz-text)]">{correct}</strong>.
        Üst ve alt grup, puana göre en iyi ve en zayıf %27'lik dilim
        {option.groupSize > 0 ? ` (${option.groupSize}'şer öğrenci)` : ""}.
      </p>

      <table className="min-w-full text-sm" style={{ fontVariantNumeric: "tabular-nums" }}>
        <thead className="text-[var(--viz-text-secondary)]">
          <tr>
            <th className="py-1.5 pr-3 text-left font-medium">Şık</th>
            <th className="py-1.5 pr-3 text-left font-medium">Dağılım</th>
            <th className="py-1.5 pr-3 text-right font-medium">Toplam</th>
            <th className="py-1.5 pr-3 text-right font-medium">Üst %27</th>
            <th className="py-1.5 text-right font-medium">Alt %27</th>
          </tr>
        </thead>
        <tbody>
          {ANSWER_OPTIONS.map((value) => {
            const isCorrect = value === correct;
            const count = option.counts[value];
            return (
              <tr
                key={value}
                className="border-t border-black/5 dark:border-white/10"
              >
                <td className="py-2 pr-3">
                  <span className="inline-flex items-center gap-1.5 text-[var(--viz-text)]">
                    {value === "BOS" ? "Boş" : value}
                    {/* Doğru yanıt ikon + metinle işaretli, renkle değil */}
                    {isCorrect && (
                      <span
                        className="text-xs"
                        style={{ color: "var(--viz-series)" }}
                        title="Doğru yanıt"
                      >
                        ✓ doğru
                      </span>
                    )}
                  </span>
                </td>
                <td className="py-2 pr-3 w-40">
                  <span className="block h-2 rounded-full bg-[var(--viz-series-soft)] overflow-hidden">
                    <span
                      className="block h-full rounded-full"
                      style={{
                        width: `${(count / maxCount) * 100}%`,
                        background: isCorrect
                          ? "var(--viz-series)"
                          : "var(--viz-recessive)",
                      }}
                    />
                  </span>
                </td>
                <td className="py-2 pr-3 text-right text-[var(--viz-text)]">
                  {count}{" "}
                  <span className="text-[var(--viz-text-muted)]">
                    (%{fmt(option.percentages[value], 0)})
                  </span>
                </td>
                <td className="py-2 pr-3 text-right text-[var(--viz-text)]">
                  {option.upperGroup[value]}
                </td>
                <td className="py-2 text-right text-[var(--viz-text)]">
                  {option.lowerGroup[value]}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
