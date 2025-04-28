import React from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";

interface StudentAnswersProps {
  studentNames: string[];
  studentAnswers: (number | string)[][];
  answerKey: (number | string)[];
  scores: number[];
}

const StudentAnswers: React.FC<StudentAnswersProps> = ({
  studentNames,
  studentAnswers,
  answerKey,
  scores,
}) => {
  const handleDownload = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Öğrenci Yanıtları");

    // Cevap Anahtarını Ekle (ilk satır)
    worksheet.addRow(["Yanıt Anahtarı", "", ...answerKey]);

    // Başlıkları ekle (ikinci satır)
    const headers = [
      "Öğrenci Adı-Soyadı",
      "Puan",
      ...answerKey.map((_, index) => `M${index + 1}`),
    ];
    worksheet.addRow(headers);

    // Veri ekle (isim, skor, yanıtlar)
    for (let i = 0; i < studentNames.length; i++) {
      // İlk sütunu (ilk eleman) hariç yanıtları ekleyin
      const filteredAnswers = studentAnswers[i].slice(1);
      worksheet.addRow([
        studentNames[i],
        scores[i] * (answerKey.length / 100),
        ...filteredAnswers,
      ]);
    }

    // Stil ayarları
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

    // Cevap Anahtarı Satırı
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "3F8D3F" },
      };
      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true, // Uzun yazıları hücre içinde alt alta yazdırır
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
    saveAs(blob, "Secenekli_Ogrenci_Yanitlari.xlsx");
  };

  return (
    <div>
      <Button
        className="w-full flex justify-between items-center group"
        onClick={handleDownload}
      >
        <span>Öğrenci Cevapları (.xlsx)</span>
        <img
          src="/download-icon.svg"
          alt="İndir"
          className="w-4 h-4 ml-2 group-hover:scale-110 transition-transform"
        />
      </Button>
    </div>
  );
};

export default StudentAnswers;
