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
    <div className="rounded-xl bg-white/95 shadow-sm border border-gray-100 p-4">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-1 text-xl font-semibold text-gray-800">{value}</div>
      {hint && <div className="mt-1 text-xs text-gray-400">{hint}</div>}
    </div>
  );
}
