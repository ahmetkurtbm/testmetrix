import type { Metadata } from "next";
import Link from "next/link";
import { signInWithGateHub } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getSessionUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Giriş — TestMetrix",
};

/**
 * Giriş ekranı.
 *
 * Bu sayfa hiçbir koşulda başka bir yere YÖNLENDİRMEZ. Oturum açıkken buraya
 * gelinirse sadece "Panele dön" bağlantısı gösterilir. Karşılıklı yönlendirmenin
 * bir ucu kesik olduğu için sonsuz döngü oluşması matematiksel olarak imkânsız.
 *
 * Tek düğme: kimlik doğrulamanın tamamı GateHub'da. Parola alanı, "hesap oluştur"
 * ve "şifremi unuttum" bilerek yok — hepsi GateHub'ın sorumluluğunda ve orada
 * rate limit, e-posta doğrulama, 2FA ve parola geçmişi kontrolüyle geliyor.
 */
export default async function LoginPage() {
  const sessionUser = await getSessionUser();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0">
          <img
            className="w-full h-full object-cover opacity-50"
            src="/login-teacher-student.webp"
            alt=""
          />
        </div>

        <Card className="relative w-full max-w-md bg-white/95 backdrop-blur-md shadow-xl border-0">
          <CardHeader className="space-y-4 pb-2">
            <div className="flex justify-center">
              <img src="/logo.png" alt="TestMetrix" className="h-16 w-auto" />
            </div>
            <h1 className="text-2xl font-semibold text-center text-gray-800">
              TestMetrix
            </h1>
            <p className="text-sm text-center text-gray-600">
              Test ve madde analizi platformu
            </p>
          </CardHeader>

          <CardContent className="space-y-4 pt-4">
            {sessionUser ? (
              <>
                <p className="text-sm text-center text-gray-700">
                  <span className="font-medium">{sessionUser.email}</span> olarak
                  giriş yapılmış.
                </p>
                <Link href="/folders" className="block">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-base font-medium rounded-lg">
                    Panele Dön
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <form action={signInWithGateHub}>
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-base font-medium rounded-lg"
                  >
                    GateHub ile Giriş Yap
                  </Button>
                </form>

                <p className="text-xs text-center text-gray-500 leading-relaxed">
                  Giriş işlemi GateHub üzerinden yapılır. Hesap oluşturma ve şifre
                  işlemleri de oradan yönetilir.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
