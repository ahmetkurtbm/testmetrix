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

const roles = ["Yönetici", "Öğretmen", "Öğrenci"];

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

  const [role, setRole] = useState("Öğrenci");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [university, setUniversity] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
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
      role,
      KVKK,
      password,
    };

    try {
      const response = await fetch(`${BACKEND_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Kayıt başarılı");
        success();
        navigateLogin();
      } else {
        error();
        console.log("Kayıt işlemi başarısız");
      }
    } catch (err) {
      console.error("Hata:", err);
    }
  };

  const navigateLogin = () => {
    router.push("/login");
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
            <h1 className="text-2xl font-bold text-center">Kayıt Ekranı</h1>
          </CardHeader>
          <CardContent>
            <Tabs
              value={role}
              onValueChange={(value) => setRole(value)}
              className="mb-4 "
            >
              <TabsList className="w-full bg-blue-200">
                {roles.map((r) => (
                  <TabsTrigger
                    key={r}
                    value={r}
                    className={`font-bold w-full
                ${role === r ? " text-blue-600" : "text-gray-500"}
              `}
                  >
                    {r}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <div className="flex gap-1 w-full">
              <div className="mb-4 w-full">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Ad:
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Ad"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-1 w-full"
                />
              </div>
              <div className="mb-4 w-full">
                <label
                  htmlFor="surname"
                  className="block text-sm font-medium text-gray-700"
                >
                  Soyad:
                </label>
                <Input
                  id="surname"
                  type="text"
                  placeholder="Soyad"
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  required
                  className="mt-1 w-full"
                />
              </div>
            </div>
            <div className="flex gap-1 w-full">
              <div className="mb-4 w-full">
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
              <div className="mb-4 w-full">
                <label
                  htmlFor="university"
                  className="block text-sm font-medium text-gray-700"
                >
                  Kurum:
                </label>
                <Input
                  id="university"
                  type="text"
                  placeholder="Kurum"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  required
                  className="mt-1 w-full"
                />
              </div>
            </div>
            <div className="flex gap-1 w-full">
              <div className="mb-4 w-full">
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Telefon:
                </label>
                <Input
                  id="phone"
                  type="text"
                  placeholder="Telefon"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="mt-1 w-full"
                />
              </div>
            </div>
            <div className="flex gap-1 w-full">
              <div className="mb-4 w-full">
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
              <div className="mb-4 w-full">
                <label
                  htmlFor="passwordAgain"
                  className="block text-sm font-medium text-gray-700"
                >
                  Şifre Tekrar:
                </label>
                <Input
                  id="passwordAgain"
                  type="password"
                  placeholder="Şifre Tekrar"
                  // value={password}
                  // onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1 w-full"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="gap-1 flex-col">
            <label className="text-sm font-medium text-gray-700 align-middle gap-1 flex">
              <Checkbox checked={KVKK} onCheckedChange={handleKVKK} />
              <Link href="kvkk-" className="underline font-bold">
                {" "}
                KVKK{" "}
              </Link>
              ve
              <Link href="ayditlatma-metni-" className="underline font-bold">
                {" "}
                Aydınlatma Metni'ni{" "}
              </Link>{" "}
              okudum, onaylıyorum.
            </label>
            <Button
              onClick={handleRegister}
              className="w-full bg-blue-600 text-white hover:bg-blue-700"
            >
              Kayıt Ol
            </Button>
            <label className="block text-sm font-medium text-gray-700">
              Zaten Hesabınız var mı ?
            </label>
            <Button
              onClick={navigateLogin}
              className="w-full bg-blue-600 text-white hover:bg-blue-700"
            >
              Giriş Yap
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

export default Register;
