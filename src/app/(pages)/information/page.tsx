import { ArrowRight, BarChart3, FileSpreadsheet, Gauge, ListChecks } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageContainer, PageHeader, Section } from "@/components/app/page";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Hakkında" };

const STEPS = [
  {
    icon: FileSpreadsheet,
    title: "Excel'i yükleyin",
    body: "İlk satır cevap anahtarı, sonraki her satır bir öğrenci. Dosya klasörlerinizde saklanır.",
  },
  {
    icon: Gauge,
    title: "Analiz hesaplanır",
    body: "Madde güçlüğü, ayırt edicilik, KR-20/KR-21 ve betimsel istatistikler kayıt anında hazır olur.",
  },
  {
    icon: BarChart3,
    title: "Raporu inceleyin",
    body: "Puan dağılımı, madde haritası ve çeldirici analizi ekranda; Excel ve PDF olarak indirilebilir.",
  },
];

const THRESHOLDS = [
  ["Madde güçlüğü (p)", "Doğru yanıtlayanların oranı. 0,20'nin altı çok zor, 0,90'ın üstü çok kolay olarak işaretlenir."],
  ["Ayırt edicilik (D)", "Üst ve alt %27'lik grubun farkı. 0,40 ve üzeri iyi; 0,20'nin altı maddenin gözden geçirilmesi gerektiğini gösterir."],
  ["KR-20 güvenirlik", "0,80 ve üzeri yüksek, 0,60–0,80 sınıf içi değerlendirme için kabul edilebilir, 0,60'ın altı düşük."],
  ["Çeldirici", "Üst grupta alt gruptan daha çok seçilen yanlış şık, maddede sorun olduğuna işaret eder."],
];

export default function InformationPage() {
  return (
    <PageContainer>
      <PageHeader
        eyebrow="TestMetrix"
        title="Sınavlarınızın ne ölçtüğünü görün"
        description="Çoktan seçmeli sınavlar için klasik test kuramına dayalı madde ve test analizi. Hesaplar sizin verinizle, sizin hesabınızda yapılır."
        actions={
          <Link href="/excel-upload">
            <Button className="bg-blue-600 text-white hover:bg-blue-700">
              Sınav yükle
              <ArrowRight aria-hidden="true" />
            </Button>
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        {STEPS.map(({ icon: Icon, title, body }, index) => (
          <section key={title} className="rounded-xl border border-gray-200 bg-surface p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Icon aria-hidden="true" className="h-5 w-5" />
              </span>
              <span className="font-display text-sm font-semibold text-gray-500">Adım {index + 1}</span>
            </div>
            <h2 className="mt-4 text-lg font-semibold text-gray-900">{title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-gray-600">{body}</p>
          </section>
        ))}
      </div>

      <Section title="Değerler nasıl yorumlanır?" description="Raporda kullanılan eşikler; klasik test kuramında yaygın kabul gören değerlerdir." flush>
        <dl className="divide-y divide-gray-200">
          {THRESHOLDS.map(([term, detail]) => (
            <div key={term} className="grid gap-1 px-5 py-4 sm:grid-cols-[220px_1fr] sm:gap-6">
              <dt className="flex items-center gap-2 font-semibold text-gray-900">
                <ListChecks aria-hidden="true" className="h-4 w-4 text-blue-600" />
                {term}
              </dt>
              <dd className="text-sm leading-relaxed text-gray-600">{detail}</dd>
            </div>
          ))}
        </dl>
      </Section>
    </PageContainer>
  );
}
