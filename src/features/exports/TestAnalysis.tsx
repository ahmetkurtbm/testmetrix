"use client";

import ExcelJS from "exceljs";
import { ExportButton } from "./ExportButton";
import {
  applyBorders,
  downloadWorkbook,
  num,
  safeFileName,
  setColumnWidths,
  styleHeaderRow,
  type ExportProps,
} from "./shared";

/** Test geneli istatistikler + puan frekans tablosu. */
export function TestAnalysisExport({ analysis, examName }: ExportProps) {
  const handleExport = async () => {
    const { descriptive: d, reliability, frequency } = analysis;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("İstatistik Raporu");

    const rows: [string, string | number][] = [
      ["Öğrenci Sayısı", d.studentCount],
      ["Madde Sayısı", d.questionCount],
      // Alınabilecek en yüksek puan = madde sayısı (her madde 1 puan).
      ["Alınabilecek En Yüksek Puan", d.questionCount],
      ["En Düşük Puan", num(d.min)],
      ["En Yüksek Puan", num(d.max)],
      ["Aritmetik Ortalama", num(d.mean)],
      ["Ortanca", num(d.median)],
      ["Mod", d.mode.join(", ") || "—"],
      ["Ranj", num(d.range)],
      ["Standart Sapma", num(d.stdDeviation)],
      ["Varyans", num(d.variance)],
      ["Çarpıklık Katsayısı", num(d.skewness)],
      ["Basıklık Katsayısı", num(d.kurtosis)],
      ["Bağıl Değişkenlik Katsayısı", num(d.coefficientVariation)],
      ["Toplam Başarı Yüzdesi", num(d.successRate)],
      ["KR-20 Güvenirlik Katsayısı", num(reliability.kr20)],
      ["KR-21 Güvenirlik Katsayısı", num(reliability.kr21)],
    ];

    for (const row of rows) {
      worksheet.addRow(row).getCell(2).alignment = { horizontal: "right" };
    }

    worksheet.addRow([]);
    worksheet.addRow(["Frekans Tablosu"]);
    const frequencyHeader = worksheet.addRow(["Puan", "f", "%"]);
    styleHeaderRow(frequencyHeader);

    for (const entry of frequency) {
      const row = worksheet.addRow([entry.score, entry.count, num(entry.percentage)]);
      row.getCell(1).alignment = { horizontal: "left" };
      row.getCell(2).alignment = { horizontal: "right" };
      row.getCell(3).alignment = { horizontal: "right" };
    }

    setColumnWidths(worksheet, [30, 20, 20]);
    applyBorders(worksheet);

    await downloadWorkbook(
      workbook,
      `${safeFileName(examName, "Test_Istatistikleri")}.xlsx`
    );
  };

  return <ExportButton label="Test İstatistikleri (.xlsx)" onExport={handleExport} />;
}
