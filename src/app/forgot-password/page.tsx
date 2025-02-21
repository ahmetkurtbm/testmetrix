"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

export default function ForgotPassword() {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND;
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sentCode, setSentCode] = useState<string | null>(null);
  const [timer, setTimer] = useState<number>(60);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const sendMail = async () => {
    if (!email) return alert("Lütfen bir e-posta girin");

    // Simülasyon: Burada bir API isteği yapılabilir
    const generatedCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    setSentCode(generatedCode);
    setIsCodeSent(true);

    const handleSendMail = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/forgot-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, generatedCode }),
        });

        if (response.ok) {
          console.log("mail gönderildi");
          //success();
        } else {
          const data = await response.json();
          console.error("Mail atılamadı:", data.error);
          //error();
        }
      } catch (error) {
        console.error("Giriş sırasında hata oluştu:", error);
      }
    };

    handleSendMail();

    let countdown = 60;
    const interval = setInterval(() => {
      countdown--;
      setTimer(countdown);
      if (countdown === 0) {
        clearInterval(interval);
        setSentCode(null);
        setIsCodeSent(false);
      }
    }, 1000);
  };

  const verifyCode = () => {
    if (code === sentCode) {
      setIsVerified(true);
      alert("Kod doğrulandı, yeni şifrenizi belirleyin!");
    } else {
      alert("Girilen kod yanlış veya süresi doldu!");
    }
  };

  const resetPassword = async () => {
    if (!newPassword || !confirmPassword)
      return alert("Lütfen tüm alanları doldurun");
    if (newPassword !== confirmPassword) return alert("Şifreler eşleşmiyor");
    alert("Şifreniz başarıyla güncellendi!");

    try {
      const response = await fetch(`${BACKEND_URL}/user-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, newPassword }),
      });

      if (!response.ok) {
        //errorUpdate();
        throw new Error("Şifre değiştirilemedi.");
      }
      //successUpdate();
      console.log("başarıyla şifre değiştirildi.");
      router.push("/login");
    } catch (error: any) {
      error();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-screen gap-4">
      <h2 className="text-xl font-bold">Şifre Sıfırlama</h2>
      {!isVerified ? (
        <>
          <Input
            className="w-15"
            type="email"
            placeholder="E-posta adresinizi girin"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isCodeSent}
          />
          <Button onClick={sendMail} disabled={isCodeSent}>
            Kod Gönder
          </Button>
          {isCodeSent && (
            <div className="flex flex-col items-center gap-2">
              <p>{timer} saniye içinde kodu girin</p>
              <Input
                type="text"
                placeholder="Gönderilen kodu girin"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <Button onClick={verifyCode}>Doğrula</Button>
            </div>
          )}
        </>
      ) : (
        <>
          <Input
            className="w-15"
            type="password"
            placeholder="Yeni Şifre"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <Input
            className="w-15"
            type="password"
            placeholder="Yeni Şifre Tekrar"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Button onClick={resetPassword}>Şifreyi Güncelle</Button>
        </>
      )}
    </div>
  );
}
