import { upperLowerGroups } from "./groups";
import {
  ANSWER_OPTIONS,
  type AnswerOption,
  type ExamData,
  type OptionDistribution,
} from "./types";

function emptyCounts(): Record<AnswerOption, number> {
  return { A: 0, B: 0, C: 0, D: 0, E: 0, BOS: 0 };
}

function countOptions(
  responses: AnswerOption[][],
  indices: number[],
  questionIndex: number
): Record<AnswerOption, number> {
  const counts = emptyCounts();
  for (const i of indices) {
    const answer = responses[i]?.[questionIndex];
    if (answer) counts[answer]++;
  }
  return counts;
}

/**
 * Madde başına seçenek dağılımı ve üst/alt %27 grupların bu seçeneklere dağılımı.
 *
 * Çeldirici analizi için kullanılır: doğru yanıtı üst grubun, çeldiricileri alt grubun
 * daha çok işaretlemesi beklenir.
 *
 * Eski kodda bu hesap iki parçaya bölünmüştü — genel sayımlar `excel-reports` sayfasında
 * (`calculateOptionsCount`), üst/alt grup dağılımı ise `OptionAnalysis.tsx` bileşeninin
 * içinde. İkincisi öğrenci yanıtlarına `studentAnswers[i][questionIndex + 1]` diye
 * erişiyordu; yani ham matrisin isim sütununu telafi eden `+ 1` bileşenin içine
 * sızmıştı. Artık ayrıştırma tek yerde, bileşen sadece hazır veriyi yazdırıyor.
 */
export function computeOptionDistributions(
  data: ExamData,
  scores: number[]
): OptionDistribution[] {
  const { responses, answerKey } = data;
  const allIndices = responses.map((_, i) => i);
  const groups = upperLowerGroups(scores);

  return answerKey.map((_, j) => {
    const counts = countOptions(responses, allIndices, j);
    const total = responses.length;

    const percentages = emptyCounts();
    if (total > 0) {
      for (const option of ANSWER_OPTIONS) {
        percentages[option] = (counts[option] / total) * 100;
      }
    }

    return {
      questionNo: j + 1,
      counts,
      total,
      percentages,
      upperGroup: groups ? countOptions(responses, groups.upper, j) : emptyCounts(),
      lowerGroup: groups ? countOptions(responses, groups.lower, j) : emptyCounts(),
      groupSize: groups?.groupSize ?? 0,
    };
  });
}
