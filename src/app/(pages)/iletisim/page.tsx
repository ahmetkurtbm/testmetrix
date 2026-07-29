import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, MapPin, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "İletişim — TestMetrix",
};

const CONTACT_EMAIL = "ahmetkurtk2@gmail.com";

/**
 * İletişim sayfası.
 *
 * Buradaki form kaldırıldı. Eski hali, backend'deki `/send-mail` uç noktasına
 * POST atıyordu; o uç nokta kimlik doğrulaması ve hız sınırı olmadan, gövdeden
 * gelen adresi `from` alanına koyarak projenin kendi Gmail hesabından mail
 * gönderiyordu — yani internete açık bir mail relay'di. Spam için kullanılsaydı
 * hesabın kapanmasıyla sonuçlanabilirdi.
 *
 * Yerine doğrudan `mailto:` bağlantısı kondu: yeni saldırı yüzeyi açmıyor ve
 * kullanıcının kendi mail istemcisini kullanıyor. Gerçek bir form gerekirse
 * hız sınırlı bir uç noktayla sonradan eklenebilir.
 */
export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">İletişim</h1>
          <p className="text-gray-600">
            Soru, öneri ve hata bildirimleriniz için bize ulaşın.
          </p>
        </div>

        <Card className="bg-white/95 shadow-sm">
          <CardContent className="p-6 space-y-5">
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
                "TestMetrix — "
              )}`}
              className="flex items-start gap-4 p-4 rounded-lg hover:bg-blue-50 transition-colors group"
            >
              <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <Mail className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-800">E-posta</h2>
                <p className="text-blue-600 break-all">{CONTACT_EMAIL}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Tıklayarak doğrudan mail gönderebilirsiniz.
                </p>
              </div>
            </a>

            <div className="flex items-start gap-4 p-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <Clock className="w-5 h-5 text-gray-700" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-800">Yanıt Süresi</h2>
                <p className="text-gray-600">
                  Mesajlar genellikle birkaç iş günü içinde yanıtlanır.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <MapPin className="w-5 h-5 text-gray-700" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-800">Proje Hakkında</h2>
                <p className="text-gray-600">
                  TestMetrix, çoktan seçmeli sınavlar için madde ve test analizi
                  yapan bir platformdur.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
