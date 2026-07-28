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

/** Öğrenci bazlı sonuçlar. */
export function StudentAnalysisExport({
  analysis,
  studentNames,
  examName,
}: ExportProps) {
  const handleExport = async () => {
    const { students, descriptive } = analysis;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Öğrenci İstatistikleri");

    styleHeaderRow(
      worksheet.addRow([
        "Öğrenci Adı-Soyadı",
        "Doğru Yanıt Sayısı",
        "Yanlış Yanıt Sayısı",
        "Puanı (100 üzerinden)",
        "Başarı Yüzdesi",
        "Z Puanı",
        "T Puanı",
        "Başarı Sırası",
      ])
    );

    studentNames.forEach((name, index) => {
      const row = worksheet.addRow([
        name,
        students.scores[index],
        descriptive.questionCount - students.scores[index],
        // DÜZELTME: eski kod burada `scores[i] * (soruSayısı / 100)` hesaplıyordu —
        // çarpan ters çevrilmişti. 5 soruluk bir testte 5 doğru yapan öğrenci
        // 100 yerine 0.25 puan görüyordu. Aynı hata `StudentAnswers` ve
        // `StudentAnswers01` dosyalarına da kopyalanmıştı.
        num(students.points[index]),
        `${num(students.successRates[index] * 100)}%`,
        num(students.zScores[index]),
        num(students.tScores[index]),
        students.ranks[index],
      ]);
      row.eachCell((cell, column) => {
        if (column > 1) cell.alignment = { horizontal: "right" };
      });
    });

    setColumnWidths(worksheet, [26, 18, 18, 20, 16, 14, 14, 14]);
    applyBorders(worksheet);
    stripeRows(worksheet, 1);

    await downloadWorkbook(
      workbook,
      `${safeFileName(examName, "Ogrenci_Istatistikleri")}.xlsx`
    );
  };

  return <ExportButton label="Öğrenci Analizi (.xlsx)" onExport={handleExport} />;
}
