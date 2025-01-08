"use client";
import { useEffect, useState } from "react";

import Cookies from "js-cookie";
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

const roles = ["Admin", "Teacher", "Student", "Guest"];

const Login = () => {
  const [role, setRole] = useState<string>("Student");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  useEffect(() => {
    if (Cookies.get("token")) {
      window.location.href = "/folders";
    }
  }, []);

  const handleLogin = async () => {
    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Cookies.set("token", data.token, { expires: 1 }); // 1 günlüğüne token kaydet
        console.log("Başarılı giriş, token cookies'e kaydedildi");
      } else {
        console.error("Giriş başarısız:", data.error);
      }
    } catch (error) {
      console.error("Giriş sırasında hata oluştu:", error);
    }
  };

  return (
    <>
      <Head>
        <title>Login</title>
        <meta name="description" content="Login Page" />
      </Head>
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <h1 className="text-2xl font-bold text-center">Giriş Yap</h1>
          </CardHeader>
          <CardContent>
            <Tabs
              value={role}
              onValueChange={(value) => setRole(value)}
              className="mb-4"
            >
              <TabsList>
                {roles.map((r) => (
                  <TabsTrigger
                    key={r}
                    value={r}
                    className={
                      role === r ? "font-bold text-blue-600" : "text-gray-500"
                    }
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
          <CardFooter>
            <Button
              onClick={handleLogin}
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

export default Login;
