import { describe, frequencyTable } from "./descriptive";
import { computeItemStats } from "./item-analysis";
import { computeOptionDistributions } from "./option-analysis";
import { computeReliability } from "./reliability";
import { computeStudentStats, toBinaryMatrix } from "./scoring";
import type { ExamAnalysis, ExamData } from "./types";

export * from "./types";
export { parseExamMatrix, normalizeAnswer } from "./parse";
export { upperLowerGroups } from "./groups";
export { probit, normalPdf, normalOrdinateAt } from "./normal";

/**
 * Bir sınavın tüm psikometrik analizini tek seferde üretir.
 *
 * Saf fonksiyon: React yok, ağ isteği yok, global durum yok. Hem tarayıcıda rapor
 * sayfası hem sunucuda `examStat`/`itemStat` önbelleğini doldurmak için aynı kod
 * kullanılır.
 *
 * Hesaplanamayan değerler `null` döner (tek soruluk test, tek öğrenci, tüm puanların
 * eşit olması gibi durumlar). Eski kod bu durumlarda NaN üretip çağıran tarafta 0'a
 * çeviriyordu — "hesaplanamadı" ile "sıfır" ayırt edilemiyordu.
 */
export function analyzeExam(data: ExamData): ExamAnalysis {
  const questionCount = data.answerKey.length;
  const binaryMatrix = toBinaryMatrix(data);

  const students = computeStudentStats(binaryMatrix, questionCount);
  const descriptive = describe(students.scores, questionCount);
  const items = computeItemStats(binaryMatrix, students.scores);

  return {
    descriptive,
    reliability: computeReliability(
      items.difficulty,
      descriptive.mean,
      descriptive.variance,
      questionCount
    ),
    students,
    items,
    options: computeOptionDistributions(data, students.scores),
    frequency: frequencyTable(students.scores),
    binaryMatrix,
  };
}
