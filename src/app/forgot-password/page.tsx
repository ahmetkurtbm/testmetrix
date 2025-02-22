"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";

export default function ForgotPassword() {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND;
  const router = useRouter();

  const success = () =>
    toast.success("Şifre Yenileme Başarılı!", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });

  const successMail = () =>
    toast.success("Kod Mail Adresinize Gönderildi!", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });

  const successCode = () =>
    toast.success("Kod Doğrulandı!", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });

  const error = () =>
    toast.error("Şifre Yenileme, Başarısız!", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });

  const errorMail = () =>
    toast.error("Bu Mail Adres Kayıtlı Kullanıcılarımıza Ait Değildir!", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });

  const warn = () =>
    toast.warn("Lütfen tüm alanları doldurun!", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });

  const warnSamePassword = () =>
    toast.warn("Şifreler eşleşmiyor!", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });

  const warnCode = () =>
    toast.warn("Girilen kod yanlış veya süresi doldu!", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });

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
          setTimeout(() => {
            successMail();
          }, 3000);
        } else {
          const data = await response.json();
          console.error("Mail atılamadı:", data.error);
          errorMail();
          setTimeout(() => {
            window.location.reload();
          }, 3000);
        }
      } catch (error) {
        errorMail();
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
    }, 3000);
  };

  const verifyCode = () => {
    if (code === sentCode) {
      setIsVerified(true);
      setTimeout(() => {
        successCode();
      }, 3000);
    } else {
      warnCode();
    }
  };

  const resetPassword = async () => {
    if (!newPassword || !confirmPassword) return warn();
    if (newPassword !== confirmPassword) return warnSamePassword();

    try {
      const response = await fetch(`${BACKEND_URL}/user-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, newPassword }),
      });

      if (!response.ok) {
        error();
        throw new Error("Şifre değiştirilemedi.");
      }
      setTimeout(() => {
        success();
      }, 3000);
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
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
}
