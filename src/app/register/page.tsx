import type { Metadata } from "next";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { RegisterForm } from "./RegisterForm";

export const metadata: Metadata = { title: "Kayıt Ol" };

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <Card className="relative w-full max-w-md bg-white shadow-xl border-0">
          <CardHeader className="space-y-4 pb-2">
            <div className="flex justify-center">
              <img src="/logo.png" alt="TestMetrix" className="h-16 w-auto" />
            </div>
            <h1 className="text-2xl font-semibold text-center text-gray-800">
              Hesap Oluştur
            </h1>
          </CardHeader>

          <CardContent className="pt-4">
            <RegisterForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
