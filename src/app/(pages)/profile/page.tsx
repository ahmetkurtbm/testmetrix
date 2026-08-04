"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ToastContainer, toast } from "react-toastify";
import { apiDelete, apiGet, apiPatch } from "@/lib/api-client";
import { signOutAction } from "@/app/actions/auth";
import type { Profile } from "@/features/exams/types";

const ROLE_LABELS = {
  ADMIN: "Yönetici",
  TEACHER: "Öğretmen",
  STUDENT: "Öğrenci",
} as const;

/**
 * Profil sayfası.
 *
 * E-posta değiştirilemez (benzersizlik ve oturum kimliği ona bağlı), ama ad
 * ve parola artık buradan yönetiliyor — kimlik doğrulama kendi sistemimizde
 * olduğu için.
 */
export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [university, setUniversity] = useState("");
  const [phone, setPhone] = useState("");
  const [kvkk, setKvkk] = useState(false);
  const [saving, setSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordAgain, setNewPasswordAgain] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    apiGet<Profile>("/api/profile")
      .then((data) => {
        setProfile(data);
        setName(data.name);
        setUniversity(data.university ?? "");
        setPhone(data.phone ?? "");
        setKvkk(data.kvkkAcceptedAt !== null);
      })
      .catch((error) =>
        toast.error(
          error instanceof Error ? error.message : "Profil yüklenemedi.",
          { theme: "dark" }
        )
      );
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiPatch("/api/profile", {
        name: name.trim(),
        university: university.trim() || null,
        phone: phone.trim() || null,
        kvkkAccepted: kvkk,
      });
      toast.success("Bilgiler güncellendi.", { theme: "dark" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Güncellenemedi.", {
        theme: "dark",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== newPasswordAgain) {
      toast.error("Yeni parolalar aynı değil.", { theme: "dark" });
      return;
    }
    setChangingPassword(true);
    try {
      await apiPatch("/api/profile/password", { currentPassword, newPassword });
      toast.success("Parola güncellendi.", { theme: "dark" });
      setCurrentPassword("");
      setNewPassword("");
      setNewPasswordAgain("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Parola değiştirilemedi.",
        { theme: "dark" }
      );
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !confirm(
        "Hesabınız ve tüm klasörleriniz, sınavlarınız kalıcı olarak silinecek. Emin misiniz?"
      )
    ) {
      return;
    }

    try {
      await apiDelete("/api/profile");
      await signOutAction();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Hesap silinemedi.", {
        theme: "dark",
      });
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="bg-white/95 shadow-sm">
          <CardHeader>
            <h1 className="text-xl font-semibold text-gray-800">Profil</h1>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="name">Ad Soyad</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-gray-600">E-posta</Label>
                <div className="p-2.5 bg-gray-100 rounded-md text-sm text-gray-700 break-all">
                  {profile.email}
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-gray-600">Rol</Label>
              <div className="p-2.5 bg-gray-100 rounded-md text-sm text-gray-700">
                {ROLE_LABELS[profile.role]}
              </div>
            </div>

            <div className="border-t pt-5 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="university">Üniversite / Kurum</Label>
                <Input
                  id="university"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  placeholder="Örn. Ankara Üniversitesi"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Örn. 05xx xxx xx xx"
                />
              </div>

              <div className="flex items-start gap-2">
                <Checkbox
                  id="kvkk"
                  checked={kvkk}
                  onCheckedChange={(value) => setKvkk(value === true)}
                />
                <Label
                  htmlFor="kvkk"
                  className="text-sm text-gray-600 leading-snug"
                >
                  Kişisel verilerimin işlenmesine ilişkin aydınlatma metnini
                  okudum ve onaylıyorum.
                </Label>
              </div>

              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {profile.hasPassword && (
          <Card className="bg-white/95 shadow-sm">
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-800">Parola Değiştir</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="currentPassword">Mevcut Parola</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="newPassword">Yeni Parola</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="newPasswordAgain">Yeni Parola (Tekrar)</Label>
                  <Input
                    id="newPasswordAgain"
                    type="password"
                    value={newPasswordAgain}
                    onChange={(e) => setNewPasswordAgain(e.target.value)}
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500">
                En az 12 karakter; büyük harf, küçük harf ve rakam içermeli.
              </p>
              <Button
                onClick={handleChangePassword}
                disabled={changingPassword || !currentPassword || !newPassword}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {changingPassword ? "Güncelleniyor..." : "Parolayı Güncelle"}
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="bg-white/95 shadow-sm border-red-200">
          <CardHeader>
            <h2 className="text-lg font-semibold text-red-700">Hesabı Sil</h2>
            <p className="text-sm text-gray-600">
              Bu işlem klasörlerinizi ve sınavlarınızı kalıcı olarak siler.
            </p>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={handleDeleteAccount}
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              Hesabımı ve Tüm Verilerimi Sil
            </Button>
          </CardContent>
        </Card>
      </div>

      <ToastContainer position="bottom-right" theme="dark" />
    </div>
  );
}
