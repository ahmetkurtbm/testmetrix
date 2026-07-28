import type { NextRequest } from "next/server";
import { analyzeExam } from "@/features/analysis";
import { deleteExam, getExamData } from "@/features/exams/data";
import { handle } from "@/lib/api";
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
      analysis: analyzeExam(data),
    };
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
