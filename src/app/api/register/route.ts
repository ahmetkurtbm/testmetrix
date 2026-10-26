import type { NextRequest } from "next/server";
import { registerSchema } from "@/features/auth/schemas";
import { handle, ValidationError } from "@/lib/api";
import { hashPassword, validatePasswordStrength } from "@/lib/password";
import { prisma } from "@/lib/prisma";

/**
 * Herkese açık kayıt. E-posta sahipliği burada doğrulanmadığı için rol her
 * zaman TEACHER'dır; ADMIN_EMAILS yalnızca Google'ın doğruladığı girişte uygulanır.
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
        role: "TEACHER",
      },
    });

    return { ok: true };
  });
}
