"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiPost } from "@/lib/api-client";

export function ResetPasswordForm({ token }: { token: string | null }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [passwordAgain, setPasswordAgain] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!token) {
      setError("Bağlantı geçersiz. Sıfırlama işlemini yeniden başlatın.");
      return;
    }
    if (password !== passwordAgain) {
      setError("Parolalar aynı değil.");
      return;
    }

    setLoading(true);
    try {
      await apiPost("/api/password/reset", { token, password });
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sıfırlama başarısız oldu.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <p className="text-sm text-red-600 text-center">
        Bağlantı geçersiz ya da eksik. Şifremi unuttum sayfasından yeniden
        deneyin.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-sm text-gray-700">
          Yeni Parola
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
          Yeni Parola (Tekrar)
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
        {loading ? "Kaydediliyor..." : "Parolayı Güncelle"}
      </Button>
    </form>
  );
}
