import type { DescriptiveStats, FrequencyRow } from "./types";

/**
 * Betimsel istatistikler.
 *
 * Tümü popülasyon formülüyle hesaplanır (n'e bölünür, n-1'e değil) — eski kodla aynı
 * ve KR-20'nin beklediği tanım bu.
 *
 * Eski koddan farklı olarak hiçbir fonksiyon `toFixed()` ile string döndürmez. Eskiden
 * ara sonuçlar iki ondalığa yuvarlanıp sonra tekrar sayıya çevriliyordu; bu hem tip
 * karmaşasına yol açıyordu (`number` deklare edilip `string` dönen fonksiyonlar) hem de
 * zincirleme hesaplarda hassasiyet kaybediyordu. Yuvarlama artık yalnızca gösterim
 * katmanının işi.
 */

export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export function variance(values: number[]): number {
  if (values.length === 0) return 0;
  const m = mean(values);
  return values.reduce((sum, v) => sum + (v - m) ** 2, 0) / values.length;
}

export function stdDeviation(values: number[]): number {
  return Math.sqrt(variance(values));
}

export function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

export function mode(values: number[]): number[] {
  if (values.length === 0) return [];
  const frequency = new Map<number, number>();
  for (const v of values) frequency.set(v, (frequency.get(v) ?? 0) + 1);
  const maxFrequency = Math.max(...frequency.values());
  return [...frequency.entries()]
    .filter(([, count]) => count === maxFrequency)
    .map(([value]) => value)
    .sort((a, b) => a - b);
}

export function range(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.max(...values) - Math.min(...values);
}

/**
 * Çarpıklık katsayısı (g1). n < 3 ya da standart sapma 0 ise tanımsız.
 * Eskiden sd = 0 durumunda NaN dönüyor, çağıran taraf onu 0'a çeviriyordu.
 */
export function skewness(values: number[]): number | null {
  const n = values.length;
  if (n < 3) return null;
  const m = mean(values);
  const sd = stdDeviation(values);
  if (sd === 0) return null;
  return values.reduce((sum, v) => sum + (v - m) ** 3, 0) / (n * sd ** 3);
}

/** Basıklık katsayısı (fazlalık basıklık, g2 − 3). n < 3 ya da sd = 0 ise tanımsız. */
export function kurtosis(values: number[]): number | null {
  const n = values.length;
  if (n < 3) return null;
  const m = mean(values);
  const sd = stdDeviation(values);
  if (sd === 0) return null;
  return values.reduce((sum, v) => sum + ((v - m) / sd) ** 4, 0) / n - 3;
}

/** Bağıl değişkenlik katsayısı (%). Ortalama 0 ise tanımsız. */
export function coefficientOfVariation(values: number[]): number | null {
  const m = mean(values);
  if (m === 0) return null;
  return (stdDeviation(values) / m) * 100;
}

/**
 * Testin toplam başarı yüzdesi.
 *
 * DAVRANIŞ DEĞİŞİKLİĞİ: eski `calculateSuccessRate` paydada
 * `max(scores) × n` kullanıyordu — yani *alınabilecek* en yüksek puan değil, o sınavda
 * fiilen *alınmış* en yüksek puan. Kimse testi tam yapmadığında payda küçülüyor ve başarı
 * yüzdesi olduğundan yüksek çıkıyordu (ör. 20 sorunun en iyisi 10 doğruysa, sınıf
 * ortalaması 5 iken başarı %50 yerine %25 görünmesi gerekirken %50 çıkıyordu).
 * Payda artık madde sayısı × öğrenci sayısı.
 */
export function successRate(
  scores: number[],
  questionCount: number
): number | null {
  if (scores.length === 0 || questionCount <= 0) return null;
  const total = scores.reduce((sum, s) => sum + s, 0);
  return (total / (questionCount * scores.length)) * 100;
}

/** Puan frekans tablosu, puana göre artan sıralı. */
export function frequencyTable(scores: number[]): FrequencyRow[] {
  const frequency = new Map<number, number>();
  for (const s of scores) frequency.set(s, (frequency.get(s) ?? 0) + 1);
  return [...frequency.entries()]
    .sort(([a], [b]) => a - b)
    .map(([score, count]) => ({
      score,
      count,
      percentage: (count / scores.length) * 100,
    }));
}

export function describe(
  scores: number[],
  questionCount: number
): DescriptiveStats {
  return {
    studentCount: scores.length,
    questionCount,
    mean: mean(scores),
    median: median(scores),
    mode: mode(scores),
    min: scores.length ? Math.min(...scores) : null,
    max: scores.length ? Math.max(...scores) : null,
    range: range(scores),
    variance: variance(scores),
    stdDeviation: stdDeviation(scores),
    skewness: skewness(scores),
    kurtosis: kurtosis(scores),
    coefficientVariation: coefficientOfVariation(scores),
    successRate: successRate(scores, questionCount),
  };
}
