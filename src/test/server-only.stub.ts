/**
 * `server-only` paketinin test ortamı karşılığı.
 *
 * Paket, `react-server` export koşuluna göre iki farklı dosya sunar; vitest bu
 * koşulu uygulamadığı için "Client Component'ten import edilemez" hatası veren
 * sürüme düşüyor. Testlerde davranışsal bir karşılığı olmadığından boş modüle
 * yönlendiriliyor (bkz. vitest.int.config.ts).
 */
export {};
