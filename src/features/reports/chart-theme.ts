/**
 * Grafik renkleri ve ortak stiller.
 *
 * Madde kalitesi bilerek kırmızı/yeşil ile KODLANMIYOR: o çift renk körlüğünün
 * en yaygın türünde (deuteranopi) birbirinden ayırt edilemiyor. Onun yerine
 * "vurgu" deseni var — her şey tek renk, dikkat isteyen maddeler turuncu ve
 * ayrıca etiketli. Mavi/turuncu çifti bu ölçüte göre seçildi.
 */
export const CHART = {
  series: "#2a78d6",
  seriesSoft: "#cde2fb",
  accent: "#eb6834",
  accentSoft: "#fbe3d8",
  recessive: "#c3c2b7",
  grid: "#e5e7eb",
  axis: "#d1d5db",
  muted: "#6b7280",
  secondary: "#4b5563",
  tooltip: {
    fontSize: 12,
    borderRadius: 8,
    border: "1px solid #e5e7eb",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  } as const,
} as const;
