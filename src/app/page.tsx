import { ArrowDown, Download, Lock } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";

import { DemoAnalyzer } from "@/app/(components)/DemoAnalyzer";
import { Brand } from "@/app/(components)/Header";
import { ItemWalk, type WalkStep } from "@/app/(components)/ItemWalk";
import { InstallSection } from "@/components/InstallSection";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { Button } from "@/components/ui/button";
import { ANSWER_OPTIONS, analyzeExam, parseExamMatrix } from "@/features/analysis";
import { SAMPLE_EXAM_MATRIX } from "@/features/analysis/sample-exam";
import { classifyItems, interpretReliability } from "@/features/reports/quality";
import { fmt } from "@/lib/format";
import { getSessionUser } from "@/lib/session";
import { THEME_COOKIE, parseTheme } from "@/lib/theme";

/**
 * Public tanıtım sayfası. Oturum açıkken bile YÖNLENDİRME YAPILMAZ, yalnızca
 * düğme değişir: karşılıklı yönlendirme geçmişte `/login` ⇄ `/folders`
 * döngüsüne yol açmıştı.
 *
 * Sayfa örnek sınavı madde madde gezdirir. Gösterilen her sayı, demo ve
 * kayıtlı sınav ekranında kullanılan analiz kodundan gelir; elle yazılmaz.
 */
const METRICS = [
  ["Madde güçlüğü (p)", "Soruyu doğru yanıtlayanların oranı. 0,2'nin altı çok zor, 0,9'un üstü çok kolay sayılır."],
  ["Ayırt edicilik", "Başarılı ve başarısız öğrencileri ne kadar ayırdığı: üst ve alt %27'lik grupların farkı, biserial ve point-biserial korelasyonla."],
  ["Güvenirlik (KR-20, KR-21)", "Testin tutarlı ölçüp ölçmediği. Hesaplanamıyorsa sıfır değil, açıkça belirsiz yazılır."],
  ["Çeldirici analizi", "Her şıkkı kimin seçtiği; üst ve alt grup ayrı ayrı."],
  ["Öğrenci raporları", "Puan, başarı yüzdesi, Z ve T puanları, sıralama. Eşit puanlar eşit sıra alır."],
  ["Betimsel istatistik", "Ortalama, ortanca, mod, ranj, varyans, standart sapma, çarpıklık, basıklık ve frekans tablosu."],
] as const;

function OptionBars({
  questionNo,
  correct,
  percentages,
}: {
  questionNo: number;
  correct: string;
  percentages: Record<string, number>;
}) {
  const rows = ANSWER_OPTIONS.filter((o) => o !== "BOS" && (percentages[o] ?? 0) > 0);
  return (
    <figure className="max-w-md rounded-xl border border-gray-200 bg-surface p-4">
      <figcaption className="text-sm font-medium text-gray-700">Madde {questionNo}: hangi şık seçildi?</figcaption>
      <ul className="mt-3 space-y-2">
        {rows.map((option) => (
          <li key={option} className="grid grid-cols-[4.5rem_1fr_3rem] items-center gap-3 text-sm">
            <span className="text-gray-900">
              {option}
              {option === correct ? <span className="ml-1 text-xs text-blue-600">✓ doğru</span> : null}
            </span>
            <span className="h-2 overflow-hidden rounded-full bg-gray-100">
              <span
                className={`block h-full rounded-full ${option === correct ? "bg-blue-600" : "bg-gray-300"}`}
                style={{ width: `${percentages[option]}%` }}
              />
            </span>
            <span className="text-right tabular-nums text-gray-600">%{fmt(percentages[option], 0)}</span>
          </li>
        ))}
      </ul>
    </figure>
  );
}

