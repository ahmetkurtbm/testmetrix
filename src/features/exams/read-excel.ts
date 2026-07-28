import ExcelJS from "exceljs";

/**
 * Tarayıcıda Excel dosyasını ham matrise çevirir.
 *
 * İki değişiklik:
 *
 * 1. `xlsx` (SheetJS) paketi bırakıldı. Projede kullanılan `0.18.5` sürümünde
 *    prototype pollution ve ReDoS advisory'leri var ve düzeltmeler npm'e
 *    yayınlanmıyor (yalnızca cdn.sheetjs.com'da). `exceljs` zaten dışa aktarma
 *    tarafında kullanıldığı için okuma da ona taşındı — bir bağımlılık eksildi.
 *
 * 2. `readAsBinaryString` yerine `readAsArrayBuffer`. İlki deprecated ve büyük
 *    dosyalarda bozuk karakter üretebiliyordu (eski kodda `// değiştirilecek`
 *    notu da bunu işaret ediyordu).
 *
 * Burada YALNIZCA hücreler okunur; A/B/C normalizasyonu sunucuda
 * `parseExamMatrix` ile yapılır — istemciden gelen biçime güvenilmez.
 */

type Cell = string | number | boolean | null;

function normalizeCell(value: ExcelJS.CellValue): Cell {
  if (value === null || value === undefined) return null;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }
  if (value instanceof Date) return value.toISOString();

  if (typeof value === "object") {
    // Formül hücresi: hesaplanmış sonucu al
    if ("result" in value) return normalizeCell(value.result as ExcelJS.CellValue);
    // Zengin metin: parçaları birleştir
    if ("richText" in value && Array.isArray(value.richText)) {
      return value.richText.map((part) => part.text).join("");
    }
    // Köprü: görünen metni al
    if ("text" in value && typeof value.text === "string") return value.text;
  }

  return String(value);
}

export async function readExcelMatrix(file: File): Promise<Cell[][]> {
  const buffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) return [];

  const columnCount = worksheet.columnCount;
  const matrix: Cell[][] = [];

  worksheet.eachRow({ includeEmpty: false }, (row) => {
    const cells: Cell[] = [];
    for (let column = 1; column <= columnCount; column++) {
      cells.push(normalizeCell(row.getCell(column).value));
    }
    matrix.push(cells);
  });

  return matrix;
}
