import React from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";

type QuestionAnalysisProps = {
  correctCount: number[];
  percentageMap: number[];
  itemVariance: number[];
  itemStd: number[];
  itemGucluk: number[];
  itemRbis: number[];
  itemPrbis: number[];
  item27: number[];
  itemGüvenirlik: number[];
};

const QuestionAnalysis: React.FC<QuestionAnalysisProps> = ({
  correctCount,
  percentageMap,
  itemVariance,
  itemStd,
  itemGucluk,
  itemRbis,
  itemPrbis,
  item27,
  itemGüvenirlik,
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
      "Madde Ayırt Edicilik İndeksi (RBİS)",
      "Madde Ayırt Edicilik İndeksi (PRBİS)",
      "Madde Ayırt Edicilik İndeksi (%27)",
      "Madde Güvenirlik İndeksi",
    ]);

    // Veri ekle
    for (let i = 0; i < percentageMap.length; i++) {
      worksheet.addRow([
        `Madde ${i + 1}`,
        correctCount[i],
        percentageMap[i],
        percentageInverted[i],
        itemVariance[i],
        itemStd[i],
        itemGucluk[i],
        itemRbis[i],
        itemPrbis[i],
        item27[i],
        itemGüvenirlik[i],
      ]);
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

  return <Button onClick={handleDownload}>Madde İstatistikleri İndir</Button>;
};

export default QuestionAnalysis;
