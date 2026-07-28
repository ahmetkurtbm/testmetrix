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
      },
    });
    if (!user) throw new NotFoundError("Kullanıcı bulunamadı");
    return user;
  });
}

/**
 * Hesabı siler. Klasörler, sınavlar ve tüm cevap satırları cascade ile gider.
 * GateHub'daki hesap etkilenmez — orası ayrı bir sistem.
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

    // Ad ve e-posta GateHub'da yönetilir; buradan değiştirilemez.
    // `role` şemada zaten yok — istemciden asla okunmuyor.
    return prisma.appUser.update({
      where: { id: userId },
      data: {
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
