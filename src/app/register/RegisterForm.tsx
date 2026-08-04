"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiPost } from "@/lib/api-client";

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordAgain, setPasswordAgain] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (password !== passwordAgain) {
      setError("Parolalar aynı değil.");
      return;
    }

    setLoading(true);
    try {
      await apiPost("/api/register", { name, email, password });

      // Kayıt sonrası otomatik giriş: kullanıcı ayrıca giriş formuna
      // yönlendirilip aynı bilgileri tekrar yazmak zorunda kalmıyor.
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        // Beklenmedik durum (kayıt başarılı ama giriş başarısız) — kullanıcıyı
        // giriş sayfasına yönlendirip orada denemesini isteriz.
        router.push("/login");
        return;
      }

      router.push("/folders");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kayıt başarısız oldu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name" className="text-sm text-gray-700">
          Ad Soyad
        </Label>
        <Input
          id="name"
          required
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

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
        <Label htmlFor="password" className="text-sm text-gray-700">
          Parola
        </Label>
        <Input
          id="password"
          type="password"
          required
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <p className="text-xs text-gray-500">
          En az 12 karakter; büyük harf, küçük harf ve rakam içermeli.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="passwordAgain" className="text-sm text-gray-700">
          Parola (Tekrar)
        </Label>
        <Input
          id="passwordAgain"
          type="password"
          required
          autoComplete="new-password"
          value={passwordAgain}
          onChange={(e) => setPasswordAgain(e.target.value)}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 text-base font-medium rounded-lg"
      >
        {loading ? "Kaydediliyor..." : "Kayıt Ol"}
      </Button>

      <p className="text-center text-sm text-gray-600">
        Zaten hesabınız var mı?{" "}
        <a href="/login" className="text-blue-600 hover:underline font-medium">
          Giriş yapın
        </a>
      </p>
    </form>
  );
}
