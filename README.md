# TestMetrix

Öğretmenler için sınav madde analizi uygulaması. Cevap anahtarı ve öğrenci cevaplarını içeren
Excel dosyası yüklenir; uygulama madde güçlüğünü, ayırt ediciliği, güvenirliği ve öğrenci
puanlarını hesaplayıp grafik, Excel ve PDF raporları üretir.

**Canlı demo:** [testmetrix.vercel.app](https://testmetrix.vercel.app/) (tanıtım sayfasında giriş yapmadan örnek sınavla denenebilir)

## Özellikler

- **Madde analizi:** p (güçlük) değeri, üst-alt %27 ayırt edicilik indeksi, biserial ve point-biserial korelasyon, madde güvenirlik indeksi
- **Güvenirlik:** KR-20 ve KR-21; hesaplanamayan durumlar (tek madde, sıfır varyans) sıfır değil "belirsiz" gösterilir
- **Çeldirici analizi:** her madde için seçenek dağılımı, üst ve alt grupta ayrı ayrı
- **Öğrenci raporları:** puan, başarı yüzdesi, Z ve T puanı, eşit puanlara eşit sıra
- **Betimsel istatistik:** ortalama, ortanca, mod, ranj, varyans, standart sapma, çarpıklık, basıklık
- **Dışa aktarma:** Excel raporları ve grafikli PDF
- **Klasörler:** sınavları sürükle-bırak ile sıralanan klasörlerde düzenleme; yüklenen sınavı düzenleme ekranında güncelleme
- **Hesaplar:** e-posta/şifre ve Google ile giriş, şifre sıfırlama, profil ve hesap silme; her öğretmen yalnızca kendi sınavlarını görür

## Excel biçimi

İlk satır cevap anahtarıdır (`Cevap_Anahtarı`, ardından her soru için A–E), sonraki her satır
bir öğrencidir (ad, ardından cevaplar). Boş bırakılan cevap için hücre boş bırakılır ya da `-`
yazılır. Cevap anahtarında boş veya geçersiz soru varsa dosya reddedilir. Örnek: [`public/sample.xlsx`](public/sample.xlsx).

## Teknoloji

| Katman | Teknoloji |
|---|---|
| Uygulama | Next.js 15 (App Router), React 18, TypeScript |
| Veri | PostgreSQL (Supabase) + Prisma 7 |
| Kimlik | Auth.js v5 (e-posta/şifre + Google), bcrypt, Resend ile şifre sıfırlama |
| Arayüz | Tailwind CSS, Radix UI, Recharts |
| Raporlama | ExcelJS, @react-pdf/renderer |
| Test | Vitest (birim + entegrasyon) |

## Güvenlik

- Kayda erişim yalnızca `src/features/exams/data.ts` üzerinden; sahiplik koşulu her sorguya gömülü, başkasının kaydı "bulunamadı" döner
- Route koruması middleware'de ve varsayılan olarak her şey korumalı
- Rol istemciden okunmaz; `ADMIN_EMAILS` yalnızca Google'ın doğruladığı e-postayla girişte uygulanır
- Excel normalizasyonu sunucuda yapılır, istemcinin gönderdiği biçime güvenilmez
- 5 hatalı girişte hesap 15 dakika kilitlenir; sıfırlama token'ları hash'lenerek saklanır ve 30 dakika geçerlidir

## Kurulum

```bash
npm install
cp .env.example .env.local   # veritabanı, AUTH_SECRET ve isteğe bağlı Google/Resend
npm run db:deploy            # migration'ları uygular
npm run dev                  # http://localhost:3001
```

## Komutlar

```bash
npm run dev        # geliştirme sunucusu (port 3001)
npm run build      # production derlemesi
npm test           # birim testleri
npm run test:int   # veritabanı gerektiren entegrasyon testleri
npm run db:deploy  # prisma migrate deploy
```
