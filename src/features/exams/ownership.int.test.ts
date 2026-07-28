import "dotenv/config";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  createExam,
  createFolder,
  deleteExam,
  deleteFolder,
  getExamData,
  listExams,
  listFolders,
  renameFolder,
  reorderFolders,
  requireExam,
  requireFolder,
} from "./data";
import { prisma } from "@/lib/prisma";
import { parseExamMatrix } from "@/features/analysis";

/**
 * IDOR regresyon testi.
 *
 * Eski Express backend'inde beş endpoint sahiplik kontrolü yapmıyordu:
 * `/excel` (başkasının dosyasını okuma), `/excel-delete`, `/excel-update`,
 * `/update-folder`, `/delete-folder`. Giriş yapmış herhangi bir kullanıcı,
 * ID'sini bildiği her kaydı okuyup silebiliyordu.
 *
 * Bu test iki kullanıcı oluşturur ve B'nin A'nın kayıtlarına hiçbir yoldan
 * erişemediğini doğrular.
 */

const ALICE = `test-alice-${Date.now()}`;
const BOB = `test-bob-${Date.now()}`;

let aliceFolderId: string;
let aliceExamId: string;

const MATRIX: unknown[][] = [
  ["anahtar", "A", "B", "C"],
  ["Öğrenci 1", "A", "B", "C"],
  ["Öğrenci 2", "A", "B", "D"],
];

beforeAll(async () => {
  await prisma.appUser.createMany({
    data: [
      { id: ALICE, email: `${ALICE}@example.test`, name: "Alice" },
      { id: BOB, email: `${BOB}@example.test`, name: "Bob" },
    ],
  });

  const folder = await createFolder(ALICE, "Alice'in klasörü");
  aliceFolderId = folder.id;

  const exam = await createExam(ALICE, {
    folderId: aliceFolderId,
    name: "Alice'in sınavı",
    data: parseExamMatrix(MATRIX),
  });
  aliceExamId = exam.id;
});

afterAll(async () => {
  // app_user silinince folder → exam → answer/student/stat cascade ile gider.
  await prisma.appUser.deleteMany({ where: { id: { in: [ALICE, BOB] } } });
  await prisma.$disconnect();
});

describe("sahiplik — okuma", () => {
  it("sahibi kendi klasörünü ve sınavını okuyabilir", async () => {
    await expect(requireFolder(ALICE, aliceFolderId)).resolves.toBeTruthy();
    await expect(requireExam(ALICE, aliceExamId)).resolves.toBeTruthy();
  });

  it("başkasının klasörü 'bulunamadı' döner", async () => {
    await expect(requireFolder(BOB, aliceFolderId)).rejects.toThrow(/bulunamadı/i);
  });

  it("başkasının sınavı 'bulunamadı' döner", async () => {
    await expect(requireExam(BOB, aliceExamId)).rejects.toThrow(/bulunamadı/i);
  });

  it("başkasının sınav verisi çekilemez", async () => {
    // Eski `/excel` endpoint'inin açığı buydu: findById, user_id filtresi yok.
    await expect(getExamData(BOB, aliceExamId)).rejects.toThrow(/bulunamadı/i);
  });

  it("listeler yalnızca kendi kayıtlarını döndürür", async () => {
    expect(await listFolders(BOB)).toHaveLength(0);
    expect(await listExams(BOB)).toHaveLength(0);
    expect(await listFolders(ALICE)).toHaveLength(1);
    expect(await listExams(ALICE)).toHaveLength(1);
  });
});

describe("sahiplik — yazma", () => {
  it("başkasının klasörü yeniden adlandırılamaz", async () => {
    await expect(renameFolder(BOB, aliceFolderId, "ele geçirildi")).rejects.toThrow(
      /bulunamadı/i
    );
    const folder = await requireFolder(ALICE, aliceFolderId);
    expect(folder.name).toBe("Alice'in klasörü");
  });

  it("başkasının klasörüne sınav yüklenemez", async () => {
    await expect(
      createExam(BOB, {
        folderId: aliceFolderId,
        name: "sızma",
        data: parseExamMatrix(MATRIX),
      })
    ).rejects.toThrow(/bulunamadı/i);
  });

  it("sıralama güncellemesi başkasının klasörüne dokunmaz", async () => {
    const before = await requireFolder(ALICE, aliceFolderId);
    // Bob, Alice'in klasör id'sini kendi sıralama isteğine karıştırıyor.
    await reorderFolders(BOB, [aliceFolderId]);
    const after = await requireFolder(ALICE, aliceFolderId);
    expect(after.sortOrder).toBe(before.sortOrder);
  });

  it("başkasının sınavı silinemez", async () => {
    await expect(deleteExam(BOB, aliceExamId)).rejects.toThrow(/bulunamadı/i);
    await expect(requireExam(ALICE, aliceExamId)).resolves.toBeTruthy();
  });

  it("başkasının klasörü silinemez", async () => {
    await expect(deleteFolder(BOB, aliceFolderId)).rejects.toThrow(/bulunamadı/i);
    await expect(requireFolder(ALICE, aliceFolderId)).resolves.toBeTruthy();
  });
});

describe("veri bütünlüğü", () => {
  it("sınav normalize edilmiş satırlar olarak yazılır", async () => {
    const { data } = await getExamData(ALICE, aliceExamId);
    expect(data.answerKey).toEqual(["A", "B", "C"]);
    expect(data.studentNames).toEqual(["Öğrenci 1", "Öğrenci 2"]);
    expect(data.responses).toEqual([
      ["A", "B", "C"],
      ["A", "B", "D"],
    ]);
  });

  it("istatistik önbelleği doldurulur", async () => {
    const stat = await prisma.examStat.findUnique({ where: { examId: aliceExamId } });
    expect(stat?.mean).toBe(2.5); // 3 + 2 doğru → ortalama 2.5
    const items = await prisma.itemStat.findMany({ where: { examId: aliceExamId } });
    expect(items).toHaveLength(3);
  });

  it("sınav silinince alt satırlar cascade ile gider", async () => {
    const folder = await createFolder(ALICE, "geçici");
    const exam = await createExam(ALICE, {
      folderId: folder.id,
      name: "geçici sınav",
      data: parseExamMatrix(MATRIX),
    });

    await deleteExam(ALICE, exam.id);

    expect(await prisma.answer.count({ where: { examId: exam.id } })).toBe(0);
    expect(await prisma.student.count({ where: { examId: exam.id } })).toBe(0);
    expect(await prisma.examStat.count({ where: { examId: exam.id } })).toBe(0);
    expect(await prisma.itemStat.count({ where: { examId: exam.id } })).toBe(0);

    await deleteFolder(ALICE, folder.id);
  });
});
