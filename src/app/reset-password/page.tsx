import type { Metadata } from "next";

import { AuthLayout } from "@/components/app/auth-layout";

import { ResetPasswordForm } from "./ResetPasswordForm";

export const metadata: Metadata = { title: "Şifre Sıfırla" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <AuthLayout title="Yeni parola belirle">
      <ResetPasswordForm token={token ?? null} />
    </AuthLayout>
  );
}
