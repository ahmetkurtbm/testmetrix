import type { NextRequest } from "next/server";
import { requestResetSchema } from "@/features/auth/schemas";
import { handle } from "@/lib/api";
import { sendPasswordResetEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { generateResetToken } from "@/lib/reset-token";

const RESEND_COOLDOWN_MS = 60 * 1000;

/**
 * Şifre sıfırlama isteği.
 *
 * Hesap bulunamasa bile HER ZAMAN aynı başarı mesajı döner — "bu e-posta
 * kayıtlı mı?" sorusunun cevabını sızdırmamak için (kullanıcı numaralandırma).
 * Google-only hesap için de aynı jenerik mesaj döner; sıfırlama e-postası
 * gönderilmez ama bunu isteği yapan kişi bilemez.
 */
export async function POST(request: NextRequest) {
  return handle(async () => {
    const { email } = requestResetSchema.parse(await request.json());

    const user = await prisma.appUser.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, passwordHash: true },
    });

    if (user?.passwordHash) {
      const recent = await prisma.passwordResetToken.findFirst({
        where: { userId: user.id, createdAt: { gt: new Date(Date.now() - RESEND_COOLDOWN_MS) } },
      });

      // Aynı hesap için art arda istek göndererek gelen kutusunu doldurmayı
      // (mail bombalama) engelliyor. Kullanıcıya cooldown'u söylemiyoruz —
      // yine aynı jenerik mesaj.
      if (!recent) {
        const { token, tokenHash, expiresAt } = generateResetToken();
        await prisma.passwordResetToken.create({
          data: { userId: user.id, tokenHash, expiresAt },
        });

        const resetUrl = `${process.env.AUTH_URL}/reset-password?token=${token}`;
        await sendPasswordResetEmail(user.email, user.name, resetUrl).catch(
          (error) => console.error("Sıfırlama e-postası gönderilemedi:", error)
        );
      }
    }

    return {
      ok: true,
      message:
        "Bu e-posta kayıtlıysa, sıfırlama bağlantısı gönderildi. Gelen kutunuzu kontrol edin.",
    };
  });
}
