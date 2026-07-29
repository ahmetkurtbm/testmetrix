"use client";

import {
  ANSWER_OPTIONS,
  type AnswerOption,
  type ExamAnalysis,
} from "@/features/analysis";
import { fmt } from "@/lib/format";
import { CHART } from "./chart-theme";

/**
 * Çeldirici analizi — seçilen maddede kimin hangi şıkkı işaretlediği.
 *
 * Beklenen desen: doğru yanıtı üst grup daha çok, çeldiricileri alt grup daha
 * çok işaretler. Tersi bir dağılım maddenin ya da cevap anahtarının sorunlu
 * olduğunu gösterir. Bu görünüm eskiden yalnızca indirilen Excel'de vardı.
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
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-gray-800">
            Madde {questionNo} — seçenek dağılımı
          </h2>
          <p className="mt-0.5 text-xs text-gray-500">
            Doğru yanıt <strong className="text-gray-700">{correct}</strong>. Üst ve
            alt grup, puana göre en iyi ve en zayıf %27'lik dilim
            {option.groupSize > 0 ? ` (${option.groupSize}'şer öğrenci)` : ""}.
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-xs text-gray-400 hover:text-gray-700 shrink-0"
        >
          Kapat
        </button>
      </div>

      <div className="mt-3 overflow-x-auto rounded-lg border border-gray-200">
        <table
          className="min-w-full text-sm"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Şık</th>
              <th className="px-3 py-2 text-left font-medium">Dağılım</th>
              <th className="px-3 py-2 text-right font-medium">Toplam</th>
              <th className="px-3 py-2 text-right font-medium">Üst %27</th>
              <th className="px-3 py-2 text-right font-medium">Alt %27</th>
            </tr>
          </thead>
          <tbody>
            {ANSWER_OPTIONS.map((value) => {
              const isCorrect = value === correct;
              const count = option.counts[value];
              return (
                <tr key={value} className="border-t border-gray-100">
                  <td className="px-3 py-2">
                    <span className="inline-flex items-center gap-1.5 text-gray-800">
                      {value === "BOS" ? "Boş" : value}
                      {/* Doğru yanıt ikon + metinle işaretli, renkle değil */}
                      {isCorrect && (
                        <span className="text-xs text-blue-600">✓ doğru</span>
                      )}
                    </span>
                  </td>
                  <td className="px-3 py-2 w-40">
                    <span className="block h-2 rounded-full bg-gray-100 overflow-hidden">
                      <span
                        className="block h-full rounded-full"
                        style={{
                          width: `${(count / maxCount) * 100}%`,
                          background: isCorrect ? CHART.series : CHART.recessive,
                        }}
                      />
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right text-gray-700">
                    {count}{" "}
                    <span className="text-gray-400">
                      (%{fmt(option.percentages[value], 0)})
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right text-gray-700">
                    {option.upperGroup[value]}
                  </td>
                  <td className="px-3 py-2 text-right text-gray-700">
                    {option.lowerGroup[value]}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
