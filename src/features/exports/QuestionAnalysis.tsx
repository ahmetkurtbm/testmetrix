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

/** Madde bazlı istatistikler. */
export function QuestionAnalysisExport({ analysis, examName }: ExportProps) {
  const handleExport = async () => {
    const { items } = analysis;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Madde İstatistikleri");

    styleHeaderRow(
      worksheet.addRow([
        "Madde",
        "Doğru Yanıtlanma Sayısı",
        "Doğru Yanıtlanma Olasılığı (p)",
        "Yanlış Yanıtlanma Olasılığı (q)",
        "Madde Varyansı",
        "Madde Standart Sapması",
        "Ayırt Edicilik (BİS)",
        "Ayırt Edicilik (PBİS)",
        "Ayırt Edicilik (%27)",
        "Madde Güvenirlik İndeksi",
      ])
    );

    items.difficulty.forEach((difficulty, index) => {
      worksheet.addRow([
        `Madde ${index + 1}`,
        items.correctCount[index],
        num(difficulty),
        num(1 - difficulty),
        num(items.variance[index]),
        num(items.stdDeviation[index]),
        // Bu üçü artık `null` dönebiliyor (p = 0 ya da p = 1 olan maddeler);
        // `num` onları "—" gösteriyor. Eskiden NaN yazılıyordu.
        num(items.rbis[index]),
        num(items.prbis[index]),
        num(items.discrimination[index]),
        num(items.reliabilityIndex[index]),
      ]);
    });

    setColumnWidths(worksheet, [14, 18, 18, 18, 16, 18, 16, 16, 16, 18]);
    applyBorders(worksheet);
    stripeRows(worksheet, 1);

    worksheet.eachRow((row, index) => {
      if (index === 1) return;
      row.eachCell((cell, column) => {
        if (column > 1) cell.alignment = { horizontal: "right" };
      });
    });

    await downloadWorkbook(
      workbook,
      `${safeFileName(examName, "Madde_Istatistikleri")}.xlsx`
    );
  };

  return <ExportButton label="Madde Analizi (.xlsx)" onExport={handleExport} />;
}
