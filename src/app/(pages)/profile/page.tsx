"use client";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useState, useEffect } from "react";

type FormData = Record<string, string>;

export default function Page() {
  const [formData, setFormData] = useState<FormData>({});
  const [tokenData, setTokenData] = useState<Record<string, any>>({});

  useEffect(() => {
    // Cookie'den dinamik olarak tüm verileri çek
    const cookies = document.cookie
      .split(";")
      .reduce((acc: FormData, cookie) => {
        const [key, value] = cookie.split("=");
        acc[key.trim()] = decodeURIComponent(value);
        return acc;
      }, {});

    setFormData(cookies);

    // Token çözme işlemi
    if (cookies.token) {
      try {
        const decodedToken = JSON.parse(atob(cookies.token.split(".")[1]));
        setTokenData(decodedToken);
      } catch (error) {
        console.error("Token çözme işlemi başarısız:", error);
      }
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const response = await fetch("/api/save-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to save data");
      }

      alert("Profile updated successfully!");
    } catch (error: any) {
      alert("Error saving profile: " + error.message);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6 p-6">
      {/* Avatar Bölümü */}
      <div className="flex items-center justify-center w-24 h-24 bg-gray-200 rounded-full">
        <Avatar className="w-20 h-20">A</Avatar>
      </div>

      {/* Dinamik Input Alanları */}
      <div className="w-full max-w-md space-y-4">
        {Object.entries(tokenData).map(([key, value]) => (
          <>
            <p>{key}</p>
            <Input
              key={key}
              name={key}
              value={value}
              onChange={handleInputChange}
              placeholder={`Enter your ${key}`}
            />
          </>
        ))}
      </div>

      {/* Kaydet Düğmesi */}
      <Button onClick={handleSave} className="w-full max-w-md">
        Save Changes
      </Button>
    </div>
  );
}
