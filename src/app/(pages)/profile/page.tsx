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
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { ToastContainer, toast } from "react-toastify";
import { Pencil } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Profile = () => {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND;
  const router = useRouter();

  const successUpdate = () =>
    toast.success("Kullanıcı Bilgileri Güncelleme İşlemi Başarılı!", {
      position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });

  const successDelete = () =>
    toast.success("Kullanıcı Bilgileri Başarıyla Kaldırıldı!", {
      position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });

  const errorUpdate = () =>
    toast.error(
      "Kullanıcı Bilgileri Güncellenemedi, Lütfen Girdiğiniz Bilgileri(Şifrenizi) Kontrol Ediniz!",
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

  const errorDelete = () =>
    toast.error(
      "Kullanıcı Bilgileri Kaldırılamadı, Lütfen Girdiğiniz Bilgileri(Şifrenizi) Kontrol Ediniz!",
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

  const warning = () => {
    toast.warn("Lütfen Şifrenizi Giriniz!", {
      position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });
  };

  // Token Kontrolü
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/user-authentication`, {
          method: "GET",
          credentials: "include", // Çerezleri otomatik ekler
        });

        if (!response.ok) {
          router.push("/login");
        }
      } catch (error) {
        console.error("Kimlik doğrulama hatası:", error);
        router.push("/login");
      }
    };

    checkAuth();
  }, []);

  const handleSaveProfile = async () => {
    if (!formData.currentPassword) {
      warning();
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
        errorUpdate();
        throw new Error("Profil kaydedilemedi.");
      }
      successUpdate();
    } catch (error: any) {
      error();
    }
  };

  const handleDeleteProfile = async () => {
    if (!formData.currentPassword) {
      warning();
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/user`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: formData.currentPassword }),
        credentials: "include",
      });

      if (!response.ok) {
        errorDelete();
        throw new Error("Profil silinemedi.");
      }

      successDelete();
      Cookies.remove("token");

      router.push("/login");

      window.location.href = "/login";
    } catch (error: any) {
      errorDelete();
      error();
    }
  };

  const [isEditing, setIsEditing] = useState(false);
  const [showConfirm, setShowConfirm] = useState<"update" | "delete" | null>(
    null
  );
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    university: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
  });

  useEffect(() => {
    async function fetchUser() {
      const response = await fetch(`${BACKEND_URL}/user`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const userData = await response.json();
      setFormData({
        ...formData,
        name: userData.name || "",
        surname: userData.surname || "",
        email: userData.email || "",
        university: userData.university || "",
        phone: userData.phone || "",
      });
    }
    fetchUser();
  }, []);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="flex m-2 justify-center">
      <Card className="w-full max-w-2xl shadow-lg p-4">
        <CardHeader className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Profil</h1>
          <Button variant="ghost" onClick={() => setIsEditing(!isEditing)}>
            <Pencil className="w-5 h-5" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "İsim", name: "name" },
              { label: "Soyisim", name: "surname" },
              { label: "Email", name: "email" },
              { label: "Kurum", name: "university" },
              { label: "Telefon", name: "phone" },
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700">
                  {field.label}:
                </label>
                <Input
                  type="text"
                  name={field.name}
                  value={formData[field.name as keyof typeof formData]}
                  onChange={handleInputChange}
                  className={`mt-1 w-full ${
                    isEditing
                      ? "bg-white"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                  disabled={!isEditing}
                />
              </div>
            ))}
          </div>
          {isEditing && (
            <>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">
                  Mevcut Şifre:
                </label>
                <Input
                  type="password"
                  name="currentPassword"
                  onChange={handleInputChange}
                  className="mt-1 w-full"
                />
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">
                  Yeni Şifre:
                </label>
                <Input
                  type="password"
                  name="newPassword"
                  onChange={handleInputChange}
                  className="mt-1 w-full"
                />
              </div>
            </>
          )}
        </CardContent>
        {isEditing && (
          <CardFooter className="gap-1 flex my-2">
            {/* Güncelleme Butonu */}
            <Button
              onClick={() => setShowConfirm("update")}
              className="w-full bg-blue-600 text-white hover:bg-blue-700"
            >
              Profili Güncelle
            </Button>

            {/* Silme Butonu */}
            <Button
              onClick={() => setShowConfirm("delete")}
              className="w-full bg-red-600 text-white hover:bg-red-700"
            >
              Profili Kaldır
            </Button>
          </CardFooter>
        )}
      </Card>
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar
        theme="dark"
      />
      {/* Onay Diyaloğu */}
      {showConfirm && (
        <AlertDialog
          open={!!showConfirm}
          onOpenChange={() => setShowConfirm(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {showConfirm === "update"
                  ? "Profili Güncellemek Üzeresiniz!"
                  : "Profili Silmek Üzeresiniz!"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {showConfirm === "update"
                  ? "Profilinizi güncellemek istediğinize emin misiniz?"
                  : "Bu işlemi geri alamazsınız! Profilinizi silmek istediğinize emin misiniz?"}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>İptal</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (showConfirm === "update") {
                    handleSaveProfile();
                  } else {
                    handleDeleteProfile();
                  }
                  setShowConfirm(null);
                }}
              >
                Evet
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default Profile;
