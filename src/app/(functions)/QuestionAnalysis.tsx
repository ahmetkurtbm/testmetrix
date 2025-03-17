import React from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";

type QuestionAnalysisProps = {
  correctCount: number[];
  percentageMap: number[];
  itemVariance: number[];
  itemStd: number[];
  itemDifficulty: number[];
  itemRbis: number[];
  itemPrbis: number[];
  item27: number[];
  itemReliability: number[];
};

const QuestionAnalysis: React.FC<QuestionAnalysisProps> = ({
  correctCount,
  percentageMap,
  itemVariance,
  itemStd,
  itemDifficulty,
  itemRbis,
  itemPrbis,
  item27,
  itemReliability,
}) => {
  const handleDownload = async () => {
    const percentageInverted = percentageMap.map((value) => 100 - value);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Madde İstatistikleri");

    // Başlıkları ekle
    worksheet.addRow([
      "Madde Numarası",
      "Madde Doğru Yanıtlanma Sayısı",
      "Madde Doğru Yanıtlanma Olasılığı",
      "Madde Yanlış Yanıtlanma Olasılığı",
      "Madde Varyansı",
      "Madde Standart Sapması",
      "Madde Güçlük İndeksi",
      // "Madde Ayırt Edicilik İndeksi (BİS)",
      "Madde Ayırt Edicilik İndeksi (PBİS)",
      "Madde Ayırt Edicilik İndeksi (%27)",
      "Madde Güvenirlik İndeksi",
    ]);

    // Veri ekle
    for (let i = 0; i < percentageMap.length; i++) {
      worksheet.addRow([
        `Madde ${i + 1}`,
        correctCount[i].toFixed(2),
        (percentageMap[i] / 100).toFixed(2),
        (percentageInverted[i] / 100).toFixed(2),
        itemVariance[i].toFixed(2),
        itemStd[i].toFixed(2),
        itemDifficulty[i].toFixed(2),
        // itemRbis[i].toFixed(2),
        itemPrbis[i].toFixed(2),
        item27[i].toFixed(2),
        itemReliability[i].toFixed(2),
      ]);
    }

    // Stil ayarları
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFF" } };
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

      row.eachCell((cell, colIndex) => {
        if (rowIndex > 1 && colIndex > 1) {
          cell.alignment = { vertical: "middle", horizontal: "right" };
        }
      });

      // Alternatif satır renkleri
      // if (rowIndex === 1) {
      //   row.eachCell((cell, colNumber) => {
      //     if (colNumber === 8) {
      //       // 7. indeks (H1 hücresi)
      //       cell.fill = {
      //         type: "pattern",
      //         pattern: "solid",
      //         fgColor: { argb: "FF0000" }, // Kırmızı renk
      //       };
      //     }
      //   });
      // }
    });

    // Sütun genişlikleri ayarla
    worksheet.columns = [
      { width: 15 },
      { width: 20 },
      { width: 20 },
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
    saveAs(blob, "Madde_Istatistikleri.xlsx");
  };

  return (
    <Button className="w-full" onClick={handleDownload}>
      Madde İstatistikleri İndir <img src="download-icon.svg" />
    </Button>
  );
};

export default QuestionAnalysis;
