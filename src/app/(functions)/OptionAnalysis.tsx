import React from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";

// Veri türleri
interface OptionData {
  madde: string;
  A: number;
  B: number;
  C: number;
  D: number;
  E: number;
  Boş: number;
}

interface OptionAnalysisProps {
  data: OptionData[];
}

const OptionAnalysis: React.FC<OptionAnalysisProps> = ({ data }) => {
  // Her soru için üst ve alt grupları hesapla
  const calculateAnalysisData = (data: OptionData[]) => {
    return data.map((item) => {
      const total = item.A + item.B + item.C + item.D + item.E + item.Boş;

      // Üst ve alt grupların boyutunu hesapla (toplam öğrenci sayısının %27'si)
      const groupSize = Math.round(total * 0.27);

      // Her soru için üst ve alt grupları hesapla
      const upperGroup = [
        Math.round((item.A / total) * groupSize),
        Math.round((item.B / total) * groupSize),
        Math.round((item.C / total) * groupSize),
        Math.round((item.D / total) * groupSize),
        Math.round((item.E / total) * groupSize),
        Math.round((item.Boş / total) * groupSize),
        groupSize,
      ];

      const lowerGroup = [
        Math.round((item.A / total) * groupSize),
        Math.round((item.B / total) * groupSize),
        Math.round((item.C / total) * groupSize),
        Math.round((item.D / total) * groupSize),
        Math.round((item.E / total) * groupSize),
        Math.round((item.Boş / total) * groupSize),
        groupSize,
      ];

      return {
        madde: item.madde,
        options: ["A", "B", "C", "D", "E", "Boş", "Toplam"],
        n: [item.A, item.B, item.C, item.D, item.E, item.Boş, total],
        percent: [
          total > 0 ? ((item.A / total) * 100).toFixed(2) : "0.00",
          total > 0 ? ((item.B / total) * 100).toFixed(2) : "0.00",
          total > 0 ? ((item.C / total) * 100).toFixed(2) : "0.00",
          total > 0 ? ((item.D / total) * 100).toFixed(2) : "0.00",
          total > 0 ? ((item.E / total) * 100).toFixed(2) : "0.00",
          total > 0 ? ((item.Boş / total) * 100).toFixed(2) : "0.00",
          "100",
        ],
        upperGroup,
        lowerGroup,
      };
    });
  };

  const handleDownload = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Madde Analiz Raporu");

    // Veriyi analiz et
    const analysisData = calculateAnalysisData(data);

    // Veriyi Excel'e Ekle
    analysisData.forEach((item, index) => {
      if (index !== 0) worksheet.addRow([]); // Her madde arasında boşluk

      worksheet.addRow([item.madde]); // Madde başlığı
      worksheet.addRow(["", ...item.options]); // Başlıklar
      worksheet.addRow(["n", ...item.n]); // n verisi
      worksheet.addRow(["%", ...item.percent]); // Yüzde verisi
      worksheet.addRow(["Üst Grup (%27)", ...item.upperGroup]); // Üst grup
      worksheet.addRow(["Alt Grup (%27)", ...item.lowerGroup]); // Alt grup
    });

    // Stil Ayarları
    worksheet.columns = [
      { width: 20 },
      { width: 10 },
      { width: 10 },
      { width: 10 },
      { width: 10 },
      { width: 10 },
      { width: 10 },
      { width: 10 },
    ];
    worksheet.eachRow((row: any, rowIndex) => {
      row.eachCell((cell: any) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      if (rowIndex === 1 || row.values[0]?.toString().startsWith("Madde")) {
        row.eachCell((cell: any) => {
          cell.font = { bold: true };
          cell.alignment = { horizontal: "center" };
        });
      }
    });

    // Dosyayı İndir
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "Madde_Analiz_Raporu.xlsx");
  };

  return (
    <div>
      <Button onClick={handleDownload}>Madde Analiz Raporunu İndir</Button>
    </div>
  );
};

export default OptionAnalysis;
