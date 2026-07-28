/**
 * Gösterim biçimlendirme.
 *
 * Tek kural: hesaplanamayan değer "—" olarak gösterilir, asla 0 olarak değil.
 * Eski sürümde NaN'lar 0'a çevriliyordu ve "güvenirlik sıfır" gibi okunuyordu.
 */
export function fmt(value: number | null | undefined, digits = 2): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  return value.toFixed(digits);
}

/** Tarihi kısa Türkçe biçimde verir. */
export function fmtDate(value: string | Date): string {
  return new Date(value).toLocaleDateString("tr", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
