import type { NextRequest } from "next/server";
import { registerSchema } from "@/features/auth/schemas";
import { handle, ValidationError } from "@/lib/api";
import { isAdminEmail } from "@/lib/admin";
import { hashPassword, validatePasswordStrength } from "@/lib/password";
import { prisma } from "@/lib/prisma";

/**
 * Kayıt.
 *
 * Herkese açık — ALLOWED_EMAILS listesi gibi bir kapı yok. `role` istemciden
 * asla okunmaz; ADMIN_EMAILS listesindeyse ADMIN, değilse TEACHER olarak
 * sabitlenir (bkz. src/lib/admin.ts). Eski Express backend'inde `role`
 * doğrudan gövdeden okunup kaydediliyordu — herkes kendini yönetici
 * yapabiliyordu; burada o sınıf açık yapısal olarak imkânsız.
 */
export async function POST(request: NextRequest) {
  return handle(async () => {
    const { name, email, password } = registerSchema.parse(await request.json());

    const strengthError = validatePasswordStrength(password);
    if (strengthError) throw new ValidationError(strengthError);

    const existing = await prisma.appUser.findUnique({
      where: { email },
      select: { id: true },
    });
    // Var olan hesabın e-postayla mı Google'la mı kayıtlı olduğunu
    // sızdırmıyoruz; ikisi için de aynı jenerik mesaj.
    if (existing) {
      throw new ValidationError(
        "Bu e-posta ile zaten bir hesap var. Giriş yapmayı deneyin."
      );
    }

    const passwordHash = await hashPassword(password);
    await prisma.appUser.create({
      data: {
        name,
        email,
        passwordHash,
        role: isAdminEmail(email) ? "ADMIN" : "TEACHER",
      },
    });

    return { ok: true };
  });
}
