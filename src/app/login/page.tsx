"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ToastContainer, toast } from "react-toastify";
import { Label } from "@/components/ui/label";

const roles = ["Yönetici", "Öğretmen", "Öğrenci"];

const Login = () => {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND;
  const router = useRouter();

  const success = () =>
    toast.success("Giriş Başarılı!", {
      position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });

  const error = () =>
    toast.error(
      "Giriş Başarısız, Lütfen Girdiğiniz Bilgileri Kontrol Ediniz!",
      {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      }
    );

  const [role, setRole] = useState<string>("Öğretmen");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  // Token kontrolü
  useEffect(() => {
    const checkAuth = async () => {
      const response = await fetch(`${BACKEND_URL}/user-authentication`, {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        router.push("/folders");
      }
    };
    ////checkAuth();
  }, []);

  const handleLogin = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role, password }),
        credentials: "include", // Çerezlerin backend'e kaydedilmesini sağlar
      });

      if (response.ok) {
        router.push("/folders");
        success();
      } else {
        const data = await response.json();
        console.error("Giriş başarısız:", data.error);
        error();
      }
    } catch (error) {
      console.error("Giriş sırasında hata oluştu:", error);
    }
  };

  const navigateRegister = () => {
    router.push("/register");
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

        <Card className="w-full max-w-md bg-white/95 backdrop-blur-md shadow-xl hover:shadow-2xl transition-shadow duration-300 border-0">
          <CardHeader className="space-y-4 pb-6">
            <div className="flex justify-center">
              {/* Logo eklenebilir */}
              <img src="logo.png" alt="Logo" className="h-16 w-auto" />
            </div>
            <h1 className="text-2xl font-semibold text-center text-gray-800">
              Eğitim Bilgi Sistemi
            </h1>
          </CardHeader>

          <CardContent className="space-y-6">
            <Tabs
              value={role}
              onValueChange={(value) => setRole(value)}
              className="mb-6"
            >
              <TabsList className="w-full h-full bg-gray-200/70 p-2 rounded-lg grid grid-cols-3 gap-2">
                {roles.map((r) => (
                  <TabsTrigger
                    key={r}
                    value={r}
                    className={`font-medium rounded-md transition-all duration-300 px-4 py-2.5 ${
                      role === r
                        ? "bg-blue-700 text-white shadow-[0_4px_12px_rgba(59,130,246,0.5)] transform scale-105 ring-2 ring-blue-400 ring-offset-2"
                        : "bg-white/90 text-gray-700 hover:bg-blue-50 hover:text-blue-600 shadow-sm"
                    }`}
                  >
                    {r}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="ornek@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                >
                  Şifre
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-2">
            <Button
              onClick={handleLogin}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 font-medium rounded-lg transition-colors"
            >
              Giriş Yap
            </Button>

            <div className="flex items-center justify-between w-full text-sm">
              <button
                onClick={() => router.push("forgot-password")}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Şifremi Unuttum
              </button>
              <button
                onClick={navigateRegister}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Hesap Oluştur
              </button>
            </div>
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
};

export default Login;
