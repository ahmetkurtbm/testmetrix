"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { ToastContainer, toast } from "react-toastify";
import { getCookie } from "@/lib/my-utils";

const roles = ["Öğretmen", "Öğrenci"];

const Register = () => {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND;
  const router = useRouter();

  const success = () =>
    toast.success("Kayıt Başarılı!", {
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
      "Kayıt Başarısız, Lütfen Girdiğiniz Bilgileri Kontrol Ediniz!",
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

  const warnEmail = () =>
    toast.warn("Geçerli bir e-posta adresi girin.", {
      position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });

  const warnPassword = () =>
    toast.warn("Girdiğiniz Şifrelerin Aynı Olduğundan Emin Olun.", {
      position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });

  const [role, setRole] = useState("Öğretmen");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [university, setUniversity] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordAgain, setPasswordAgain] = useState("");
  const [KVKK, setKVKK] = useState(false);

  const handleKVKK = (event: any) => {
    setKVKK(event);
  };

  const handleRegister = async () => {
    const userData = {
      name,
      surname,
      email,
      university,
      phone,
      role,
      KVKK,
      password,
    };

    try {
      if (!email.includes("@") || !email.includes(".")) {
        warnEmail();
        return;
      }

      if (password !== passwordAgain) {
        warnPassword();
        return;
      }
      const response = await fetch(`${BACKEND_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const data = await response.json();
        success();
        navigateLogin();
      } else {
        error();
      }
    } catch (err) {
      console.error("Hata:", err);
    }
  };

  const navigateLogin = () => {
    router.push("/login");
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

        <Card className="w-full max-w-md bg-white/95 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_35px_rgb(0,0,0,0.16)] transition-shadow duration-300 border-0">
          <CardHeader className="space-y-4 pb-6">
            <div className="flex justify-center">
              <img src="/logo.png" alt="Logo" className="h-16 w-auto" />
            </div>
            <h1 className="text-2xl font-semibold text-center text-gray-800">
              Kayıt Ekranı
            </h1>
          </CardHeader>

          <CardContent className="space-y-6">
            <Tabs
              value={role}
              onValueChange={(value) => setRole(value)}
              className="mb-6"
            >
              <TabsList className="w-full bg-gray-100/50 p-1.5 rounded-lg grid grid-cols-2 gap-2">
                {roles.map((r) => (
                  <TabsTrigger
                    key={r}
                    value={r}
                    className={`font-medium rounded-md transition-all duration-300 px-4 py-2.5 ${role === r
                        ? "bg-blue-700 text-white shadow-[0_4px_12px_rgba(59,130,246,0.5)] transform scale-105 ring-2 ring-blue-400 ring-offset-2"
                        : "bg-gray-200/70 text-gray-700 hover:bg-blue-50 hover:text-blue-600 shadow-sm"
                      }`}
                  >
                    {r}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Ad:</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Ad"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Soyad:
                </label>
                <Input
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  className="w-full border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Soyad"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  E-Posta:
                </label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value.trim())}
                  className="w-full border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="E-Posta"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Telefon:
                </label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Telefon"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <label className="text-sm font-medium text-gray-700">
                  Kurum:
                </label>
                <Input
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  className="w-full border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Kurum"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Şifre:
                </label>
                <Input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Şifre"
                  type="password"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Şifre Tekrar:
                </label>
                <Input
                  value={passwordAgain}
                  onChange={(e) => setPasswordAgain(e.target.value)}
                  className="w-full border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Şifre Tekrar"
                  type="password"
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Checkbox
                checked={KVKK}
                onCheckedChange={handleKVKK}
                className="border-gray-300 focus:ring-blue-500"
              />
              <div className="flex gap-1">
                <Link href="kvkk-" className="text-blue-600 hover:underline">
                  KVKK
                </Link>
                <span>ve</span>
                <Link
                  href="ayditlatma-metni-"
                  className="text-blue-600 hover:underline"
                >
                  Aydınlatma Metni'ni
                </Link>
                <span>okudum, onaylıyorum.</span>
              </div>
            </div>

            <Button
              onClick={handleRegister}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 font-medium rounded-lg transition-colors"
            >
              Kayıt Ol
            </Button>

            <div className="flex items-center justify-center gap-2 text-sm">
              <span className="text-gray-600">Zaten hesabınız var mı?</span>
              <button
                onClick={navigateLogin}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Giriş Yap
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

export default Register;
