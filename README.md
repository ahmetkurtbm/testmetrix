# TestMetrix

TÜBİTAK proje ve soru bankalarını klasörler halinde organize etmeyi, Excel üzerinden toplu veri alışverişi yapmayı ve sonuçları grafik/PDF/Excel raporlarına dönüştürmeyi sağlayan Next.js uygulaması.

## Özellikler

- **Dashboard** — genel durum özeti ve grafiklerle (Recharts) görselleştirilmiş metrikler
- **Klasörleme** — sürükle-bırak (`@hello-pangea/dnd`) ile projeleri/soruları klasörler halinde düzenleme
- **Excel entegrasyonu** — `excel-upload`, `excel-update`, `excel-reports` sayfalarıyla toplu veri içe/dışa aktarma (`exceljs`)
- **PDF raporlama** — `@react-pdf/renderer` ile rapor/test çıktısı üretme
- **Kimlik doğrulama** — NextAuth ile korumalı giriş ve kullanıcıya özel profil sayfası
- **İletişim & bilgilendirme** sayfaları

## Teknoloji Yığını

| Katman | Teknoloji |
|---|---|
| Uygulama | Next.js 15 (App Router), React 18, TypeScript |
| Veri | PostgreSQL + Prisma ORM |
| Kimlik | NextAuth v5 |
| Arayüz | Tailwind CSS, Radix UI, Lucide Icons |
| Raporlama | @react-pdf/renderer, ExcelJS, Recharts |
| Test | Vitest (unit + integration) |

## Kurulum

```bash
npm install
cp .env.example .env.local   # DATABASE_URL ve NextAuth değişkenlerini doldurun
npx prisma migrate deploy
npm run dev                  # http://localhost:3001
```

## Komutlar

```bash
npm run dev        # geliştirme sunucusu (port 3001)
npm run build      # production derlemesi
npm run test       # vitest run
npm run test:int   # entegrasyon testleri
npm run db:deploy  # prisma migrate deploy
```

## Canlı Demo

[tubitak-lake.vercel.app](https://tubitak-lake.vercel.app/)
