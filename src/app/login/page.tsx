import type { Metadata } from "next";
import Link from "next/link";
import { isGoogleConfigured } from "@/auth.config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getSessionUser } from "@/lib/session";
import { LoginForm } from "./LoginForm";

// Kök layout'taki `template: "%s — TestMetrix"` soneki kendisi ekliyor;
// burada tekrar yazmak "Giriş — TestMetrix — TestMetrix" üretiyordu.
export const metadata: Metadata = {
  title: "Giriş",
};

/**
 * Giriş ekranı.
 *
 * Bu sayfa hiçbir koşulda başka bir yere YÖNLENDİRMEZ. Oturum açıkken buraya
 * gelinirse sadece "Panele dön" bağlantısı gösterilir. Karşılıklı yönlendirmenin
 * bir ucu kesik olduğu için sonsuz döngü oluşması matematiksel olarak imkânsız.
 */
export default async function LoginPage() {
  const sessionUser = await getSessionUser();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <Card className="relative w-full max-w-md bg-white shadow-xl border-0">
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
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 text-base font-medium rounded-lg">
                    Panele Dön
                  </Button>
                </Link>
              </>
            ) : (
              <LoginForm googleEnabled={isGoogleConfigured()} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
