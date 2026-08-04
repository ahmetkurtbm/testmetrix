"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * E-posta/şifre giriş formu.
 *
 * `next-auth/react`'ın `signIn` fonksiyonu kullanılıyor (server action değil):
 * `redirect: false` ile çağrılıp dönen `error` alanı forma yazdırılabiliyor.
 * Server action'da bu, hatayı yakalamak için `redirectTo` yerine try/catch
 * ve Auth.js'in özel `AuthError` alt sınıflarını ayırt etmeyi gerektirirdi —
 * burası daha basit.
 *
 * Hata mesajı bilerek TEK ve JENERİK: "e-posta yok" ile "şifre yanlış" ile
 * "hesap kilitli" ayrımı yapılmıyor — kullanıcı numaralandırmasını önlemek
 * için hepsi aynı cümleye çıkıyor.
 */
export function LoginForm({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError(
        "E-posta veya parola hatalı, ya da hesabınız çok sayıda başarısız denemeden dolayı geçici olarak kilitli."
      );
      return;
    }

    router.push("/folders");
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm text-gray-700">
            E-posta
          </Label>
          <Input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm text-gray-700">
              Parola
            </Label>
            <a href="/forgot-password" className="text-xs text-blue-600 hover:underline">
              Parolamı unuttum
            </a>
          </div>
          <Input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 text-base font-medium rounded-lg"
        >
          {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
        </Button>
      </form>

      {googleEnabled && (
        <>
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs text-gray-400">veya</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => signIn("google", { callbackUrl: "/folders" })}
            className="w-full py-5 text-base font-medium rounded-lg"
          >
            Google ile Giriş Yap
          </Button>
        </>
      )}

      <p className="text-center text-sm text-gray-600">
        Hesabınız yok mu?{" "}
        <a href="/register" className="text-blue-600 hover:underline font-medium">
          Kayıt olun
        </a>
      </p>
    </div>
  );
}
