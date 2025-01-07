import React from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

interface StudentAnswers01Props {
  studentNames: string[];
  studentAnswers: (number | string)[][];
  answerKey: (number | string)[];
  scores: number[];
}

const StudentAnswers01: React.FC<StudentAnswers01Props> = ({
  studentNames,
  studentAnswers,
  answerKey,
  scores,
}) => {
  const handleDownload = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Öğrenci Cevapları 0-1");

    // Cevap Anahtarı Ekle (ilk satır)
    worksheet.addRow(["Cevap Anahtarı", "", ...answerKey]);

    // Başlıkları ekle (ikinci satır)
    const headers = [
      "Öğrenci İsmi",
      "Öğrenci Puanları",
      ...answerKey.map((_, index) => `S${index + 1}`),
    ];
    worksheet.addRow(headers);

    // Veri ekle (isim, skor, yanıtlar)
    for (let i = 0; i < studentNames.length; i++) {
      worksheet.addRow([studentNames[i], scores[i], ...studentAnswers[i]]);
    }

    // Stil ayarları
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "4F81BD" },
      };
      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true, // Uzun yazıları hücre içinde alt alta yazdırır
      };
    });

    const headerRow = worksheet.getRow(2);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "4F81BD" },
      };
      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true,
      };
    });

    worksheet.eachRow((row, rowIndex) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      // Alternatif satır renkleri (öğrenci satırları)
      if (rowIndex > 2 && rowIndex % 2 === 0) {
        row.eachCell((cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "D3D3D3" },
          };
        });
      }

      // İlk sütun stil ayarı
      const maddeCell = row.getCell(1);
      maddeCell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      maddeCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "4F81BD" },
      };
      maddeCell.alignment = {
        vertical: "middle",
        horizontal: "center",
      };
    });

    // Sütun genişlikleri ayarla
    worksheet.columns = [
      { width: 20 }, // Öğrenci İsmi sütunu
      { width: 20 }, // Puanlar sütunu
      ...answerKey.map(() => ({ width: 10 })), // Yanıt sütunları
    ];

    // Dosyayı indir
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "Ogrenci_Cevaplari_01.xlsx");
  };

  return (
    <button onClick={handleDownload}>
      Öğrenci Cevapları 0-1 Türünden İndir
    </button>
  );
};

export default StudentAnswers01;
