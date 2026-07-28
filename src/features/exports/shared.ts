import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import type { AnswerOption, ExamAnalysis } from "@/features/analysis";

/**
 * Dışa aktarma bileşenlerinin ortak altyapısı.
 *
 * Eski altı dosyanın her biri aynı ~60 satırlık ExcelJS stil kodunu (kenarlık,
 * başlık dolgusu, hizalama, sütun genişliği) kendi içinde tekrarlıyordu.
 */

export type ExportProps = {
  analysis: ExamAnalysis;
  studentNames: string[];
  answerKey: AnswerOption[];
  /** n × k ham yanıt matrisi. Analiz çıktısı yalnızca 0/1 içerdiği için ayrı taşınır. */
  responses: AnswerOption[][];
  examName: string;
};

const HEADER_FILL = "4F81BD";
const STRIPE_FILL = "D3D3D3";

/** Hesaplanamayan değerleri "—" gösterir. Eskiden NaN ya da 0 yazılıyordu. */
export function num(value: number | null | undefined, digits = 2): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  return value.toFixed(digits);
}

export function styleHeaderRow(row: ExcelJS.Row) {
  row.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: HEADER_FILL } };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
  });
}

export function applyBorders(worksheet: ExcelJS.Worksheet) {
  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
  });
}

export function stripeRows(worksheet: ExcelJS.Worksheet, startRow: number) {
  worksheet.eachRow((row, index) => {
    if (index > startRow && index % 2 === 0) {
      row.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: STRIPE_FILL },
        };
      });
    }
  });
}

export function setColumnWidths(worksheet: ExcelJS.Worksheet, widths: number[]) {
  worksheet.columns = widths.map((width) => ({ width }));
}

export async function downloadWorkbook(workbook: ExcelJS.Workbook, fileName: string) {
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(
    new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    fileName
  );
}

/** Dosya adı için güvenli hale getirir (Windows'ta yasak karakterler dahil). */
export function safeFileName(name: string, suffix: string): string {
  const cleaned = name.replace(/[\\/:*?"<>|]/g, "-").trim() || "sinav";
  return `${cleaned}_${suffix}`;
}
