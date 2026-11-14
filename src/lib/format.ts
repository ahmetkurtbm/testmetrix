/**
 * Gösterim biçimlendirme.
 *
 * Tek kural: hesaplanamayan değer "—" olarak gösterilir, asla 0 olarak değil.
 * Eski sürümde NaN'lar 0'a çevriliyordu ve "güvenirlik sıfır" gibi okunuyordu.
 */
export function fmt(value: number | null | undefined, digits = 2): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  return numberFormat(digits).format(value);
}

// Türkçe ondalık ayırıcı virgüldür ("0,84"); ekranda her sayı aynı biçimde görünsün.
const formats = new Map<number, Intl.NumberFormat>();
function numberFormat(digits: number) {
  let format = formats.get(digits);
  if (!format) {
    format = new Intl.NumberFormat("tr-TR", { minimumFractionDigits: digits, maximumFractionDigits: digits });
    formats.set(digits, format);
  }
  return format;
}

/** Tarihi kısa Türkçe biçimde verir. */
export function fmtDate(value: string | Date): string {
  return new Date(value).toLocaleDateString("tr", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
