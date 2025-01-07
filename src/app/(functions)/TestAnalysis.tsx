import React from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

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
      ["Alınabilecek En Yüksek Puan", questionCount],
      ["En Düşük Puan", Math.min(...scores)],
      ["En Yüksek Puan", Math.max(...scores)],
      ["Aritmetik Ortalama", mean],
      ["Ortanca", median],
      ["Mod", mode],
      ["Ranj", range],
      ["Standart Sapma", stdDeviation],
      ["Varyans", variance],
      ["Çarpıklık Katsayısı", skewness],
      ["Basıklık Katsayısı", kurtosis],
      ["Bağıl Değişkenlik Katsayısı", coefficientVariation],
      ["KR-20 Güvenirlik Katsayısı", kr20],
      ["KR-21 Güvenirlik Katsayısı", kr21],
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
        ((count / totalScores) * 100).toFixed(1),
      ]
    );

    // Frekans Tablosunu Ekle
    worksheet.addRow([]);
    worksheet.addRow(["Frekans Tablosu"]);
    worksheet.addRow(["Puan", "f", "%"]);
    frequencyTable.forEach((row) => worksheet.addRow(row));

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
      if (rowIndex === 1 || rowIndex === summaryData.length + 3) {
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

  return <button onClick={handleDownload}>Test Analizini İndir</button>;
};

export default TestAnalysis;
