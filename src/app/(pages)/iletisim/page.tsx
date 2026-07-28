import type { Metadata } from "next";
import { Card, PageHeader, PageShell, SectionTitle } from "@/features/ui/primitives";

export const metadata: Metadata = { title: "İletişim" };

const CONTACT_EMAIL = "ahmetkurtk2@gmail.com";

/**
 * İletişim.
 *
 * Buradaki form kaldırıldı. Eski hali backend'deki `/send-mail` uç noktasına
 * POST atıyordu; o uç nokta kimlik doğrulaması ve hız sınırı olmadan, gövdeden
 * gelen adresi `from` alanına koyarak projenin kendi Gmail hesabından mail
 * gönderiyordu — internete açık bir mail relay'di.
 */
export default function ContactPage() {
  return (
    <PageShell>
      <PageHeader
        title="İletişim"
        meta="Soru, öneri ve hata bildirimleri için"
      />

      <Card>
        <SectionTitle title="E-posta" />
        <a
          href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("TestMetrix — ")}`}
          className="text-sm text-[var(--viz-series)] hover:underline break-all"
        >
          {CONTACT_EMAIL}
        </a>
        <p className="mt-2 text-xs text-[var(--viz-text-secondary)]">
          Bağlantıya tıklayınca kendi e-posta uygulamanız açılır.
        </p>
      </Card>

      <Card>
        <SectionTitle title="Hata bildirirken" />
        <ul className="list-disc pl-5 space-y-1 text-sm text-[var(--viz-text-secondary)]">
          <li>Hangi ekranda olduğunuzu ve ne yapmaya çalıştığınızı yazın.</li>
          <li>
            Bir sınavla ilgiliyse öğrenci ve madde sayısını belirtin; sorun
            genellikle dosya düzeninden kaynaklanır.
          </li>
          <li>Ekran görüntüsü varsa ekleyin.</li>
        </ul>
      </Card>
    </PageShell>
  );
}
