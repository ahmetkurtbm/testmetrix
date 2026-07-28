import { parseExamMatrix } from "../parse";

/**
 * Elle doğrulanmış referans sınav: 4 öğrenci, 5 madde.
 *
 *   anahtar   A B C D E
 *   Ayşe      A B C D E   → 5 doğru
 *   Berk      A B C D A   → 4 doğru
 *   Ceren     A B C A A   → 3 doğru
 *   Deniz     A A A A A   → 1 doğru
 *
 * Beklenen değerler (elle hesaplandı):
 *   puanlar        [5, 4, 3, 1]
 *   ortalama       3.25
 *   varyans        2.1875
 *   güçlük (p)     [1, 0.75, 0.75, 0.5, 0.25]   → toplamı ortalamaya eşit ✓
 *   Σpq            0.8125
 *   KR-20          (5/4)(1 − 0.8125/2.1875) = 0.785714…
 *   KR-21          (5/4)(1 − 5.6875/10.9375)  = 0.6
 *   başarı yüzdesi 13 / (5×4) = %65
 *
 * 1. madde bilerek p = 1 seçildi: eski `pToO` tablosunda "1.00" anahtarı olmadığı için
 * biserial korelasyon NaN üretiyordu. Artık `null` dönmeli.
 */
export const REFERENCE_MATRIX: unknown[][] = [
  ["Cevap Anahtarı", "A", "B", "C", "D", "E"],
  ["Ayşe", "A", "B", "C", "D", "E"],
  ["Berk", "A", "B", "C", "D", "A"],
  ["Ceren", "A", "B", "C", "A", "A"],
  ["Deniz", "A", "A", "A", "A", "A"],
];

export const referenceExam = parseExamMatrix(REFERENCE_MATRIX);

export const EXPECTED = {
  scores: [5, 4, 3, 1],
  mean: 3.25,
  variance: 2.1875,
  difficulty: [1, 0.75, 0.75, 0.5, 0.25],
  kr20: 0.7857142857142857,
  kr21: 0.6,
  successRate: 65,
};
