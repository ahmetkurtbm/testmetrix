import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// Migration'lar session pooler (:5432) üzerinden DIRECT_URL ile çalışır.
// Çalışma zamanı bağlantısı ayrı: DATABASE_URL + PrismaPg adapter (src/lib/prisma.ts).
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DIRECT_URL"),
  },
});
