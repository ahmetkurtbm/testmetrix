import type { NextRequest } from "next/server";
import { reorderFolders } from "@/features/exams/data";
import { reorderFoldersSchema } from "@/features/exams/schemas";
import { handle } from "@/lib/api";
import { requireUserId } from "@/lib/session";

export async function PUT(request: NextRequest) {
  return handle(async () => {
    const userId = await requireUserId();
    const { folderIds } = reorderFoldersSchema.parse(await request.json());
    await reorderFolders(userId, folderIds);
    return { ok: true };
  });
}
