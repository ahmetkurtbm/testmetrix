"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";

type Role = "ADMIN" | "TEACHER" | "STUDENT";

const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Yönetici",
  TEACHER: "Öğretmen",
  STUDENT: "Öğrenci",
};

export function UserActions({
  userId,
  role,
  email,
  isSelf,
}: {
  userId: string;
  role: Role;
  email: string;
  isSelf: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const send = async (init: RequestInit) => {
    setError(null);
    const response = await fetch(`/api/admin/users/${userId}`, init);
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      setError(body.error ?? "İşlem başarısız");
      return;
    }
    startTransition(() => router.refresh());
  };

  return (
    <div className="flex items-center justify-end gap-2">
      {error && <span className="text-xs text-red-600">{error}</span>}

      <select
        value={role}
        disabled={pending || isSelf}
        onChange={(event) =>
          send({
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role: event.target.value }),
          })
        }
        className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm disabled:opacity-50"
      >
        {(Object.keys(ROLE_LABELS) as Role[]).map((value) => (
          <option key={value} value={value}>
            {ROLE_LABELS[value]}
          </option>
        ))}
      </select>

      <Button
        variant="ghost"
        disabled={pending || isSelf}
        onClick={() => {
          if (
            confirm(
              `${email} hesabı ve bu hesaba ait tüm klasör/sınavlar kalıcı olarak silinecek. Emin misiniz?`
            )
          ) {
            send({ method: "DELETE" });
          }
        }}
        className="px-3 py-1 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 disabled:opacity-40"
      >
        Sil
      </Button>
    </div>
  );
}
