"use client";
import { useState } from "react";
import Head from "next/head";
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

const roles = ["Yönetici", "Öğretmen", "Öğrenci"];

const Register = () => {
  const router = useRouter();

  const [role, setRole] = useState("Öğrenci");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [university, setUniversity] = useState("");
  const [password, setPassword] = useState("");
  const [KVKK, setKVKK] = useState(false);

  const handleKVKK = (event: any) => {
    setKVKK(event);
    console.log("Checkbox Durumu:", event);
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
      const response = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error("Kayıt işlemi başarısız");
      }

      const data = await response.json();
      console.log("Kayıt başarılı:", data);
      navigateLogin();
    } catch (error) {
      console.error("Hata:", error);
    }
  };

  const navigateLogin = () => {
    router.push("/login");
  };

  return (
    <>
      <Head>
        <title>Kayıt Ekranı</title>
        <meta name="description" content="Register Page" />
      </Head>
      <div className="flex items-center justify-center h-screen">
        <img
          className="absolute inset-0 w-full h-full object-cover opacity-50 z-[-1]"
          src="login-teacher-student.webp"
        />
        <Card className="w-full max-w-md shadow-lg">
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
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                isim:
              </label>
              <Input
                id="name"
                type="text"
                placeholder="İsim"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1 w-full"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="surname"
                className="block text-sm font-medium text-gray-700"
              >
                Soyisim:
              </label>
              <Input
                id="surname"
                type="text"
                placeholder="Soyisim"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                required
                className="mt-1 w-full"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email:
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 w-full"
              />
            </div>
            <div className="mb-4">
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
    </>
  );
};

export default Register;
