import React from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";

interface TestAnalysisProps {
  studentCount: number;
  questionCount: number;
  scores: number[];
  mean: number;
  median: number;
  mode: number[];
  range: number;
  stdDeviation: number;
  variance: number;
  skewness: number;
  kurtosis: number;
  coefficientVariation: number;
  kr20: number;
  kr21: number;
}

const TestAnalysis: React.FC<TestAnalysisProps> = ({
  studentCount,
  questionCount,
  scores,
  mean,
  median,
  mode,
  range,
  stdDeviation,
  variance,
  skewness,
  kurtosis,
  coefficientVariation,
  kr20,
  kr21,
}) => {
  const handleDownload = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("İstatistik Raporu");

    // İstatistiksel Özetleri Ekle
    const summaryData = [
      ["Öğrenci Sayısı", studentCount],
      ["Soru Sayısı", questionCount],
      ["Alınabilecek En Yüksek Puan", Number(questionCount.toFixed(2))],
      ["En Düşük Puan", Number(Math.min(...scores).toFixed(2))],
      ["En Yüksek Puan", Number(Math.max(...scores).toFixed(2))],
      ["Aritmetik Ortalama", Number(mean.toFixed(2))],
      ["Ortanca", Number(median.toFixed(2))],
      ["Mod", mode],
      ["Ranj", Number(range.toFixed(2))],
      ["Standart Sapma", Number(stdDeviation.toFixed(2))],
      ["Varyans", Number(variance.toFixed(2))],
      ["Çarpıklık Katsayısı", Number(skewness.toFixed(2))],
      ["Basıklık Katsayısı", Number(kurtosis.toFixed(2))],
      ["Bağıl Değişkenlik Katsayısı", Number(coefficientVariation.toFixed(2))],
      ["KR-20 Güvenirlik Katsayısı", Number(kr20.toFixed(2))],
      ["KR-21 Güvenirlik Katsayısı", Number(kr21.toFixed(2))],
    ];

    summaryData.forEach((row) => worksheet.addRow(row));

    // Frekans Tablosu Hesapla
    const frequencyMap: Record<number, number> = scores.reduce(
      (acc: any, score: any) => {
        acc[score] = (acc[score] || 0) + 1;
        return acc;
      },
      {}
    );
    const totalScores = scores.length;
    const frequencyTable = Object.entries(frequencyMap).map(
      ([score, count]) => [
        parseInt(score, 10),
        count,
        Number(((count / totalScores) * 100).toFixed(2)),
      ]
    );

    // Frekans Tablosunu Ekle
    worksheet.addRow([]);
    worksheet.addRow(["Frekans Tablosu"]);
    worksheet.addRow(["Puan", "f", "%"]);
    frequencyTable.forEach((row) => {
      const dataRow = worksheet.addRow(row);

      // İlk sütun (Puan) sola yaslanacak
      dataRow.getCell(1).alignment = { horizontal: "left" };

      // Diğer sütunlar sağa yaslanacak
      dataRow.getCell(2).alignment = { horizontal: "right" };
      dataRow.getCell(3).alignment = { horizontal: "right" };
    });

    // Histogram için başka bir sayfa ekle
    const chartSheet = workbook.addWorksheet("Histogram");
    chartSheet.addRow(["Puan", "Frekans"]);
    frequencyTable.forEach(([score, count]) => {
      chartSheet.addRow([score, count]);
    });

    // Histogram oluşturma talimatını ekleyin
    chartSheet.addRow([]);
    chartSheet.addRow([
      "Not: Bu veriler kullanılarak Excel'de manuel olarak bir grafik oluşturabilirsiniz. Grafik oluşturmak için bu sayfadaki verileri seçin ve Excel'in 'Ekle' sekmesinden 'Çubuk Grafik' seçeneğini kullanın.",
    ]);

    // Stil Ayarları
    worksheet.columns = [{ width: 30 }, { width: 20 }, { width: 20 }];
    worksheet.eachRow((row, rowIndex) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      // Başlık satırlarını stilize et
      if (rowIndex === summaryData.length + 3) {
        row.eachCell((cell) => {
          cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "4F81BD" },
          };
          cell.alignment = { vertical: "middle", horizontal: "center" };
        });
      }
    });

    // Dosyayı indir
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "Test_Istatistik_Raporu.xlsx");
  };

  return (
    <Button className="w-full" onClick={handleDownload}>
      Test Analizini İndir <img src="download-icon.svg" />
    </Button>
  );
};

export default TestAnalysis;
