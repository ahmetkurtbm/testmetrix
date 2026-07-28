/**
 * KPI kutusu.
 *
 * Tek bir değer için grafik çizilmez — kılavuzun "is it even a chart?" kuralı:
 * tek güncel değer stat tile ile verilir, tek çubuklu grafik ile değil.
 */
export function StatTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border border-black/5 dark:border-white/10 bg-[var(--viz-surface-raised)] p-4">
      <div className="text-xs text-[var(--viz-text-secondary)]">{label}</div>
      {/* Büyük tek sayıda orantılı rakam kullanılıyor; tabular-nums yalnızca
          dikey hizalanan tablo sütunlarında. */}
      <div className="mt-1 text-2xl font-semibold text-[var(--viz-text)]">{value}</div>
      {hint && (
        <div className="mt-1 text-xs text-[var(--viz-text-muted)]">{hint}</div>
      )}
    </div>
  );
}
