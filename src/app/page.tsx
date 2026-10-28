import { ArrowRight, BarChart3, Download, FileSpreadsheet, Gauge, ListChecks, Lock, Users } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";

import { DemoAnalyzer } from "@/app/(components)/DemoAnalyzer";
import { Brand } from "@/app/(components)/Header";
import { InstallSection } from "@/components/InstallSection";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { Button } from "@/components/ui/button";
import { getSessionUser } from "@/lib/session";
import { THEME_COOKIE, parseTheme } from "@/lib/theme";

/**
 * Public tanıtım sayfası. Oturum açıkken bile YÖNLENDİRME YAPILMAZ, yalnızca
 * düğme değişir: karşılıklı yönlendirme geçmişte `/login` ⇄ `/folders`
 * döngüsüne yol açmıştı.
 */
const METRICS = [
  {
    icon: Gauge,
    title: "Madde güçlüğü ve ayırt edicilik",
    body: "Her madde için p değeri, üst-alt %27 ayırt edicilik indeksi, biserial ve point-biserial korelasyonlar.",
  },
  {
    icon: ListChecks,
    title: "Güvenirlik katsayıları",
    body: "KR-20 ve KR-21. Hesaplanamayan durumlar (tek madde, sıfır varyans) sıfır olarak değil, açıkça belirsiz gösterilir.",
  },
  {
    icon: BarChart3,
    title: "Çeldirici analizi",
    body: "Madde başına seçenek dağılımı, üst ve alt grubun her şıkka nasıl dağıldığıyla birlikte.",
  },
  {
    icon: Users,
    title: "Öğrenci raporları",
    body: "Puan, başarı yüzdesi, Z ve T puanları, sıralama. Eşit puanlar eşit sıra alır.",
  },
  {
    icon: FileSpreadsheet,
    title: "Betimsel istatistikler",
    body: "Ortalama, ortanca, mod, ranj, varyans, standart sapma, çarpıklık, basıklık, frekans tablosu.",
  },
  {
    icon: Download,
    title: "Dışa aktarma",
    body: "Altı ayrı Excel raporu ve grafikli bir PDF. Grafikler ekranda da incelenebilir.",
  },
];

const PREVIEW = [
  { label: "KR-20", value: "0,84", hint: "Yüksek güvenirlik" },
  { label: "Ortalama", value: "6,2", hint: "10 üzerinden" },
  { label: "Başarı", value: "%62", hint: "12 öğrenci" },
  { label: "Gözden geçir", value: "5", hint: "madde" },
];

export default async function LandingPage() {
  const sessionUser = await getSessionUser();
  const theme = parseTheme((await cookies()).get(THEME_COOKIE)?.value);

  const primaryCta = sessionUser ? (
    <Link href="/folders">
      <Button className="bg-blue-600 text-white hover:bg-blue-700">Panele git</Button>
    </Link>
  ) : (
    <Link href="/login">
      <Button className="bg-blue-600 text-white hover:bg-blue-700">Giriş yap</Button>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#0f1b3d] text-white dark:bg-[#0a1228]">
        <header className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/" aria-label="TestMetrix ana sayfa">
            <Brand />
          </Link>
          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <ThemeSwitcher initial={theme} tone="dark" />
            </div>
            {primaryCta}
          </div>
        </header>

        <section className="mx-auto grid max-w-6xl gap-10 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-center lg:pb-20 lg:pt-14">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-amber-400">Test ve madde analizi</p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Çoktan seçmeli sınavlarınızın ne ölçtüğünü görün
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/75">
              Cevap anahtarını ve öğrenci yanıtlarını içeren Excel dosyasını yükleyin; hangi maddenin işe yaradığını,
              hangisinin ayırt etmediğini ve testin ne kadar güvenilir olduğunu tek ekranda görün.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#deneyin">
                <Button className="h-11 bg-amber-400 px-5 text-[#0f1b3d] hover:bg-amber-300">
                  Giriş yapmadan deneyin
                  <ArrowRight aria-hidden="true" />
                </Button>
              </a>
              <a href="/sample.xlsx" download>
                <Button variant="outline" className="h-11 border-white/25 bg-transparent px-5 text-white hover:bg-white/10 hover:text-white">
                  <Download aria-hidden="true" />
                  Örnek dosya
                </Button>
              </a>
            </div>
          </div>

          <div aria-hidden="true" className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-white/60">Örnek sınav · rapor özeti</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {PREVIEW.map((item) => (
                <div key={item.label} className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
                  <p className="text-sm text-white/60">{item.label}</p>
                  <p className="mt-1 font-display text-3xl font-semibold tabular-nums">{item.value}</p>
                  <p className="mt-0.5 text-xs text-white/50">{item.hint}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex h-20 items-end gap-1.5 rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
              {[1, 1, 1, 2, 1, 2, 1, 2, 1, 1].map((h, i) => (
                <span key={i} className="flex-1 rounded-t bg-[#3987e5]" style={{ height: `${h * 45}%` }} />
              ))}
            </div>
          </div>
        </section>
      </div>

      <main className="mx-auto max-w-6xl space-y-16 px-4 py-14 sm:px-6">
        <section className="grid gap-4 sm:grid-cols-3">
          {[
            ["1", "Excel yükleyin", "İlk satır cevap anahtarı, sonraki satırlar öğrenciler."],
            ["2", "Analiz otomatik", "Madde ve test istatistikleri anında hesaplanır."],
            ["3", "Raporu indirin", "Excel ve PDF çıktıları, grafiklerle birlikte."],
          ].map(([step, title, body]) => (
            <div key={step} className="rounded-xl border border-gray-200 bg-surface p-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                {step}
              </span>
              <h2 className="mt-4 text-lg font-semibold text-gray-900">{title}</h2>
              <p className="mt-1 text-sm text-gray-600">{body}</p>
            </div>
          ))}
        </section>

        <section id="deneyin" className="scroll-mt-6 space-y-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">Canlı deneme</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">Hemen deneyin</h2>
            <p className="mt-2 flex items-center gap-2 text-gray-500">
              <Lock aria-hidden="true" className="h-4 w-4" />
              Hesap gerekmez; rapor, giriş yaptığınızda gördüğünüz ekranın aynısıdır.
            </p>
          </div>
          <DemoAnalyzer />
        </section>

        <section className="space-y-6">
          <h2 className="text-3xl font-semibold tracking-tight text-gray-900">Neler hesaplanıyor?</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {METRICS.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-xl border border-gray-200 bg-surface p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Icon aria-hidden="true" className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-semibold text-gray-900">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <InstallSection />

        <section className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-[#0f1b3d] p-8 text-white dark:bg-[#0a1228] sm:flex-row sm:items-center sm:p-10">
          <div>
            <h2 className="text-2xl font-semibold">Sınavlarınızı kaydetmek için hesap açın</h2>
            <p className="mt-2 max-w-xl text-white/70">
              E-posta ile ya da Google hesabınızla kaydolun. Sınavlar klasörlerde saklanır, sonradan düzenlenip yeniden raporlanabilir.
            </p>
          </div>
          <Link href={sessionUser ? "/folders" : "/register"}>
            <Button className="h-11 bg-amber-400 px-6 text-[#0f1b3d] hover:bg-amber-300">
              {sessionUser ? "Panele git" : "Ücretsiz kaydol"}
            </Button>
          </Link>
        </section>
      </main>

      <footer className="border-t border-gray-200 py-6 text-center text-sm text-gray-500">
        TestMetrix — test ve madde analizi platformu
      </footer>
    </div>
  );
}
