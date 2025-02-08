"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const Profile = () => {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND;

  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    university: "",
    currentPassword: "",
    newPassword: "",
  });

  useEffect(() => {
    async function fetchUser() {
      const response = await fetch(`${BACKEND_URL}/user`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const userData = await response.json();

      setFormData({
        ...formData,
        name: userData.name || "",
        surname: userData.surname || "",
        email: userData.email || "",
        university: userData.university || "",
      });
    }
    fetchUser();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    if (!formData.currentPassword) {
      alert("Lütfen güncelleme işlemi için şifrenizi giriniz.");
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/user`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Profil kaydedilemedi.");
      }

      alert("Profil güncellendi.");
    } catch (error: any) {
      alert("Hata: " + error.message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-center h-screen">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <h1 className="text-2xl font-bold text-center">Profil Düzenle</h1>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                İsim:
              </label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                name="name"
                onChange={handleInputChange}
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
                value={formData.surname}
                name="surname"
                onChange={handleInputChange}
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
                value={formData.email}
                name="email"
                onChange={handleInputChange}
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
                value={formData.university}
                name="university"
                onChange={handleInputChange}
                required
                className="mt-1 w-full"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Mevcut Şifre:
              </label>
              <Input
                id="currentPassword"
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                className="mt-1 w-full"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Yeni Şifre:
              </label>
              <Input
                id="newPassword"
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                className="mt-1 w-full"
              />
            </div>
          </CardContent>
          <CardFooter className="gap-1 flex-col">
            <Button
              onClick={handleSaveProfile}
              className="w-full bg-blue-600 text-white hover:bg-blue-700"
            >
              Profili Güncelle
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
