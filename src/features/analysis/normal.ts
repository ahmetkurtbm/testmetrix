/**
 * Normal dağılım yardımcıları.
 *
 * Eski kodda biserial korelasyon (rbis) için 99 satırlık bir `pToO` lookup tablosu vardı:
 * p değeri 0.01–0.99 arası iki ondalığa yuvarlanıp tablodan normal eğri ordinatı okunuyordu.
 * Tabloda "0.00" ve "1.00" anahtarları yoktu; bir maddeyi kimse doğru yapmadığında ya da
 * herkes doğru yaptığında `undefined` dönüp sonuç NaN oluyordu.
 *
 * Burada ordinat analitik hesaplanıyor: y = φ(Φ⁻¹(p)). Tabloyla aynı değerleri üretir
 * (φ(Φ⁻¹(0.50)) = 0.3989 ≈ 0.399, φ(Φ⁻¹(0.10)) = 0.1755 ≈ 0.176) ama deliksiz ve
 * yuvarlama kaybı olmadan.
 */

const SQRT_2PI = Math.sqrt(2 * Math.PI);

/** Standart normal olasılık yoğunluğu φ(z). */
export function normalPdf(z: number): number {
  return Math.exp(-0.5 * z * z) / SQRT_2PI;
}

// Peter Acklam'ın ters normal CDF yaklaşımı. Bağıl hata < 1.15e-9.
const A = [
  -3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2,
  1.38357751867269e2, -3.066479806614716e1, 2.506628277459239,
];
const B = [
  -5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2,
  6.680131188771972e1, -1.328068155288572e1,
];
const C = [
  -7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838,
  -2.549732539343734, 4.374664141464968, 2.938163982698783,
];
const D = [
  7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996,
  3.754408661907416,
];

const P_LOW = 0.02425;
const P_HIGH = 1 - P_LOW;

/**
 * Ters standart normal CDF (probit): Φ⁻¹(p).
 * p ∈ (0, 1) aralığında tanımlı; sınırlarda ±Infinity döner.
 */
export function probit(p: number): number {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;

  if (p < P_LOW) {
    const q = Math.sqrt(-2 * Math.log(p));
    return (
      (((((C[0] * q + C[1]) * q + C[2]) * q + C[3]) * q + C[4]) * q + C[5]) /
      ((((D[0] * q + D[1]) * q + D[2]) * q + D[3]) * q + 1)
    );
  }

  if (p > P_HIGH) {
    const q = Math.sqrt(-2 * Math.log(1 - p));
    return (
      -(((((C[0] * q + C[1]) * q + C[2]) * q + C[3]) * q + C[4]) * q + C[5]) /
      ((((D[0] * q + D[1]) * q + D[2]) * q + D[3]) * q + 1)
    );
  }

  const q = p - 0.5;
  const r = q * q;
  return (
    ((((((A[0] * r + A[1]) * r + A[2]) * r + A[3]) * r + A[4]) * r + A[5]) * q) /
    (((((B[0] * r + B[1]) * r + B[2]) * r + B[3]) * r + B[4]) * r + 1)
  );
}

/**
 * Normal eğrinin, alanı p ve 1-p olarak bölen noktasındaki ordinatı.
 * Biserial korelasyonun paydasında kullanılır.
 * p 0 veya 1 ise bölme noktası yoktur; `null` döner (eski kodda NaN oluyordu).
 */
export function normalOrdinateAt(p: number): number | null {
  if (!Number.isFinite(p) || p <= 0 || p >= 1) return null;
  return normalPdf(probit(p));
}
