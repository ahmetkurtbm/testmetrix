"use client";

import ExcelJS from "exceljs";
import { ExportButton } from "./ExportButton";
import {
  applyBorders,
  downloadWorkbook,
  num,
  safeFileName,
  setColumnWidths,
  stripeRows,
  styleHeaderRow,
  type ExportProps,
} from "./shared";

/**
 * Öğrencilerin yanıt matrisi.
 *
 * `binary` false → ham yanıtlar (A/B/C/D/E/BOS)
 * `binary` true  → doğru/yanlış matrisi (1/0)
 *
 * Eskiden bunlar iki ayrı dosyaydı (`StudentAnswers`, `StudentAnswers01`) ve
 * ikisi de aynı stil kodunu ve aynı hatalı puan formülünü taşıyordu.
 */
export function StudentAnswersExport({
  analysis,
  studentNames,
  answerKey,
  responses,
  examName,
  binary = false,
}: ExportProps & { binary?: boolean }) {
  const handleExport = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(
      binary ? "Öğrenci Yanıtları 1-0" : "Öğrenci Yanıtları"
    );

    worksheet.addRow(["Yanıt Anahtarı", "", ...answerKey]);

    styleHeaderRow(
      worksheet.addRow([
        "Öğrenci Adı-Soyadı",
        "Puan",
        ...answerKey.map((_, index) => `M${index + 1}`),
      ])
    );

    studentNames.forEach((name, index) => {
      const answers = binary
        ? analysis.binaryMatrix[index]
        : responses[index];

      worksheet.addRow([
        name,
        // DÜZELTME: eski kod `scores[i] * (soruSayısı / 100)` hesaplıyordu —
        // çarpan tersti. Doğru puan `analyzeExam` içinde hesaplanıyor.
        num(analysis.students.points[index]),
        ...answers,
      ]);
    });

    setColumnWidths(worksheet, [26, 12, ...answerKey.map(() => 8)]);
    applyBorders(worksheet);
    stripeRows(worksheet, 2);

    await downloadWorkbook(
      workbook,
      `${safeFileName(
        examName,
        binary ? "Ogrenci_Yanitlari_1_0" : "Ogrenci_Yanitlari"
      )}.xlsx`
    );
  };

  return (
    <ExportButton
      label={binary ? "Öğrenci Cevapları 1-0 (.xlsx)" : "Öğrenci Cevapları (.xlsx)"}
      onExport={handleExport}
    />
  );
}
