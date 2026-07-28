import type { NextRequest } from "next/server";
import { parseExamMatrix } from "@/features/analysis";
import { createExam, listExams } from "@/features/exams/data";
import { createExamSchema } from "@/features/exams/schemas";
import { handle, ValidationError } from "@/lib/api";
import { requireUserId } from "@/lib/session";

export async function GET(request: NextRequest) {
  return handle(async () => {
    const userId = await requireUserId();
    const folderId = request.nextUrl.searchParams.get("folderId") ?? undefined;
    return listExams(userId, folderId);
  });
}

export async function POST(request: NextRequest) {
  return handle(async () => {
    const userId = await requireUserId();
    const { folderId, name, matrix } = createExamSchema.parse(await request.json());

    // Normalizasyon sunucuda: hücreler burada trim/upper edilip geçerli
    // seçeneklere indirgenir. İstemcinin gönderdiği biçime güvenilmez.
    const data = parseExamMatrix(matrix as unknown[][]);

    if (data.answerKey.length === 0) {
      throw new ValidationError("Cevap anahtarı okunamadı");
    }
    if (data.studentNames.length === 0) {
      throw new ValidationError("Dosyada geçerli öğrenci satırı bulunamadı");
    }

    return createExam(userId, { folderId, name, data });
  });
}
