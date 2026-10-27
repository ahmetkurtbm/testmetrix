/**
 * Grafik renkleri ve ortak stiller.
 *
 * Madde kalitesi bilerek kırmızı/yeşil ile KODLANMIYOR: o çift renk körlüğünün
 * en yaygın türünde (deuteranopi) birbirinden ayırt edilemiyor. Onun yerine
 * "vurgu" deseni var — her şey tek renk, dikkat isteyen maddeler turuncu ve
 * ayrıca etiketli. Mavi/turuncu çifti bu ölçüte göre seçildi.
 */
// Değerler globals.css'teki `--viz-*` değişkenleri; açık/koyu temada kendiliğinden değişir.
export const CHART = {
  series: "var(--viz-series)",
  seriesSoft: "var(--viz-series-soft)",
  accent: "var(--viz-accent)",
  accentSoft: "var(--viz-accent-soft)",
  recessive: "var(--viz-recessive)",
  grid: "var(--viz-grid)",
  axis: "var(--viz-axis)",
  muted: "var(--viz-text-muted)",
  secondary: "var(--viz-text-secondary)",
  surface: "var(--viz-surface)",
  tooltip: {
    fontSize: 12,
    borderRadius: 8,
    border: "1px solid var(--viz-grid)",
    backgroundColor: "var(--viz-surface)",
    color: "var(--viz-text)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
  } as const,
} as const;
