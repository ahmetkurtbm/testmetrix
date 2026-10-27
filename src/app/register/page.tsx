import type { Metadata } from "next";

import { AuthLayout } from "@/components/app/auth-layout";

import { RegisterForm } from "./RegisterForm";

export const metadata: Metadata = { title: "Kayıt Ol" };

export default function RegisterPage() {
  return (
    <AuthLayout title="Hesap oluştur" description="Sınavlarınızı klasörlerde saklayın, sonradan düzenleyip yeniden raporlayın.">
      <RegisterForm />
    </AuthLayout>
  );
}
