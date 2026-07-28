/**
 * SVG grafik yardımcıları.
 *
 * Grafikler hazır kütüphane yerine satır içi SVG olarak yazıldı: gereken mark
 * özellikleri (4px yuvarlatılmış veri ucu, tabanda kare köşe, 2px yüzey boşluğu,
 * hairline ızgara) Chart.js'te zahmetliyken burada doğrudan ifade ediliyor.
 * Ayrıca ~170 kB bağımlılık düştü.
 */

/**
 * Dikey sütun yolu: üst köşeler yuvarlatılmış, taban kare.
 *
 * Kılavuz kuralı — veri ucu yuvarlak, taban çizgisine oturan kenar düz. Sütun
 * yarıçaptan kısaysa yarıçap küçültülür, yoksa yol kendi üstüne kıvrılır.
 */
export function columnPath(
  x: number,
  y: number,
  width: number,
  height: number,
  radius = 4
): string {
  if (height <= 0) return "";
  const r = Math.min(radius, width / 2, height);
  return [
    `M ${x} ${y + height}`,
    `L ${x} ${y + r}`,
    `Q ${x} ${y} ${x + r} ${y}`,
    `L ${x + width - r} ${y}`,
    `Q ${x + width} ${y} ${x + width} ${y + r}`,
    `L ${x + width} ${y + height}`,
    "Z",
  ].join(" ");
}

/**
 * Eksen için okunur aralıklar üretir (0, 5, 10 gibi).
 *
 * `integerOnly`, sayım ekseni için: küçük veri setlerinde adım 0.5 çıkıp
 * eksende "0.5 öğrenci" yazıyordu. Sayımlar kesirli olamaz.
 */
export function niceTicks(max: number, count = 4, integerOnly = false): number[] {
  if (max <= 0) return [0];
  const rawStep = max / count;
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const normalized = rawStep / magnitude;
  let step =
    (normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10) * magnitude;

  if (integerOnly) step = Math.max(1, Math.round(step));

  const ticks: number[] = [];
  for (let value = 0; value <= max + step / 2; value += step) {
    ticks.push(Number(value.toFixed(10)));
  }
  return ticks;
}

// Biçimlendirme tüm ekranlarda ortak; buradan yeniden dışa aktarılıyor ki
// grafik bileşenleri tek bir yerden import etsin.
export { fmt } from "@/lib/format";
