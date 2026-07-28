"use client";

import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { apiDelete, apiGet, apiPatch } from "@/lib/api-client";
import { signOutAction } from "@/app/actions/auth";
import { fmt, fmtDate } from "@/lib/format";
import type { ExamSummary, FolderSummary, Profile } from "@/features/exams/types";
import {
  Card,
  GhostButton,
  PageHeader,
  PageShell,
  PrimaryButton,
  SectionTitle,
  StatTile,
} from "@/features/ui/primitives";

const ROLE_LABELS = {
  ADMIN: "Yönetici",
  TEACHER: "Öğretmen",
  STUDENT: "Öğrenci",
} as const;

/**
 * Profil.
 *
 * Ad, e-posta ve parola alanları YOK — GateHub'da yönetiliyor. Eski sürüm
 * burada parola değiştiriyor ve e-postayı doğrulama istemeden güncelliyordu.
 */
export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [usage, setUsage] = useState<{
    folders: number;
    exams: number;
    students: number;
    avgKr20: number | null;
  } | null>(null);

  const [university, setUniversity] = useState("");
  const [phone, setPhone] = useState("");
  const [kvkk, setKvkk] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiGet<Profile>("/api/profile")
      .then((data) => {
        setProfile(data);
        setUniversity(data.university ?? "");
        setPhone(data.phone ?? "");
        setKvkk(data.kvkkAcceptedAt !== null);
      })
      .catch((error) =>
        toast.error(error instanceof Error ? error.message : "Profil yüklenemedi.", {
          theme: "dark",
        })
      );

    // Kullanım özeti mevcut uç noktalardan türetiliyor; yeni API gerekmedi.
    Promise.all([
      apiGet<FolderSummary[]>("/api/folders"),
      apiGet<ExamSummary[]>("/api/exams"),
    ])
      .then(([folders, exams]) => {
        const measured = exams.filter((e) => e.stat?.kr20 != null);
        setUsage({
          folders: folders.length,
          exams: exams.length,
          students: exams.reduce((sum, e) => sum + e.studentCount, 0),
          avgKr20: measured.length
            ? measured.reduce((sum, e) => sum + (e.stat!.kr20 as number), 0) /
              measured.length
            : null,
        });
      })
      .catch(() => setUsage(null));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiPatch("/api/profile", {
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

  const handleDeleteAccount = async () => {
    if (
      !confirm(
        "Hesabınız ve tüm klasörleriniz, sınavlarınız kalıcı olarak silinecek. " +
          "GateHub hesabınız etkilenmez. Emin misiniz?"
      )
    )
      return;
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
      <PageShell>
        <p className="text-sm text-[var(--viz-text-secondary)]">Yükleniyor...</p>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader
        title={profile.name}
        meta={`${profile.email} · ${ROLE_LABELS[profile.role]}`}
      />

      {usage && (
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <StatTile label="Klasör" value={String(usage.folders)} />
          <StatTile label="Sınav" value={String(usage.exams)} />
          <StatTile label="Öğrenci kaydı" value={String(usage.students)} />
          <StatTile label="Ortalama KR-20" value={fmt(usage.avgKr20)} />
        </div>
      )}

      <Card>
        <SectionTitle
          title="Hesap bilgileri"
          hint="Ad, e-posta ve parola GateHub üzerinden yönetilir; buradan değiştirilemez."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs text-[var(--viz-text-secondary)]">Ad Soyad</Label>
            <div className="p-2.5 rounded-md bg-[var(--viz-surface)] text-sm text-[var(--viz-text)]">
              {profile.name}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-[var(--viz-text-secondary)]">E-posta</Label>
            <div className="p-2.5 rounded-md bg-[var(--viz-surface)] text-sm text-[var(--viz-text)] break-all">
              {profile.email}
            </div>
          </div>
        </div>
        {profile.kvkkAcceptedAt && (
          <p className="mt-3 text-xs text-[var(--viz-text-muted)]">
            KVKK onayı: {fmtDate(profile.kvkkAcceptedAt)}
          </p>
        )}
      </Card>

      <Card>
        <SectionTitle title="Kurum bilgileri" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="university" className="text-xs">
              Üniversite / Kurum
            </Label>
            <Input
              id="university"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              placeholder="Örn. Ankara Üniversitesi"
              className="text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-xs">
              Telefon
            </Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="05xx xxx xx xx"
              className="text-sm"
            />
          </div>
        </div>

        <div className="mt-4 flex items-start gap-2">
          <Checkbox
            id="kvkk"
            checked={kvkk}
            onCheckedChange={(value) => setKvkk(value === true)}
          />
          <Label htmlFor="kvkk" className="text-xs text-[var(--viz-text-secondary)] leading-snug">
            Kişisel verilerimin işlenmesine ilişkin aydınlatma metnini okudum ve
            onaylıyorum.
          </Label>
        </div>

        <div className="mt-4">
          <PrimaryButton onClick={handleSave} disabled={saving}>
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </PrimaryButton>
        </div>
      </Card>

      <Card>
        <SectionTitle
          title="Hesabı sil"
          hint="Klasörleriniz ve sınavlarınız kalıcı olarak silinir. GateHub hesabınız etkilenmez."
        />
        <GhostButton onClick={handleDeleteAccount}>
          Hesabımı ve tüm verilerimi sil
        </GhostButton>
      </Card>

      <ToastContainer position="bottom-right" theme="dark" />
    </PageShell>
  );
}
