import type { NextRequest } from "next/server";
import { deleteAccount } from "@/features/exams/data";
import { updateProfileSchema } from "@/features/exams/schemas";
import { handle, NotFoundError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

export async function GET() {
  return handle(async () => {
    const userId = await requireUserId();
    const user = await prisma.appUser.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        university: true,
        phone: true,
        role: true,
        kvkkAcceptedAt: true,
        passwordHash: true,
      },
    });
    if (!user) throw new NotFoundError("Kullanıcı bulunamadı");
    // Hash asla istemciye gitmez; yalnızca "parola var mı" bilgisi gider —
    // profil ekranı buna göre parola değiştirme bölümünü gösterir/gizler.
    const { passwordHash, ...rest } = user;
    return { ...rest, hasPassword: passwordHash !== null };
  });
}

/**
 * Hesabı siler. Klasörler, sınavlar ve tüm cevap satırları cascade ile gider.
 */
export async function DELETE() {
  return handle(async () => {
    const userId = await requireUserId();
    await deleteAccount(userId);
    return { ok: true };
  });
}

export async function PATCH(request: NextRequest) {
  return handle(async () => {
    const userId = await requireUserId();
    const input = updateProfileSchema.parse(await request.json());

    // E-posta buradan değiştirilemez (benzersizlik/oturum kimliği ona bağlı).
    // `role` şemada zaten yok — istemciden asla okunmuyor.
    return prisma.appUser.update({
      where: { id: userId },
      data: {
        name: input.name ?? undefined,
        university: input.university ?? undefined,
        phone: input.phone ?? undefined,
        ...(input.kvkkAccepted === true ? { kvkkAcceptedAt: new Date() } : {}),
        ...(input.kvkkAccepted === false ? { kvkkAcceptedAt: null } : {}),
      },
      select: {
        id: true,
        university: true,
        phone: true,
        kvkkAcceptedAt: true,
      },
    });
  });
}
