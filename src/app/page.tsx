import Link from "next/link";
import { signInWithGateHub } from "@/app/actions/auth";
import { DemoAnalyzer } from "@/app/(components)/DemoAnalyzer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getSessionUser } from "@/lib/session";

/**
 * Public tanıtım sayfası.
 *
 * Daha önce burası doğrudan `/folders`'a yönlendiriyordu; middleware
 * fail-closed olduğu için siteye gelen biri yalnızca giriş ekranını
 * görebiliyordu — uygulamanın ne yaptığını anlatan hiçbir public yüzey yoktu.
 *
 * Oturum açıkken bile YÖNLENDİRME YAPILMIYOR, sadece düğme değişiyor:
 * karşılıklı yönlendirme geçmişte `/login` ⇄ `/folders` döngüsüne yol açmıştı.
 */
const METRICS = [
  {
    title: "Madde güçlüğü ve ayırt edicilik",
    body: "Her madde için p değeri, üst-alt %27 ayırt edicilik indeksi, biserial ve point-biserial korelasyonlar.",
  },
  {
    title: "Güvenirlik katsayıları",
    body: "KR-20 ve KR-21. Hesaplanamayan durumlar (tek madde, sıfır varyans) sıfır olarak değil, açıkça belirsiz gösterilir.",
  },
  {
    title: "Çeldirici analizi",
    body: "Madde başına seçenek dağılımı, üst ve alt grubun her şıkka nasıl dağıldığıyla birlikte.",
  },
  {
    title: "Öğrenci raporları",
    body: "Puan, başarı yüzdesi, Z ve T puanları, sıralama. Eşit puanlar eşit sıra alır.",
  },
  {
    title: "Betimsel istatistikler",
    body: "Ortalama, ortanca, mod, ranj, varyans, standart sapma, çarpıklık, basıklık, frekans tablosu.",
  },
  {
    title: "Dışa aktarma",
    body: "Altı ayrı Excel raporu ve grafikli bir PDF. Grafikler ekranda da incelenebilir.",
  },
];

export default async function LandingPage() {
  const sessionUser = await getSessionUser();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="" className="h-9 w-auto" />
            <span className="font-semibold text-gray-900">TestMetrix</span>
          </div>

          {sessionUser ? (
            <Link href="/folders">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Panele Git
              </Button>
            </Link>
          ) : (
            <form action={signInWithGateHub}>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Giriş Yap
              </Button>
            </form>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-14 space-y-16">
        <section className="text-center space-y-5">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
            Çoktan seçmeli sınavlarınızın
            <br className="hidden sm:block" /> madde ve test analizi
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Cevap anahtarını ve öğrenci yanıtlarını içeren bir Excel dosyası
            yükleyin; hangi maddenin işe yaradığını, hangisinin ayırt etmediğini
            ve testin ne kadar güvenilir olduğunu görün.
          </p>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <a href="#deneyin">
              <Button
                variant="outline"
                className="border-blue-600 text-blue-700 hover:bg-blue-50"
              >
                Giriş yapmadan deneyin
              </Button>
            </a>
            <a href="/sample.xlsx" download>
              <Button variant="outline">Örnek dosyayı indirin</Button>
            </a>
          </div>
        </section>

        {/* Akış */}
        <section className="grid gap-6 sm:grid-cols-3">
          {[
            ["1", "Excel yükleyin", "İlk satır cevap anahtarı, sonraki satırlar öğrenciler."],
            ["2", "Analiz otomatik", "Madde ve test istatistikleri anında hesaplanır."],
            ["3", "Raporu indirin", "Excel ve PDF çıktıları, grafiklerle birlikte."],
          ].map(([step, title, body]) => (
            <div key={step} className="text-center space-y-2">
              <div className="mx-auto w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                {step}
              </div>
              <h2 className="font-semibold text-gray-900">{title}</h2>
              <p className="text-sm text-gray-600">{body}</p>
            </div>
          ))}
        </section>

        {/* Canlı demo */}
        <section id="deneyin" className="scroll-mt-8">
          <div className="mb-5 text-center space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">Hemen deneyin</h2>
            <p className="text-gray-600">
              Hesap açmadan, örnek veriyle ya da kendi dosyanızla.
            </p>
          </div>

          <Card className="shadow-sm">
            <CardContent className="p-6">
              <DemoAnalyzer />
            </CardContent>
          </Card>
        </section>

        {/* Neler hesaplanıyor */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center">
            Neler hesaplanıyor?
          </h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {METRICS.map((metric) => (
              <div
                key={metric.title}
                className="border rounded-lg p-5 bg-white hover:shadow-sm transition-shadow"
              >
                <h3 className="font-semibold text-gray-900 mb-1.5">
                  {metric.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {metric.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="text-center space-y-4 border-t pt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Sınavlarınızı kaydetmek için giriş yapın
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto text-sm">
            Giriş GateHub üzerinden yapılır. Yüklediğiniz sınavlar klasörlerde
            saklanır, sonradan düzenlenebilir ve yeniden raporlanabilir.
          </p>
          {sessionUser ? (
            <Link href="/folders">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Panele Git
              </Button>
            </Link>
          ) : (
            <form action={signInWithGateHub}>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                GateHub ile Giriş Yap
              </Button>
            </form>
          )}
        </section>
      </main>

      <footer className="border-t py-6 text-center text-sm text-gray-500">
        TestMetrix — test ve madde analizi platformu
      </footer>
    </div>
  );
}
