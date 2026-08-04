import type { NextRequest } from "next/server";
import { changePasswordSchema } from "@/features/exams/schemas";
import { handle, NotFoundError, ValidationError } from "@/lib/api";
import { hashPassword, validatePasswordStrength, verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

/**
 * Profilden parola değiştirme. Google-only kullanıcı (passwordHash yok)
 * bunu kullanamaz — önce bir parola belirlemesi gerekir, ama bu akış henüz
 * yok (kapsam dışı bırakıldı; Google kullanıcıları Google ile girmeye devam
 * eder).
 */
export async function PATCH(request: NextRequest) {
  return handle(async () => {
    const userId = await requireUserId();
    const { currentPassword, newPassword } = changePasswordSchema.parse(
      await request.json()
    );

    const user = await prisma.appUser.findUnique({
      where: { id: userId },
      select: { passwordHash: true },
    });
    if (!user) throw new NotFoundError("Kullanıcı bulunamadı");
    if (!user.passwordHash) {
      throw new ValidationError(
        "Bu hesap Google ile giriş yapıyor, parola değiştirme kullanılamaz."
      );
    }

    const valid = await verifyPassword(currentPassword, user.passwordHash);
    if (!valid) throw new ValidationError("Mevcut parola yanlış.");

    const strengthError = validatePasswordStrength(newPassword);
    if (strengthError) throw new ValidationError(strengthError);

    const passwordHash = await hashPassword(newPassword);
    await prisma.appUser.update({ where: { id: userId }, data: { passwordHash } });

    return { ok: true };
  });
}
