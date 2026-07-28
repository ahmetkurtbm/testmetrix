import "dotenv/config";
import { defineConfig } from "prisma/config";

// Migration'lar session pooler (:5432) üzerinden DIRECT_URL ile çalışır.
// Çalışma zamanı bağlantısı ayrı: DATABASE_URL + PrismaPg adapter (src/lib/prisma.ts).
//
// NOT: Burada bilerek `env("DIRECT_URL")` yardımcısı KULLANILMIYOR. O yardımcı,
// değişken tanımsızsa config yüklenirken hata fırlatıyor — ve config her Prisma
// komutunda yükleniyor. `prisma generate` veritabanına hiç bağlanmadığı halde
// build sırasında DIRECT_URL yokluğunda patlıyordu (Vercel build hatası).
// Düz `process.env` ile okununca generate env'siz de çalışır; bağlantı gerçekten
// gerektiğinde (`migrate deploy`) Prisma zaten anlaşılır bir hata verir.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DIRECT_URL ?? "",
  },
});
