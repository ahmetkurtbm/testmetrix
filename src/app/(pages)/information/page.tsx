import type { Metadata } from "next";
import {
  Card,
  GhostButton,
  PageHeader,
  PageShell,
  SectionTitle,
} from "@/features/ui/primitives";

export const metadata: Metadata = { title: "Hakkında" };

/**
 * Hakkında sayfası.
 *
 * Eski hali gerçekte olmayan özellikler vaat ediyordu: "İşbirliği ve Paylaşım —
 * meslektaşlarınızla verilerinizi paylaşın" (paylaşım özelliği yok) ve
 * "7/24 teknik destek" (böyle bir destek yok). Bunlar kaldırıldı; sayfa artık
 * yalnızca uygulamanın gerçekten yaptığı işi anlatıyor.
 */
const METRICS = [
  {
    title: "Madde güçlüğü (p)",
    body: "Maddeyi doğru yanıtlayanların oranı. 1'e yakın değer maddenin çok kolay, 0'a yakın değer çok zor olduğunu gösterir.",
  },
  {
    title: "Ayırt edicilik indeksi",
    body: "Üst %27 ile alt %27'lik dilimin doğru yanıtlama farkı. Düşük değer, maddenin başarılı ve başarısız öğrenciyi ayırmadığı anlamına gelir.",
  },
  {
    title: "Biserial ve point-biserial korelasyon",
    body: "Maddenin test toplam puanıyla ilişkisi. Herkesin doğru ya da herkesin yanlış yaptığı maddelerde tanımsızdır ve “—” olarak gösterilir.",
  },
  {
    title: "KR-20 ve KR-21",
    body: "Testin iç tutarlılığı. En az iki madde ve puanlarda değişkenlik gerektirir; hesaplanamadığında sıfır değil, hesaplanamadı olarak raporlanır.",
  },
  {
    title: "Çeldirici analizi",
    body: "Madde başına hangi şıkkı kimin işaretlediği, üst ve alt grup karşılaştırmalı. Çeldiricinin işe yarayıp yaramadığını gösterir.",
  },
  {
    title: "Öğrenci istatistikleri",
    body: "Puan, başarı yüzdesi, Z ve T puanı, başarı sırası. Eşit puan alanlar eşit sıra alır.",
  },
];

export default function InformationPage() {
  return (
    <PageShell>
      <PageHeader
        title="TestMetrix hakkında"
        meta="Çoktan seçmeli sınavlar için madde ve test analizi"
        actions={<GhostButton href="/excel-upload">Sınav yükle</GhostButton>}
      />

      <Card>
        <SectionTitle title="Ne yapar?" />
        <p className="text-sm text-[var(--viz-text-secondary)] leading-relaxed">
          Cevap anahtarını ve öğrenci yanıtlarını içeren bir Excel dosyası
          yüklersiniz; uygulama klasik test kuramına dayalı madde ve test
          istatistiklerini hesaplar, hangi maddelerin gözden geçirilmesi
          gerektiğini işaretler ve sonuçları Excel ile PDF olarak dışa aktarır.
        </p>
      </Card>

      <Card>
        <SectionTitle title="Dosya biçimi" />
        <div className="space-y-2 text-sm text-[var(--viz-text-secondary)]">
          <p>Tek sayfalık bir .xlsx dosyası:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong className="text-[var(--viz-text)]">İlk satır</strong> cevap
              anahtarı — ilk hücre etiket, sonrakiler doğru şıklar.
            </li>
            <li>
              <strong className="text-[var(--viz-text)]">Sonraki satırlar</strong>{" "}
              öğrenciler — ilk hücre ad soyad, sonrakiler işaretlenen şıklar.
            </li>
            <li>
              Geçerli şıklar A–E. Boş bırakılan ve tanınmayan hücreler “boş”
              sayılır; büyük/küçük harf ve baştaki-sondaki boşluk göz ardı edilir.
            </li>
          </ul>
          <p className="pt-1">
            Yükleme ekranından örnek dosyayı indirerek beklenen düzeni
            görebilirsiniz.
          </p>
        </div>
      </Card>

      <Card>
        <SectionTitle title="Hesaplanan değerler" />
        <div className="grid gap-4 sm:grid-cols-2">
          {METRICS.map((metric) => (
            <div key={metric.title}>
              <h3 className="text-sm font-medium text-[var(--viz-text)]">
                {metric.title}
              </h3>
              <p className="mt-1 text-xs text-[var(--viz-text-secondary)] leading-relaxed">
                {metric.body}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <SectionTitle title="Veriler ve gizlilik" />
        <ul className="list-disc pl-5 space-y-1 text-sm text-[var(--viz-text-secondary)]">
          <li>Yüklediğiniz sınavlar yalnızca sizin hesabınıza bağlıdır.</li>
          <li>
            Giriş işlemleri GateHub üzerinden yapılır; TestMetrix parolanızı
            saklamaz.
          </li>
          <li>
            Hesabınızı profil sayfasından silebilirsiniz; klasörleriniz ve
            sınavlarınız da birlikte silinir.
          </li>
          <li>
            Tanıtım sayfasındaki deneme aracında seçtiğiniz dosya sunucuya
            gönderilmez, hesaplama tarayıcınızda yapılır.
          </li>
        </ul>
      </Card>
    </PageShell>
  );
}
