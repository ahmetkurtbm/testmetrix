"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiPost } from "@/lib/api-client";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      await apiPost("/api/password/request-reset", { email });
    } finally {
      // Hata olsa bile aynı ekran gösterilir: "bu e-posta kayıtlı mı?"
      // sorusunun cevabı istemciye hiçbir yoldan sızmamalı.
      setLoading(false);
      setSent(true);
    }
  };

  if (sent) {
    return (
      <p className="text-sm text-gray-700 text-center leading-relaxed">
        Bu e-posta kayıtlıysa sıfırlama bağlantısı gönderildi. Gelen kutunuzu
        (ve spam klasörünü) kontrol edin.
      </p>
    );
  }

  return (
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

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 text-base font-medium rounded-lg"
      >
        {loading ? "Gönderiliyor..." : "Sıfırlama Bağlantısı Gönder"}
      </Button>

      <p className="text-center text-sm text-gray-600">
        <a href="/login" className="text-blue-600 hover:underline font-medium">
          Giriş sayfasına dön
        </a>
      </p>
    </form>
  );
}
