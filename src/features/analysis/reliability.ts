import type { ReliabilityStats } from "./types";

/**
 * KR-20 güvenirlik katsayısı:  (k / (k−1)) · (1 − Σpq / σ²)
 *
 * @param difficulty her maddenin doğru yanıtlanma oranı (p), 0–1 arası
 * @param totalVariance test puanlarının varyansı (σ²)
 *
 * Eski `calculateKR20` iki koruma eksiğiyle çalışıyordu:
 *  - `k = 1` olduğunda `k/(k−1)` sıfıra bölünüp Infinity üretiyordu
 *  - tüm öğrenciler aynı puanı aldığında σ² = 0 olup sonuç Infinity/NaN oluyordu
 * Her ikisi de çağıran tarafta `isNaN(...) ? 0 : ...` ile sessizce **0**'a çevriliyordu;
 * yani "hesaplanamadı" durumu raporda "güvenirlik sıfır" gibi görünüyordu. Artık `null`.
 *
 * Ayrıca eskiden p değerleri `.toFixed(2)` ile yüzdelik *string*'e çevrilip tekrar
 * 100'e bölünerek geliyordu; burada doğrudan sayısal oran alınıyor.
 */
export function kr20(
  difficulty: number[],
  totalVariance: number
): number | null {
  const k = difficulty.length;
  if (k < 2 || totalVariance <= 0) return null;

  const sumPQ = difficulty.reduce((sum, p) => sum + p * (1 - p), 0);
  return (k / (k - 1)) * (1 - sumPQ / totalVariance);
}

/**
 * KR-21 güvenirlik katsayısı:  (k / (k−1)) · (1 − M(k−M) / (k·σ²))
 *
 * Not: eski koddaki `// düzeltilecek` yorumuna rağmen formülün kendisi doğruydu —
 * kontrol edildi, standart KR-21 ile birebir aynı. Yalnızca k < 2 ve σ² = 0
 * korumaları eksikti.
 *
 * @param meanScore ortalama doğru sayısı (M)
 * @param totalVariance test puanlarının varyansı (σ²)
 * @param questionCount madde sayısı (k)
 */
export function kr21(
  meanScore: number,
  totalVariance: number,
  questionCount: number
): number | null {
  const k = questionCount;
  if (k < 2 || totalVariance <= 0) return null;

  return (k / (k - 1)) * (1 - (meanScore * (k - meanScore)) / (k * totalVariance));
}

export function computeReliability(
  difficulty: number[],
  meanScore: number,
  totalVariance: number,
  questionCount: number
): ReliabilityStats {
  return {
    kr20: kr20(difficulty, totalVariance),
    kr21: kr21(meanScore, totalVariance, questionCount),
  };
}
