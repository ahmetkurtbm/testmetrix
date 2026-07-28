/**
 * Üst ve alt %27 grupları.
 *
 * Eski kodda bu hesap iki ayrı yerde, iki farklı şekilde yapılıyordu:
 *   - `calculateDiscriminationIndexForAll`  → `Math.ceil(n * 0.27)`
 *   - `OptionAnalysis.calculateAnalysisData` → `Math.round(n * 0.27)`
 * Aynı raporun iki bölümü farklı grup büyüklüğü kullanıyordu (ör. n = 15 için biri 5,
 * diğeri 4 kişi). Burada tek bir tanım var ve iki taraf da onu kullanıyor.
 *
 * DAVRANIŞ DEĞİŞİKLİĞİ: ayırt edicilik indeksi artık `ceil` yerine `round` kullanıyor;
 * bazı öğrenci sayılarında indeks değerleri eskisinden farklı çıkacak.
 */
export interface Groups {
  /** Puanı en yüksek %27'lik dilimdeki öğrencilerin indeksleri. */
  upper: number[];
  /** Puanı en düşük %27'lik dilimdeki öğrencilerin indeksleri. */
  lower: number[];
  groupSize: number;
}

export function upperLowerGroups(scores: number[]): Groups | null {
  const n = scores.length;
  // n < 2'de üst ve alt grup aynı öğrenciyi işaret eder; karşılaştırma anlamsız.
  if (n < 2) return null;

  const groupSize = Math.min(Math.max(1, Math.round(n * 0.27)), Math.floor(n / 2));

  const byScoreDesc = scores
    .map((score, index) => ({ score, index }))
    .sort((a, b) => b.score - a.score)
    .map((item) => item.index);

  return {
    upper: byScoreDesc.slice(0, groupSize),
    lower: byScoreDesc.slice(n - groupSize),
    groupSize,
  };
}
