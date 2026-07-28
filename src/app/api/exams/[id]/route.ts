import type { NextRequest } from "next/server";
import { analyzeExam, parseExamMatrix } from "@/features/analysis";
import { deleteExam, getExamData, replaceExamData } from "@/features/exams/data";
import { updateExamSchema } from "@/features/exams/schemas";
import { handle, ValidationError } from "@/lib/api";
import { requireUserId } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

/**
 * Sınavın tam analizi.
 *
 * `exam_stat`/`item_stat` tablolarındaki önbelleği okumak yerine analiz burada
 * yeniden hesaplanıyor: rapor ekranı zaten öğrenci bazlı değerlere (z/T puanı,
 * sıralama, seçenek dağılımı) ihtiyaç duyuyor ve bunlar önbellekte tutulmuyor.
 * Önbellek, listeleme ekranlarında hızlı özet göstermek için var.
 */
export async function GET(_request: NextRequest, { params }: Params) {
  return handle(async () => {
    const userId = await requireUserId();
    const { id } = await params;
    const { exam, data } = await getExamData(userId, id);

    return {
      exam: {
        id: exam.id,
        name: exam.name,
        folderId: exam.folderId,
        questionCount: exam.questionCount,
        studentCount: exam.studentCount,
        createdAt: exam.createdAt,
      },
      studentNames: data.studentNames,
      answerKey: data.answerKey,
      // Düzenleme ekranı ham cevapları gösteriyor; analiz çıktısı yalnızca
      // 0/1 matrisi içerdiği için hangi şıkkın işaretlendiği oradan çıkarılamaz.
      responses: data.responses,
      analysis: analyzeExam(data),
    };
  });
}

/** Düzenleme ekranından gelen tam matris. Normalizasyon yine sunucuda. */
export async function PUT(request: NextRequest, { params }: Params) {
  return handle(async () => {
    const userId = await requireUserId();
    const { id } = await params;
    const { name, folderId, matrix } = updateExamSchema.parse(await request.json());

    const data = parseExamMatrix(matrix as unknown[][]);
    if (data.answerKey.length === 0) {
      throw new ValidationError("Cevap anahtarı okunamadı");
    }
    if (data.studentNames.length === 0) {
      throw new ValidationError("Geçerli öğrenci satırı bulunamadı");
    }

    return replaceExamData(userId, id, { name, folderId, data });
  });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  return handle(async () => {
    const userId = await requireUserId();
    const { id } = await params;
    await deleteExam(userId, id);
    return { ok: true };
  });
}
