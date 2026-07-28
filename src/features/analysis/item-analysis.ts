import { stdDeviation } from "./descriptive";
import { upperLowerGroups } from "./groups";
import { normalOrdinateAt } from "./normal";
import type { ItemStats } from "./types";

/** Bir maddenin ikili puanlarını (0/1) matristen çeker. */
function itemColumn(binaryMatrix: number[][], questionIndex: number): number[] {
  return binaryMatrix.map((row) => row[questionIndex] ?? 0);
}

/**
 * Madde güçlük indeksi (p): maddeyi doğru yanıtlayanların oranı.
 * Yüksek p = kolay madde.
 */
export function difficultyOf(binaryMatrix: number[][]): number[] {
  const n = binaryMatrix.length;
  if (n === 0) return [];
  const k = binaryMatrix[0]?.length ?? 0;
  return Array.from({ length: k }, (_, j) => {
    const column = itemColumn(binaryMatrix, j);
    return column.reduce((sum, v) => sum + v, 0) / n;
  });
}

/**
 * Madde varyansı. İkili değişkende varyans p(1−p)'ye eşittir; eski kod uzun yoldan
 * (her madde için ortalamadan sapmaların karesi) hesaplıyordu — sonuç aynı.
 *
 * Not: eski kod varyansı `.toFixed(2)` ile yuvarlayıp *string* olarak döndürüyor,
 * standart sapmayı da bu **yuvarlanmış** değerin karekökünden alıyordu. Bu yüzden madde
 * standart sapmaları hafif kaymış çıkıyordu. Artık ara yuvarlama yok.
 */
export function itemVarianceOf(difficulty: number[]): number[] {
  return difficulty.map((p) => p * (1 - p));
}

export function itemStdDeviationOf(difficulty: number[]): number[] {
  return itemVarianceOf(difficulty).map((v) => Math.sqrt(v));
}

/**
 * Ayırt edicilik indeksi: üst %27 grubun doğru oranı − alt %27 grubun doğru oranı.
 * Öğrenci sayısı 2'den azsa grup oluşturulamaz, tüm maddeler için 0 döner.
 */
export function discriminationOf(
  binaryMatrix: number[][],
  scores: number[]
): number[] {
  const k = binaryMatrix[0]?.length ?? 0;
  const groups = upperLowerGroups(scores);
  if (!groups) return Array.from({ length: k }, () => 0);

  const { upper, lower } = groups;
  const groupMean = (indices: number[], j: number) =>
    indices.reduce((sum, i) => sum + (binaryMatrix[i]?.[j] ?? 0), 0) /
    indices.length;

  return Array.from({ length: k }, (_, j) => groupMean(upper, j) - groupMean(lower, j));
}

/**
 * Madde-toplam korelasyonları.
 *
 * point-biserial:  r_pbis = ((M₁ − M₀) / σ) · √(pq)
 * biserial:        r_bis  = ((M₁ − M₀) / σ) · (pq / y),  y = normal eğri ordinatı
 *
 * M₁ maddeyi doğru yanıtlayanların, M₀ yanlış yanıtlayanların test ortalaması.
 *
 * p = 0 veya p = 1 olan maddelerde gruplardan biri boştur, korelasyon tanımsızdır →
 * `null`. Eski kod bu durumda `pToO` tablosunda karşılık bulamayıp NaN üretiyordu.
 * Aynı şekilde tüm puanlar eşitse (σ = 0) korelasyon tanımsızdır.
 */
export function correlationsOf(
  binaryMatrix: number[][],
  scores: number[],
  difficulty: number[]
): { rbis: (number | null)[]; prbis: (number | null)[] } {
  const sigma = stdDeviation(scores);
  const k = difficulty.length;

  const rbis: (number | null)[] = [];
  const prbis: (number | null)[] = [];

  for (let j = 0; j < k; j++) {
    const p = difficulty[j];
    const q = 1 - p;

    if (sigma === 0 || p <= 0 || p >= 1) {
      rbis.push(null);
      prbis.push(null);
      continue;
    }

    const column = itemColumn(binaryMatrix, j);
    let sumCorrect = 0;
    let countCorrect = 0;
    let sumIncorrect = 0;
    let countIncorrect = 0;

    column.forEach((value, i) => {
      if (value === 1) {
        sumCorrect += scores[i];
        countCorrect++;
      } else {
        sumIncorrect += scores[i];
        countIncorrect++;
      }
    });

    const meanCorrect = sumCorrect / countCorrect;
    const meanIncorrect = sumIncorrect / countIncorrect;
    const standardizedDiff = (meanCorrect - meanIncorrect) / sigma;

    prbis.push(standardizedDiff * Math.sqrt(p * q));

    const ordinate = normalOrdinateAt(p);
    rbis.push(ordinate === null ? null : standardizedDiff * ((p * q) / ordinate));
  }

  return { rbis, prbis };
}

/**
 * Madde güvenirlik indeksi: r_pbis × s_madde
 *
 * DAVRANIŞ DEĞİŞİKLİĞİ: eski `calculateReliabilityIndexForAll`
 * `Math.sqrt(variance) × itemStdDev` hesaplıyordu. itemStdDev zaten √variance olduğu için
 * bu çarpım sadeleşip **madde varyansının kendisine** eşit oluyordu; yani "güvenirlik
 * indeksi" sütunu aslında varyans sütununun bir kopyasıydı. Standart tanım
 * (madde-toplam korelasyonu × madde standart sapması) uygulandı.
 */
export function reliabilityIndexOf(
  prbis: (number | null)[],
  itemStdDev: number[]
): (number | null)[] {
  return prbis.map((r, j) => (r === null ? null : r * itemStdDev[j]));
}

export function computeItemStats(
  binaryMatrix: number[][],
  scores: number[]
): ItemStats {
  const n = binaryMatrix.length;
  const difficulty = difficultyOf(binaryMatrix);
  const itemStdDev = itemStdDeviationOf(difficulty);
  const { rbis, prbis } = correlationsOf(binaryMatrix, scores, difficulty);

  return {
    difficulty,
    correctCount: difficulty.map((p) => Math.round(p * n)),
    correctPercentage: difficulty.map((p) => p * 100),
    variance: itemVarianceOf(difficulty),
    stdDeviation: itemStdDev,
    discrimination: discriminationOf(binaryMatrix, scores),
    rbis,
    prbis,
    reliabilityIndex: reliabilityIndexOf(prbis, itemStdDev),
  };
}
