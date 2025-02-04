import React from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";

type StudentAnalysisProps = {
  studentNames: string[];
  scores: number[];
  zScore: number[];
  tScore: number[];
  numberOfQuestions: number;
  succesRates: number[];
};

const StudentAnalysis: React.FC<StudentAnalysisProps> = ({
  studentNames,
  scores,
  zScore,
  tScore,
  numberOfQuestions,
  succesRates,
}) => {
  const handleDownload = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Madde İstatistikleri");

    // Başlıkları ekle
    worksheet.addRow([
      "Öğrenci Adı-Soyadı",
      "Doğru Yanıt Sayısı",
      "Yanlış Yanıt Sayısı",
      "Puanı",
      "Başarı Yüzdesi %",
      "Z Puanı",
      "T Puanı",
      "Başarı Sırası",
    ]);

    // Veri ekle
    for (let i = 0; i < studentNames.length; i++) {
      let row = worksheet.addRow([
        studentNames[i],
        scores[i],
        numberOfQuestions - scores[i],
        scores[i],
        ((scores[i] / numberOfQuestions) * 100).toFixed(2) + "%",
        zScore[i].toFixed(2),
        tScore[i].toFixed(2),
        succesRates[i],
      ]);

      row.eachCell((cell) => {
        cell.alignment = { horizontal: "right" };
      });
    }

    // Stil ayarları
    const headerRow = worksheet.getRow(1);
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
        wrapText: true, // Uzun yazıları hücre içinde alt alta yazdırır
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

      // Alternatif satır renkleri
      if (rowIndex > 1 && rowIndex % 2 === 0) {
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
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
    ];

    // Dosyayı indir
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "Ogrenci_Istatistikleri.xlsx");
  };

  return (
    <Button className="w-full" onClick={handleDownload}>
      Öğrenci İstatistikleri İndir <img src="download-icon.svg" />
    </Button>
  );
};

export default StudentAnalysis;
