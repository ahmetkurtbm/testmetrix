"use client";

import { PageContainer, PageHeader, Section } from "@/components/app/page";
import { InstallApp } from "@/components/InstallApp";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
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
      <PageContainer narrow>
        <div className="h-64 animate-pulse rounded-xl border border-gray-200 bg-surface" />
      </PageContainer>
    );
  }

  return (
    <PageContainer narrow>
      <PageHeader eyebrow="Hesap" title="Profil" description="Kişisel bilgileriniz, parolanız ve hesap ayarlarınız." />

        <Section title="Kişisel bilgiler">
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="name">Ad Soyad</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-gray-600">E-posta</Label>
                <div className="flex h-10 items-center rounded-md bg-gray-100 px-3 text-sm text-gray-700 break-all">
                  {profile.email}
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-gray-600">Rol</Label>
              <div className="flex h-10 items-center rounded-md bg-gray-100 px-3 text-sm text-gray-700">
                {ROLE_LABELS[profile.role]}
              </div>
            </div>

            <div className="space-y-4 border-t border-gray-200 pt-5">
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
                {saving ? "Kaydediliyor…" : "Kaydet"}
              </Button>
            </div>
          </div>
        </Section>

        {profile.hasPassword && (
          <Section title="Parola değiştir">
            <div className="space-y-4">
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
                {changingPassword ? "Güncelleniyor…" : "Parolayı güncelle"}
              </Button>
            </div>
          </Section>
        )}

        <Section title="Mobil uygulama" description="TestMetrix'i telefonunuzun ana ekranına ekleyin; kendi simgesiyle tam ekran açılır.">
          <InstallApp />
        </Section>

        <Section
          title={<span className="text-red-600">Hesabı sil</span>}
          description="Bu işlem klasörlerinizi ve sınavlarınızı kalıcı olarak siler."
          className="border-red-200 dark:border-red-900/60"
        >
            <Button
              variant="outline"
              onClick={handleDeleteAccount}
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              Hesabımı ve tüm verilerimi sil
            </Button>
        </Section>

      <ToastContainer position="bottom-right" />
    </PageContainer>
  );
}
