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
import { deleteCookie, getCookie } from "@/lib/my-utils";

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
      const token = await getCookie();
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const response = await fetch(`${BACKEND_URL}/user-authentication`, {
          method: "GET",
          headers: {
            Authorization: token,
          },
          credentials: "include",
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
      const token = await getCookie();
      if (!token) {
        return;
      }
      const response = await fetch(`${BACKEND_URL}/user`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json", Authorization: token,
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
      const token = await getCookie();
      if (!token) {
        return;
      }
      const response = await fetch(`${BACKEND_URL}/user`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json", Authorization: token,
        },
        body: JSON.stringify({ password: formData.currentPassword }),
        credentials: "include",
      });

      if (!response.ok) {
        errorDelete();
        throw new Error("Profil silinemedi.");
      }

      successDelete();
      deleteCookie();

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
      const token = await getCookie();
      if (!token) {
        return;
      }
      const response = await fetch(`${BACKEND_URL}/user`, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: token },
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
    <div className="h-full flex justify-center items-center p-4 relative">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <img
          className="w-full h-full object-cover opacity-30"
          src="profil-bg.jpg"
          alt="background"
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-2xl">
        <Card className="shadow-xl border border-gray-200 bg-white/95 backdrop-blur-sm">
          <CardHeader className="flex flex-row justify-between items-center pb-4">
            <h1 className="text-2xl font-bold text-gray-800">Profil</h1>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="hover:bg-gray-100"
            >
              <Pencil className="w-5 h-5" />
            </Button>
          </CardHeader>
          <CardContent className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: "İsim", name: "name" },
              { label: "Soyisim", name: "surname" },
              { label: "Email", name: "email" },
              { label: "Kurum", name: "university" },
              { label: "Telefon", name: "phone" },
            ].map((field) => (
              <div key={field.name} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {field.label}:
                </label>
                <Input
                  type="text"
                  name={field.name}
                  value={formData[field.name as keyof typeof formData]}
                  onChange={handleInputChange}
                  className={`w-full transition-colors ${isEditing
                      ? "bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      : "bg-gray-100 text-gray-600 cursor-not-allowed border-gray-200"
                    }`}
                  disabled={!isEditing}
                />
              </div>
            ))}
            </div>
            
            {isEditing && (
              <div className="mt-8 space-y-6 border-t pt-6">
                <h3 className="text-lg font-medium text-gray-800">Şifre Değiştir</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Mevcut Şifre:
                    </label>
                    <Input
                      type="password"
                      name="currentPassword"
                      onChange={handleInputChange}
                      className="w-full focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Mevcut şifrenizi girin"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Yeni Şifre:
                    </label>
                    <Input
                      type="password"
                      name="newPassword"
                      onChange={handleInputChange}
                      className="w-full focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Yeni şifrenizi girin"
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          
          {isEditing && (
            <CardFooter className="flex flex-col sm:flex-row gap-4 px-6 py-6 bg-gray-50 border-t">
              <Button
                onClick={() => setShowConfirm("update")}
                className="w-full sm:w-1/2 bg-blue-600 text-white hover:bg-blue-700 font-medium py-2.5"
              >
                Profili Güncelle
              </Button>
              <Button
                onClick={() => setShowConfirm("delete")}
                className="w-full sm:w-1/2 bg-red-600 text-white hover:bg-red-700 font-medium py-2.5"
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
    </div>
  );
};

export default Profile;
