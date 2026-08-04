import type { Metadata } from "next";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export const metadata: Metadata = { title: "Parolamı Unuttum" };

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="fixed inset-0">
          <img
            className="w-full h-full object-cover opacity-50"
            src="/login-teacher-student.webp"
            alt=""
          />
        </div>

        <Card className="relative w-full max-w-md bg-white/95 backdrop-blur-md shadow-xl border-0">
          <CardHeader className="space-y-4 pb-2">
            <div className="flex justify-center">
              <img src="/logo.png" alt="TestMetrix" className="h-16 w-auto" />
            </div>
            <h1 className="text-2xl font-semibold text-center text-gray-800">
              Parolamı Unuttum
            </h1>
            <p className="text-sm text-center text-gray-600">
              E-posta adresinize bir sıfırlama bağlantısı gönderelim.
            </p>
          </CardHeader>

          <CardContent className="pt-4">
            <ForgotPasswordForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
