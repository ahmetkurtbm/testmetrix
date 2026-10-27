import type { Metadata } from "next";
import Link from "next/link";

import { isGoogleConfigured } from "@/auth.config";
import { AuthLayout } from "@/components/app/auth-layout";
import { Button } from "@/components/ui/button";
import { getSessionUser } from "@/lib/session";

import { LoginForm } from "./LoginForm";

// Kök layout'taki `template: "%s — TestMetrix"` soneki başlığa kendisi eklenir.
export const metadata: Metadata = { title: "Giriş" };

/**
 * Giriş ekranı. Bu sayfa hiçbir koşulda başka bir yere YÖNLENDİRMEZ: oturum
 * açıkken yalnızca "Panele dön" gösterilir, böylece `/login` ⇄ `/folders`
 * arasında döngü oluşamaz.
 */
export default async function LoginPage() {
  const sessionUser = await getSessionUser();

  return (
    <AuthLayout title="Giriş yap" description="Sınavlarınıza ve raporlarınıza erişmek için oturum açın.">
      {sessionUser ? (
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            <span className="font-medium">{sessionUser.email}</span> olarak giriş yapılmış.
          </p>
          <Link href="/folders" className="block">
            <Button className="h-11 w-full bg-blue-600 text-white hover:bg-blue-700">Panele dön</Button>
          </Link>
        </div>
      ) : (
        <LoginForm googleEnabled={isGoogleConfigured()} />
      )}
    </AuthLayout>
  );
}
