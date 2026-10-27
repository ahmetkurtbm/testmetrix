import type { Metadata } from "next";

import { AuthLayout } from "@/components/app/auth-layout";

import { ForgotPasswordForm } from "./ForgotPasswordForm";

export const metadata: Metadata = { title: "Parolamı Unuttum" };

export default function ForgotPasswordPage() {
  return (
    <AuthLayout title="Parolamı unuttum" description="E-posta adresinize bir sıfırlama bağlantısı gönderelim.">
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
