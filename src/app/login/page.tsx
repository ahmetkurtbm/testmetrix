"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

const roles = ["Yönetici", "Öğretmen", "Öğrenci"];

const Login = () => {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND;

  const router = useRouter();

  const [role, setRole] = useState<string>("Öğrenci");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  useEffect(() => {
    if (Cookies.get("token")) {
      router.push("/folders");
    }
  }, []);

  const handleLogin = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include", // Çerezlerin set edilmesini sağlar
      });

      const data = await response.json();

      if (response.ok) {
        Cookies.set("token", data.token, { expires: 1 / 24 }); // Token'ı elle çerezlere kaydet
        router.push("/folders");
      } else {
        console.error("Giriş başarısız:", data.error);
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
        <Card className="w-full max-w-md shadow-lg">
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
              <TabsList className="w-full border bg-slate-200 gap-1">
                {roles.map((r) => (
                  <TabsTrigger
                    key={r}
                    value={r}
                    className={`font-bold bg-slate-100 w-full
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
    </div>
  );
};

export default Login;
