import type { NextRequest } from "next/server";
import { z } from "zod";
import { ForbiddenError, handle } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireAdminId } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

const updateRoleSchema = z.object({
  role: z.enum(["ADMIN", "TEACHER", "STUDENT"]),
});

export async function PATCH(request: NextRequest, { params }: Params) {
  return handle(async () => {
    const adminId = await requireAdminId();
    const { id } = await params;
    const { role } = updateRoleSchema.parse(await request.json());

    // Son yöneticinin kendini düşürüp sistemi kilitlemesini engelle.
    if (id === adminId && role !== "ADMIN") {
      throw new ForbiddenError("Kendi yönetici yetkinizi kaldıramazsınız");
    }

    return prisma.appUser.update({
      where: { id },
      data: { role },
      select: { id: true, email: true, role: true },
    });
  });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  return handle(async () => {
    const adminId = await requireAdminId();
    const { id } = await params;

    if (id === adminId) {
      throw new ForbiddenError("Kendi hesabınızı buradan silemezsiniz");
    }

    // Klasörler, sınavlar ve tüm alt satırlar cascade ile gider.
    await prisma.appUser.delete({ where: { id } });
    return { ok: true };
  });
}
