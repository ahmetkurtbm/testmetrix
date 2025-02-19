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
import { Checkbox } from "@/components/ui/checkbox";

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

  const [role, setRole] = useState<string>("Öğrenci");
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
    checkAuth();
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
        console.log("Giriş başarılı. Çerez tarayıcıya kaydedildi.");
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
    <div>
      <div className="flex items-center justify-center h-screen">
        <img
          className="absolute inset-0 w-full h-full object-cover opacity-50 z-[-1]"
          src="login-teacher-student.webp"
        />
        <Card className="w-full max-w-lg shadow-lg">
          <CardHeader>
            <h1 className="text-2xl font-bold text-center bg-gray-300 rounded-md p-1">
              Giriş Ekranı
            </h1>
          </CardHeader>
          <CardContent>
            <Tabs
              value={role}
              onValueChange={(value) => setRole(value)}
              className="mb-4"
            >
              <TabsList className="w-full bg-blue-200 ">
                {roles.map((r) => (
                  <TabsTrigger
                    key={r}
                    value={r}
                    className={`font-bold  w-full
                ${role === r ? " text-blue-600" : "text-gray-500"}
              `}
                  >
                    {r}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                E-Posta:
              </label>
              <Input
                id="email"
                type="email"
                placeholder="E-Posta"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 w-full"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Şifre:
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Şifre"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 w-full"
              />
              <div className="flex align-middle mt-2 justify-between">
                <div className="flex items-center gap-1">
                  <Checkbox></Checkbox>
                  <p>Beni Hatırla</p>
                </div>
                <p className="font-bold text-blue-950 cursor-pointer">
                  Şifremi unuttum
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-1 ">
            <Button
              onClick={handleLogin}
              className="w-full bg-blue-600 text-white hover:bg-blue-700"
            >
              Giriş Yap
            </Button>
            <label className="block text-sm font-medium text-gray-700">
              Hesabınız yok mu ?
            </label>
            <Button
              onClick={navigateRegister}
              className="w-full bg-blue-600 text-white hover:bg-blue-700"
            >
              Kayıt Ol
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
        theme="dark"
      />
    </div>
  );
};

export default Login;
