import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/**
 * Entegrasyon testleri: gerçek veritabanına bağlanır, bu yüzden varsayılan
 * `npm test` çalıştırmasının dışında tutulur (`npm run test:int` ile çalışır).
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "server-only": fileURLToPath(
        new URL("./src/test/server-only.stub.ts", import.meta.url)
      ),
    },
  },
  test: {
    include: ["src/**/*.int.test.ts"],
    testTimeout: 30_000,
    hookTimeout: 30_000,
    fileParallelism: false,
  },
});
