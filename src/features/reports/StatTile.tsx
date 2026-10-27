/**
 * KPI kutusu.
 *
 * Tek bir değer için grafik çizilmez: tek çubuklu bir grafik yerine sayının
 * kendisi gösterilir.
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
    <div className="rounded-xl border border-gray-200 bg-surface p-5">
      <div className="text-sm font-medium text-gray-500">{label}</div>
      <div className="mt-1.5 font-display text-3xl font-semibold tabular-nums text-gray-900">{value}</div>
      {hint && <div className="mt-1 text-sm text-gray-500">{hint}</div>}
    </div>
  );
}
