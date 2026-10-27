import { Clock, Info, Mail } from "lucide-react";
import type { Metadata } from "next";

import { PageContainer, PageHeader, Section } from "@/components/app/page";

export const metadata: Metadata = { title: "İletişim" };

const CONTACT_EMAIL = "ahmetkurtk2@gmail.com";

/**
 * İletişim sayfası. Form bilerek yok: eski form kimlik doğrulaması ve hız sınırı
 * olmayan bir mail relay'ine POST atıyordu. Doğrudan `mailto:` yeni bir saldırı
 * yüzeyi açmıyor; gerçek bir form gerekirse hız sınırlı bir uç noktayla eklenir.
 */
export default function ContactPage() {
  return (
    <PageContainer narrow>
      <PageHeader eyebrow="Destek" title="İletişim" description="Soru, öneri ve hata bildirimleriniz için yazın." />

      <Section flush>
        <a
          href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("TestMetrix — ")}`}
          className="flex items-start gap-4 border-b border-gray-200 p-5 transition-colors hover:bg-gray-50"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
            <Mail aria-hidden="true" className="h-5 w-5" />
          </span>
          <span>
            <span className="block font-semibold text-gray-900">E-posta</span>
            <span className="block break-all text-blue-600">{CONTACT_EMAIL}</span>
            <span className="mt-1 block text-sm text-gray-500">Tıklayınca e-posta uygulamanız açılır.</span>
          </span>
        </a>
        <div className="flex items-start gap-4 border-b border-gray-200 p-5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
            <Clock aria-hidden="true" className="h-5 w-5" />
          </span>
          <span>
            <span className="block font-semibold text-gray-900">Yanıt süresi</span>
            <span className="block text-sm text-gray-600">Mesajlar genellikle birkaç iş günü içinde yanıtlanır.</span>
          </span>
        </div>
        <div className="flex items-start gap-4 p-5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
            <Info aria-hidden="true" className="h-5 w-5" />
          </span>
          <span>
            <span className="block font-semibold text-gray-900">Hata bildirirken</span>
            <span className="block text-sm text-gray-600">
              Mümkünse sorunlu Excel dosyasını (öğrenci adlarını çıkararak) ve gördüğünüz hata mesajını ekleyin.
            </span>
          </span>
        </div>
      </Section>
    </PageContainer>
  );
}
