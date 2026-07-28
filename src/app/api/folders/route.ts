import type { NextRequest } from "next/server";
import { createFolder, listFolders } from "@/features/exams/data";
import { createFolderSchema } from "@/features/exams/schemas";
import { handle } from "@/lib/api";
import { requireUserId } from "@/lib/session";

export async function GET() {
  return handle(async () => {
    const userId = await requireUserId();
    return listFolders(userId);
  });
}

export async function POST(request: NextRequest) {
  return handle(async () => {
    const userId = await requireUserId();
    const { name } = createFolderSchema.parse(await request.json());
    return createFolder(userId, name);
  });
}