export default async function LandingPage() {
  const sessionUser = await getSessionUser();
  const theme = parseTheme((await cookies()).get(THEME_COOKIE)?.value);

  const data = parseExamMatrix(SAMPLE_EXAM_MATRIX);
  const analysis = analyzeExam(data);
  const items = classifyItems(analysis);
  const kr20 = analysis.reliability.kr20;
  const reliability = interpretReliability(kr20);
  const byFlag = (flag: string) => items.filter((i) => i.flag === flag).map((i) => i.questionNo);
  const hard = byFlag("tooHard");
  const easy = byFlag("tooEasy");
  const good = byFlag("ok");
  const list = (nums: number[]) => nums.map((n) => `M${n}`).join(", ");
  const hardest = items.filter((i) => i.flag === "tooHard").sort((a, b) => a.difficulty - b.difficulty)[0];
  const hardestOptions = hardest ? analysis.options[hardest.questionNo - 1] : null;

  const steps: WalkStep[] = [
    {
      id: "guvenirlik",
      title: `Önce bütün: KR-20 ${fmt(kr20)}, ${reliability.label.toLocaleLowerCase("tr")}`,
      body: (
        <p>
          {data.studentNames.length} öğrenci, {data.answerKey.length} soru. Güvenirlik testin bir bütün olarak tutarlı
          ölçüp ölçmediğini söyler. Ama yüksek güvenirlik, her sorunun iyi olduğu anlamına gelmez.
        </p>
      ),
      highlight: [],
    },
    ...(hard.length > 0 && hardest && hardestOptions
      ? [
          {
            id: "zor",
            title: `${list(hard)}: neredeyse kimse doğru yapamadı`,
            body: (
              <p>
                {/* Sayıya ek getirmeyen kuruluş: "9'u", "%17'si" gibi ekler sayıya göre değişir. */}
                Madde {hardest.questionNo} için doğru yanıt oranı yalnızca %{fmt(hardest.difficulty * 100, 0)}. Şıklara bakınca neden olduğu görünüyor: sınıfın büyük kısmı aynı yanlış şıkta toplanmış.
                Konu işlenmemiş ya da soru yanıltıcı olabilir.
              </p>
            ),
            highlight: hard,
            evidence: (
              <OptionBars
                questionNo={hardest.questionNo}
                correct={data.answerKey[hardest.questionNo - 1]}
                percentages={hardestOptions.percentages}
              />
            ),
          },
        ]
      : []),
    ...(easy.length > 0
      ? [
          {
            id: "kolay",
            title: `${list(easy)}: herkes bildi, kimseyi ayırmadı`,
            body: (
              <p>
                Neredeyse tüm sınıfın doğru yaptığı sorular puanı yükseltir ama öğrenciler arasında fark ortaya koymaz.
                Isınma sorusu olarak kalabilirler; ölçme amacıyla yeniden yazılabilirler.
              </p>
            ),
            highlight: easy,
          },
        ]
      : []),
    {
      id: "iyi",
      title: `${list(good)}: işini yapan sorular`,
      body: (
        <p>
          Orta güçlükte ve başarılı öğrencilerin daha çok doğru yaptığı sorular. Haritada ortada ve yukarıda dururlar.
          Raporda her madde için seçenek dağılımı, korelasyonlar ve öğrenci puanları da var.
        </p>
      ),
      highlight: good,
    },
  ];

  const intro = (
    <div className="pt-6 lg:pt-16">
      <h1 className="font-display text-4xl font-semibold leading-[1.08] tracking-tight text-gray-900 sm:text-5xl [text-wrap:balance]">
        Sınavınızdaki hangi soru işe yaramadı?
      </h1>
      <p className="mt-5 max-w-xl text-lg leading-relaxed text-gray-600 [text-wrap:pretty]">
        Cevap anahtarını ve öğrenci yanıtlarını içeren Excel dosyasını yükleyin. TestMetrix her sorunun güçlüğünü,
        ayırt ediciliğini ve testin güvenirliğini hesaplar; sorunlu maddeleri nedeniyle birlikte gösterir.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <a href="#deneyin">
          <Button className="h-11 bg-amber-400 px-5 text-[#0f1b3d] hover:bg-amber-300">
            Kendi dosyanızla deneyin
            <ArrowDown aria-hidden="true" />
          </Button>
        </a>
        <a href="/sample.xlsx" download>
          <Button variant="outline" className="h-11 px-5">
            <Download aria-hidden="true" />
            Örnek dosya
          </Button>
        </a>
      </div>
      <p className="mt-10 hidden items-center gap-2 text-sm text-gray-500 lg:flex">
        <ArrowDown aria-hidden="true" className="h-4 w-4" />
        Örnek bir sınavı madde madde inceleyin
      </p>
    </div>
  );

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
            <ThemeSwitcher initial={theme} tone="dark" />
            {primaryCta}
          </div>
        </header>
      </div>

      <div className="border-b border-gray-200 bg-surface">
        <section aria-labelledby="yuruyus" className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-10 lg:pb-24">
          <h2 id="yuruyus" className="sr-only">
            Örnek sınavın madde madde incelemesi
          </h2>
          <ItemWalk
            intro={intro}
            steps={steps}
            points={items.map((i) => ({
              questionNo: i.questionNo,
              difficulty: i.difficulty,
              discrimination: i.discrimination,
              needsAttention: i.needsAttention,
            }))}
          />
        </section>
      </div>

      <main className="mx-auto max-w-6xl space-y-20 px-4 py-16 sm:px-6">
        <section id="deneyin" aria-labelledby="deneyin-baslik" className="scroll-mt-6 space-y-5">
          <div>
            <h2 id="deneyin-baslik" className="font-display text-3xl font-semibold tracking-tight text-gray-900">
              Şimdi sizin sınavınız
            </h2>
            <p className="mt-2 max-w-2xl text-gray-600">
              İlk satır cevap anahtarı (A–E), sonraki her satır bir öğrenci. Rapor, giriş yaptığınızda gördüğünüz ekranın
              aynısıdır.
            </p>
            <p className="mt-2 flex items-center gap-2 text-sm text-gray-500">
              <Lock aria-hidden="true" className="h-4 w-4" />
              Hesap gerekmez; dosya bilgisayarınızdan çıkmaz.
            </p>
          </div>
          <DemoAnalyzer />
        </section>

        <section aria-labelledby="olcutler-baslik" className="grid gap-8 lg:grid-cols-[18rem_1fr]">
          <h2 id="olcutler-baslik" className="font-display text-3xl font-semibold tracking-tight text-gray-900">
            Raporda neler var?
          </h2>
          <dl className="grid gap-x-10 gap-y-6 border-t border-gray-200 pt-6 sm:grid-cols-2">
            {METRICS.map(([term, detail]) => (
              <div key={term}>
                <dt className="font-semibold text-gray-900">{term}</dt>
                <dd className="mt-1 text-sm leading-relaxed text-gray-600">{detail}</dd>
              </div>
            ))}
            <div className="sm:col-span-2">
              <dt className="font-semibold text-gray-900">Dışa aktarma</dt>
              <dd className="mt-1 text-sm leading-relaxed text-gray-600">
                Grafikli PDF rapor ve madde, öğrenci, seçenek ve test analizleri için Excel tabloları.
              </dd>
            </div>
          </dl>
        </section>

        <InstallSection />

        <section className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-gray-200 bg-surface p-8 sm:flex-row sm:items-center sm:p-10">
          <div>
            <h2 className="font-display text-2xl font-semibold text-gray-900">Sınavlarınızı saklamak için hesap açın</h2>
            <p className="mt-2 max-w-xl text-gray-600">
              E-posta ile ya da Google hesabınızla giriş yapın. Sınavlar klasörlerde saklanır, sonradan düzenlenip yeniden
              raporlanabilir.
            </p>
          </div>
          <Link href={sessionUser ? "/folders" : "/register"}>
            <Button className="h-11 bg-blue-600 px-6 text-white hover:bg-blue-700">
              {sessionUser ? "Panele git" : "Ücretsiz kaydol"}
            </Button>
          </Link>
        </section>
      </main>

      <footer className="border-t border-gray-200 py-6 text-center text-sm text-gray-500">
        TestMetrix · test ve madde analizi
      </footer>
    </div>
  );
}
