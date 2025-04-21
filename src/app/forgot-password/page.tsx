"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="flex items-center justify-center h-screen px-4">
        {/* Arkaplan resmi için düzeltilmiş CSS */}
        <div className="fixed top-0 left-0 w-full h-full">
          <img
            className="w-full h-full object-cover opacity-50"
            src="/login-teacher-student.webp"
            alt="Background"
          />
        </div>

        {/* Card */}
        <Card className="w-full max-w-md bg-white/95 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_35px_rgb(0,0,0,0.16)] transition-shadow duration-300 border-0">
          <CardHeader className="space-y-4 pb-6">
            <div className="flex justify-center">
              <img src="/logo.png" alt="Logo" className="h-16 w-auto" />
            </div>
            <h1 className="text-2xl font-semibold text-center text-gray-800">
              Şifre Sıfırlama
            </h1>
          </CardHeader>

          <CardContent className="space-y-6">
            {!isVerified ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700"
                  >
                    E-Posta Adresi
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="ornek@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isCodeSent}
                    className="w-full border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <Button
                  onClick={sendMail}
                  disabled={isCodeSent}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 font-medium rounded-lg transition-colors"
                >
                  Kod Gönder
                </Button>

                {isCodeSent && (
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <div className="text-center">
                      <span className="text-sm font-medium text-gray-700">
                        {timer} saniye içinde kodu girin
                      </span>
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="code"
                        className="text-sm font-medium text-gray-700"
                      >
                        Doğrulama Kodu
                      </Label>
                      <Input
                        id="code"
                        type="text"
                        placeholder="6 haneli kodu girin"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="w-full border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-center text-lg tracking-widest"
                        maxLength={6}
                      />
                    </div>
                    <Button
                      onClick={verifyCode}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 font-medium rounded-lg transition-colors"
                    >
                      Doğrula
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="newPassword"
                    className="text-sm font-medium text-gray-700"
                  >
                    Yeni Şifre
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium text-gray-700"
                  >
                    Yeni Şifre Tekrar
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <Button
                  onClick={resetPassword}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 font-medium rounded-lg transition-colors"
                >
                  Şifreyi Güncelle
                </Button>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-center pt-2">
            <Button
              variant="link"
              onClick={() => router.push("/login")}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Giriş sayfasına dön
            </Button>
          </CardFooter>
        </Card>
      </div>

      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}
