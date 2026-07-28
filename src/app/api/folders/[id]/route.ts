import type { NextRequest } from "next/server";
import { deleteFolder, renameFolder } from "@/features/exams/data";
import { renameFolderSchema } from "@/features/exams/schemas";
import { handle } from "@/lib/api";
import { requireUserId } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  return handle(async () => {
    const userId = await requireUserId();
    const { id } = await params;
    const { name } = renameFolderSchema.parse(await request.json());
    // Sahiplik kontrolü renameFolder içinde; handler burada `prisma`ya hiç dokunmuyor.
    return renameFolder(userId, id, name);
  });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  return handle(async () => {
    const userId = await requireUserId();
    const { id } = await params;
    await deleteFolder(userId, id);
    return { ok: true };
  });
}
