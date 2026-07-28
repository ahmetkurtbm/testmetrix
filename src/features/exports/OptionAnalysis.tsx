"use client";

import ExcelJS from "exceljs";
import { ExportButton } from "./ExportButton";
import { ANSWER_OPTIONS } from "@/features/analysis";
import {
  applyBorders,
  downloadWorkbook,
  num,
  safeFileName,
  setColumnWidths,
  styleHeaderRow,
  type ExportProps,
} from "./shared";

/**
 * Çeldirici (seçenek) analizi.
 *
 * Üst/alt %27 grup dağılımı artık `analyzeExam` içinde hesaplanıyor. Eskiden
 * bu hesap bu bileşenin içindeydi ve ham matrise `studentAnswers[i][j + 1]`
 * diye erişiyordu — isim sütununu telafi eden `+1` bileşene sızmıştı. Ayrıca
 * grup büyüklüğü için `Math.round` kullanıyordu, ayırt edicilik indeksi ise
 * `Math.ceil`; ikisi artık aynı tanımı paylaşıyor.
 */
export function OptionAnalysisExport({ analysis, answerKey, examName }: ExportProps) {
  const handleExport = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Seçenek Analizi");

    analysis.options.forEach((item, index) => {
      if (index !== 0) worksheet.addRow([]);

      const correct = answerKey[index];
      worksheet.addRow([`Madde ${item.questionNo} (doğru: ${correct})`]);

      const header = worksheet.addRow(["", ...ANSWER_OPTIONS, "Toplam"]);
      styleHeaderRow(header);

      worksheet.addRow([
        "n",
        ...ANSWER_OPTIONS.map((option) => item.counts[option]),
        item.total,
      ]);
      worksheet.addRow([
        "%",
        ...ANSWER_OPTIONS.map((option) => num(item.percentages[option])),
        "100.00",
      ]);
      worksheet.addRow([
        `Üst Grup (%27, n=${item.groupSize})`,
        ...ANSWER_OPTIONS.map((option) => item.upperGroup[option]),
        item.groupSize,
      ]);
      worksheet.addRow([
        `Alt Grup (%27, n=${item.groupSize})`,
        ...ANSWER_OPTIONS.map((option) => item.lowerGroup[option]),
        item.groupSize,
      ]);
    });

    setColumnWidths(worksheet, [26, 10, 10, 10, 10, 10, 10, 12]);
    applyBorders(worksheet);

    await downloadWorkbook(
      workbook,
      `${safeFileName(examName, "Secenek_Analizi")}.xlsx`
    );
  };

  return <ExportButton label="Seçenek Analizi (.xlsx)" onExport={handleExport} />;
}
