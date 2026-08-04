import type { NextRequest } from "next/server";
import { resetPasswordSchema } from "@/features/auth/schemas";
import { handle, ValidationError } from "@/lib/api";
import { hashPassword, validatePasswordStrength } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { hashResetToken } from "@/lib/reset-token";

/**
 * Şifre sıfırlama — token'ı tüketir.
 *
 * Token bulunamadı/süresi dolmuş/zaten kullanılmış: hepsi aynı jenerik
 * mesajla döner, hangisi olduğunu sızdırmaz.
 */
export async function POST(request: NextRequest) {
  return handle(async () => {
    const { token, password } = resetPasswordSchema.parse(await request.json());

    const strengthError = validatePasswordStrength(password);
    if (strengthError) throw new ValidationError(strengthError);

    const tokenHash = hashResetToken(token);
    const record = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (!record || record.expiresAt < new Date()) {
      throw new ValidationError("Bağlantının süresi dolmuş ya da geçersiz.");
    }

    const passwordHash = await hashPassword(password);

    await prisma.$transaction([
      prisma.appUser.update({
        where: { id: record.userId },
        data: {
          passwordHash,
          // Sıfırlama başarıyla tamamlandığında kaba kuvvet sayaçları da
          // temizlenir — meşru sahip artık giriş yapabilmeli.
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      }),
      // Kullanılan token silinir; aynı kullanıcının başka bekleyen
      // token'ları da silinir (tekrar kullanımı tamamen imkânsız kılmak için).
      prisma.passwordResetToken.deleteMany({ where: { userId: record.userId } }),
    ]);

    return { ok: true };
  });
}
