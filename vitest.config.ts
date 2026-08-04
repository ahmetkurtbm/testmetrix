import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      // tsconfig.json'daki `@/*` → `./src/*` eşlemesinin vitest karşılığı.
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      // `server-only` paketi react-server export koşuluna göre iki farklı
      // dosya sunuyor; vitest bu koşulu uygulamadığı için "Client
      // Component'ten import edilemez" hatası veren sürüme düşüyor.
      "server-only": fileURLToPath(
        new URL("./src/test/server-only.stub.ts", import.meta.url)
      ),
    },
  },
  test: {
    include: ["src/**/*.{test,spec}.ts"],
    // Entegrasyon testleri veritabanı gerektirir; ayrı konfigürasyonla çalışır.
    exclude: ["**/node_modules/**", "src/**/*.int.test.ts"],
  },
});
