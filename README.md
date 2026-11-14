# TestMetrix

Öğretmenler için sınav madde analizi uygulaması. Cevap anahtarı ve öğrenci cevaplarını içeren
Excel dosyası yüklenir; uygulama madde güçlüğünü, ayırt ediciliği, güvenirliği ve öğrenci
puanlarını hesaplayıp grafik, Excel ve PDF raporları üretir.

**Canlı demo:** [testmetrix.vercel.app](https://testmetrix.vercel.app/) (tanıtım sayfasında giriş yapmadan örnek sınavla denenebilir)

## Hangi sorunu çözüyor

**Sorun.** Öğretmenler sınav sonrası madde analizini ya hiç yapmaz ya da Excel'de elle formüllerle yapar. Hangi sorunun fazla zor ya da ayırt edici olmadığı, cevap anahtarında hata olup olmadığı, hangi çeldiricinin işe yaramadığı görülmez. Bu işi yapan istatistik programları pahalı ve öğretmen için tasarlanmamış.

**Çözüm.** Öğretmen tek bir Excel dosyası yükler; saniyeler içinde şunları alır:
- Her madde için güçlük, ayırt edicilik ve güvenirlik değerleri, sorunlu maddeler önem sırasına göre üstte.
- "Cevap anahtarı hatalı olabilir" uyarısı ve doğrudan düzenleme bağlantısı.
- Seçenek dağılımını üst ve alt grupta ayrı gösteren çeldirici paneli.
- Öğrenci puanları, Z/T puanları ve paylaşılabilir PDF/Excel raporları.

Tanıtım sayfasındaki örnek sınav giriş yapmadan denenebilir.

### Teknik kararlar

- **İstatistik hesapları saf fonksiyonlar** ve birim testleriyle doğrulanmış; hesaplanamayan durumlar (tek madde, sıfır varyans) sıfır değil "belirsiz" gösterilir.
- **Sahiplik veri katmanında.** Her sorgu öğretmen kimliğiyle sınırlandırılır; başkasının sınavı "bulunamadı" döner.
- **Excel sunucuda normalize edilir;** istemcinin gönderdiği biçime güvenilmez, hatalı anahtar satırı açık bir hatayla reddedilir.
- **Uzun soluklu proje:** 2025'ten beri geliştiriliyor, 120'den fazla commit.

## Ekran görüntüleri

<!-- docs/screenshots/ klasörüne bu adlarla PNG ekleyin. -->
| Sınav raporu | Madde haritası |
|---|---|
| ![Sınav raporu](docs/screenshots/rapor.png) | ![Madde haritası](docs/screenshots/madde-haritasi.png) |
| **Çeldirici paneli** | **Tanıtım sayfası** |
| ![Çeldirici paneli](docs/screenshots/celdirici.png) | ![Tanıtım sayfası](docs/screenshots/tanitim.png) |

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
| Arayüz | Tailwind CSS (açık/koyu tema), Radix UI, Recharts, Outfit + Work Sans |
| Raporlama | ExcelJS, @react-pdf/renderer |
| Test | Vitest (birim + entegrasyon) |

## Güvenlik

- Kayda erişim yalnızca `src/features/exams/data.ts` üzerinden; sahiplik koşulu her sorguya gömülü, başkasının kaydı "bulunamadı" döner
- Route koruması middleware'de ve varsayılan olarak her şey korumalı
- Rol istemciden okunmaz; `ADMIN_EMAILS` yalnızca Google'ın doğruladığı e-postayla girişte uygulanır
- Excel normalizasyonu sunucuda yapılır, istemcinin gönderdiği biçime güvenilmez
- 5 hatalı girişte hesap 15 dakika kilitlenir; sıfırlama token'ları hash'lenerek saklanır ve 30 dakika geçerlidir

## Kurulum

Yerel veritabanı Docker'da çalışır:

```bash
npm install
docker compose up -d         # PostgreSQL 17, localhost:5434
cp .env.example .env.local   # DATABASE_URL / DIRECT_URL'i yerel veritabanına, AUTH_URL'i http://localhost:3001'e ayarlayın
npm run db:deploy            # migration'ları uygular
npm run dev                  # http://localhost:3001
```

Yerel veritabanı bağlantısı: `postgres://postgres:postgres@localhost:5434/testmetrix`.
Tanıtım sayfasındaki deneme veritabanı kullanmaz; analiz ve raporlar tarayıcıda hesaplanır
ve giriş yapıldığında görülen rapor ekranının aynısıdır.

## Komutlar

```bash
npm run dev        # geliştirme sunucusu (port 3001)
npm run build      # production derlemesi
npm test           # birim testleri
npm run test:int   # veritabanı gerektiren entegrasyon testleri
npm run db:deploy  # prisma migrate deploy
```
