import { mean, stdDeviation } from "./descriptive";
import type { ExamData, StudentStats } from "./types";

/**
 * n × k ikili matris: doğru yanıt 1, yanlış veya boş 0.
 * Diğer madde hesaplarının tamamı bunun üzerine kurulur.
 */
export function toBinaryMatrix({ answerKey, responses }: ExamData): number[][] {
  return responses.map((row) =>
    answerKey.map((correct, j) => (row[j] === correct ? 1 : 0))
  );
}

/** Her öğrencinin doğru yanıt sayısı. */
export function scoresOf(binaryMatrix: number[][]): number[] {
  return binaryMatrix.map((row) => row.reduce((sum, v) => sum + v, 0));
}

/** 100 üzerinden puan. Madde sayısı 0 ise tüm puanlar 0. */
export function pointsOf(scores: number[], questionCount: number): number[] {
  if (questionCount <= 0) return scores.map(() => 0);
  return scores.map((s) => s * (100 / questionCount));
}

/** Doğru oranı (0–1). */
export function successRatesOf(
  scores: number[],
  questionCount: number
): number[] {
  if (questionCount <= 0) return scores.map(() => 0);
  return scores.map((s) => s / questionCount);
}

/** Z puanları. Standart sapma 0 ise (tüm puanlar eşit) tanımsız. */
export function zScoresOf(scores: number[]): (number | null)[] {
  const m = mean(scores);
  const sd = stdDeviation(scores);
  if (sd === 0) return scores.map(() => null);
  return scores.map((s) => (s - m) / sd);
}

/** T puanları: 50 + 10z. */
export function tScoresOf(zScores: (number | null)[]): (number | null)[] {
  return zScores.map((z) => (z === null ? null : 50 + 10 * z));
}

/**
 * Başarı sıraları. Eşit puan alan öğrenciler eşit sıra alır (competition ranking):
 * 10, 8, 8, 5 puanları → 1, 2, 2, 4.
 *
 * Eski `calculateRanks` sıralı diziyi `sortedScores[indexOf(score)] = null` diyerek
 * tahrip ederek ilerliyordu. `indexOf` her çağrıda baştan aradığı için eşit puanlarda
 * yanlış sıra üretiyor, dizi `null`'larla dolduğu için sonraki aramalar da kayıyordu.
 * Burada sıra doğrudan "kaç kişi bu puandan yüksek" sayılarak bulunuyor.
 */
export function ranksOf(scores: number[]): number[] {
  return scores.map(
    (score) => scores.filter((other) => other > score).length + 1
  );
}

export function computeStudentStats(
  binaryMatrix: number[][],
  questionCount: number
): StudentStats {
  const scores = scoresOf(binaryMatrix);
  const zScores = zScoresOf(scores);
  return {
    scores,
    points: pointsOf(scores, questionCount),
    successRates: successRatesOf(scores, questionCount),
    zScores,
    tScores: tScoresOf(zScores),
    ranks: ranksOf(scores),
  };
}
