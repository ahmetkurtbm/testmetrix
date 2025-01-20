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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";

const roles = ["Admin", "Teacher", "Student", "Guest"];

const Register = () => {
  const router = useRouter();

  const [role, setRole] = useState("Student");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [university, setUniversity] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    const userData = {
      name,
      surname,
      email,
      university,
      role,
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
      // Başarılı kayıt işleminden sonra yapılacaklar
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
        <title>Kayıt Ol</title>
        <meta name="description" content="Register Page" />
      </Head>
      <div className="flex items-center justify-center h-screen bg-blue-200">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <h1 className="text-2xl font-bold text-center">Kayıt Ol</h1>
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
            <div className="mb-4">
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
                Üniversite:
              </label>
              <Input
                id="university"
                type="text"
                placeholder="Üniversite"
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
              <Checkbox></Checkbox>
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
              Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
};

export default Register;
