import "server-only";

import { randomUUID } from "node:crypto";
import { NotFoundError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { analyzeExam } from "@/features/analysis";
import type { AnswerOption, ExamData } from "@/features/analysis";

/**
 * Veri erişim katmanı — IDOR'a karşı TEK savunma noktası.
 *
 * Eski Express backend'inde sahiplik kontrolü her handler'a elle kopyalanıyordu ve
 * beş yerde unutulmuştu: `/excel` (başkasının dosyasını okuma), `/excel-delete`,
 * `/excel-update`, `/update-folder`, `/delete-folder`. Giriş yapmış herhangi bir
 * kullanıcı, ID'sini bildiği her kaydı okuyup silebiliyordu.
 *
 * KURAL: Route handler'lar asla `prisma.exam.findUnique({ where: { id } })`
 * çağırmaz. Kayda erişim yalnızca buradaki `requireX` fonksiyonlarından geçer ve
 * bu fonksiyonlar sahiplik koşulunu sorgunun kendisine gömer.
 */

/** Klasör yalnızca sahibine görünür. Başkasınınsa "bulunamadı" muamelesi görür. */
export async function requireFolder(userId: string, folderId: string) {
  const folder = await prisma.folder.findFirst({
    where: { id: folderId, ownerId: userId },
  });
  if (!folder) throw new NotFoundError("Klasör bulunamadı");
  return folder;
}

/** Sınav yalnızca sahibine görünür. */
export async function requireExam(userId: string, examId: string) {
  const exam = await prisma.exam.findFirst({
    where: { id: examId, ownerId: userId },
  });
  if (!exam) throw new NotFoundError("Sınav bulunamadı");
  return exam;
}

// ---------------------------------------------------------------------------
// Klasörler
// ---------------------------------------------------------------------------

export function listFolders(userId: string) {
  return prisma.folder.findMany({
    where: { ownerId: userId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: { _count: { select: { exams: true } } },
  });
}

export async function createFolder(userId: string, name: string) {
  const last = await prisma.folder.findFirst({
    where: { ownerId: userId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  return prisma.folder.create({
    data: { ownerId: userId, name, sortOrder: (last?.sortOrder ?? -1) + 1 },
  });
}

export async function renameFolder(userId: string, folderId: string, name: string) {
  await requireFolder(userId, folderId);
  return prisma.folder.update({ where: { id: folderId }, data: { name } });
}

/** Klasörle birlikte içindeki sınavlar ve onların tüm satırları cascade ile silinir. */
export async function deleteFolder(userId: string, folderId: string) {
  await requireFolder(userId, folderId);
  await prisma.folder.delete({ where: { id: folderId } });
}

/**
 * Sıralamayı günceller. Her `update` sorgusu `ownerId`'yi de koşula aldığı için
 * listeye başkasının klasör id'si karıştırılsa bile o kayıt güncellenmez.
 */
export async function reorderFolders(userId: string, folderIds: string[]) {
  await prisma.$transaction(
    folderIds.map((id, index) =>
      prisma.folder.updateMany({
        where: { id, ownerId: userId },
        data: { sortOrder: index },
      })
    )
  );
}

// ---------------------------------------------------------------------------
// Sınavlar
// ---------------------------------------------------------------------------

export function listExams(userId: string, folderId?: string) {
  return prisma.exam.findMany({
    where: { ownerId: userId, ...(folderId ? { folderId } : {}) },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      folderId: true,
      questionCount: true,
      studentCount: true,
      createdAt: true,
    },
  });
}

/** Sınavın analiz için gereken tam verisini `ExamData` biçiminde döndürür. */
export async function getExamData(
  userId: string,
  examId: string
): Promise<{ exam: Awaited<ReturnType<typeof requireExam>>; data: ExamData }> {
  const exam = await requireExam(userId, examId);

  const [answerKeys, students, answers] = await Promise.all([
    prisma.answerKey.findMany({
      where: { examId },
      orderBy: { questionNo: "asc" },
    }),
    prisma.student.findMany({
      where: { examId },
      orderBy: { rowNo: "asc" },
    }),
    prisma.answer.findMany({ where: { examId } }),
  ]);

  const rowByStudentId = new Map(students.map((s, index) => [s.id, index]));
  const responses: AnswerOption[][] = students.map(() =>
    answerKeys.map(() => "BOS" as AnswerOption)
  );

  for (const answer of answers) {
    const row = rowByStudentId.get(answer.studentId);
    if (row === undefined) continue;
    responses[row][answer.questionNo - 1] = answer.option;
  }

  return {
    exam,
    data: {
      answerKey: answerKeys.map((k) => k.correctOption),
      studentNames: students.map((s) => s.fullName),
      responses,
    },
  };
}

export async function deleteExam(userId: string, examId: string) {
  await requireExam(userId, examId);
  await prisma.exam.delete({ where: { id: examId } });
}

/**
 * Yüklenen sınavı normalize edilmiş satırlar halinde yazar ve istatistik
 * önbelleğini doldurur.
 *
 * Eski sürüm tüm Excel'i tek bir JSON alanına (`file_data`) yazıyordu: Mongo'nun
 * 16MB belge limitine ve Vercel'in 4.5MB gövde limitine takılıyor, üstelik hiçbir
 * sorgu yazılmasına izin vermiyordu.
 */
export async function createExam(
  userId: string,
  input: { folderId: string; name: string; data: ExamData }
) {
  await requireFolder(userId, input.folderId);

  const { data } = input;
  const analysis = analyzeExam(data);
  const examId = randomUUID();

  // Öğrenci id'leri önceden üretiliyor: `createMany` id döndürmediği için aksi
  // halde yazdıktan sonra tekrar okumak gerekirdi.
  const studentIds = data.studentNames.map(() => randomUUID());

  await prisma.$transaction(
    async (tx) => {
      await tx.exam.create({
        data: {
          id: examId,
          ownerId: userId,
          folderId: input.folderId,
          name: input.name,
          questionCount: data.answerKey.length,
          studentCount: data.studentNames.length,
        },
      });

      await tx.answerKey.createMany({
        data: data.answerKey.map((correctOption, index) => ({
          examId,
          questionNo: index + 1,
          correctOption,
        })),
      });

      await tx.student.createMany({
        data: data.studentNames.map((fullName, index) => ({
          id: studentIds[index],
          examId,
          fullName,
          rowNo: index,
        })),
      });

      await tx.answer.createMany({
        data: data.responses.flatMap((row, studentIndex) =>
          row.map((option, questionIndex) => ({
            examId,
            studentId: studentIds[studentIndex],
            questionNo: questionIndex + 1,
            option,
          }))
        ),
      });

      await tx.examStat.create({ data: buildExamStat(examId, analysis) });

      const itemRows = buildItemStats(examId, analysis);
      if (itemRows.length > 0) {
        await tx.itemStat.createMany({ data: itemRows });
      }
    },
    { timeout: 30_000, maxWait: 10_000 }
  );

  return { id: examId };
}

/**
 * İstatistik önbelleği satırlarını üreten saf yardımcılar.
 * Prisma istemci tipine bağlı olmadıkları için transaction içinde de dışında da
 * kullanılabilir ve doğrudan test edilebilirler.
 */
function buildExamStat(examId: string, analysis: ReturnType<typeof analyzeExam>) {
  const { descriptive, reliability } = analysis;
  return {
    examId,
    mean: descriptive.mean,
    median: descriptive.median,
    minScore: descriptive.min,
    maxScore: descriptive.max,
    range: descriptive.range,
    variance: descriptive.variance,
    stdDeviation: descriptive.stdDeviation,
    skewness: descriptive.skewness,
    kurtosis: descriptive.kurtosis,
    coefficientVariation: descriptive.coefficientVariation,
    successRate: descriptive.successRate,
    kr20: reliability.kr20,
    kr21: reliability.kr21,
  };
}

function buildItemStats(examId: string, analysis: ReturnType<typeof analyzeExam>) {
  const { items } = analysis;
  return items.difficulty.map((difficulty, index) => ({
    examId,
    questionNo: index + 1,
    difficulty,
    correctCount: items.correctCount[index],
    variance: items.variance[index],
    stdDeviation: items.stdDeviation[index],
    discrimination: items.discrimination[index],
    rbis: items.rbis[index],
    prbis: items.prbis[index],
    reliabilityIndex: items.reliabilityIndex[index],
  }));
}
