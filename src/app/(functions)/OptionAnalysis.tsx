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
  Bos: number;
}

interface OptionAnalysisProps {
  data: OptionData[];
  scores: number[]; // Öğrencilerin toplam puanları
  studentAnswers: any[][]; // Öğrencilerin cevapları (0 ve 1'lerden oluşan string dizisi)
}

const OptionAnalysis: React.FC<OptionAnalysisProps> = ({
  data,
  scores,
  studentAnswers,
}) => {
  // Her madde için üst ve alt grupları hesapla
  const calculateAnalysisData = (
    data: OptionData[],
    scores: number[],
    studentAnswers: string[][]
  ) => {
    // Öğrencileri puanlarına göre sırala
    const sortedIndices = scores
      .map((score, index) => ({ score, index }))
      .sort((a, b) => b.score - a.score) // Büyükten küçüğe sırala
      .map((item) => item.index);

    const totalStudents = sortedIndices.length;

    // Üst ve alt grupların boyutunu hesapla (toplam öğrenci sayısının %27'si)
    const groupSize = Math.round(totalStudents * 0.27);

    // Üst ve alt grupların indekslerini belirle
    const upperGroupIndices = sortedIndices.slice(0, groupSize);
    const lowerGroupIndices = sortedIndices.slice(-groupSize);

    return data.map((item, questionIndex) => {
      const total = item.A + item.B + item.C + item.D + item.E + item.Bos;

      // Üst ve alt grupların seçenek dağılımını hesapla
      const upperGroup = [0, 0, 0, 0, 0, 0, groupSize]; // A, B, C, D, E, Boş, Toplam
      const lowerGroup = [0, 0, 0, 0, 0, 0, groupSize]; // A, B, C, D, E, Boş, Toplam

      upperGroupIndices.forEach((studentIndex) => {
        const answer = studentAnswers[studentIndex][questionIndex + 1];
        if (answer === "A") upperGroup[0]++;
        else if (answer === "B") upperGroup[1]++;
        else if (answer === "C") upperGroup[2]++;
        else if (answer === "D") upperGroup[3]++;
        else if (answer === "E") upperGroup[4]++;
        else if (answer === "Bos") upperGroup[5]++;
      });

      lowerGroupIndices.forEach((studentIndex) => {
        const answer = studentAnswers[studentIndex][questionIndex + 1];
        if (answer === "A") lowerGroup[0]++;
        else if (answer === "B") lowerGroup[1]++;
        else if (answer === "C") lowerGroup[2]++;
        else if (answer === "D") lowerGroup[3]++;
        else if (answer === "E") lowerGroup[4]++;
        else if (answer === "Bos") lowerGroup[5]++;
      });

      return {
        madde: item.madde,
        options: ["A", "B", "C", "D", "E", "Bos", "Toplam"],
        n: [item.A, item.B, item.C, item.D, item.E, item.Bos, total],
        percent: [
          total > 0 ? ((item.A / total) * 100).toFixed(2) : "0.00",
          total > 0 ? ((item.B / total) * 100).toFixed(2) : "0.00",
          total > 0 ? ((item.C / total) * 100).toFixed(2) : "0.00",
          total > 0 ? ((item.D / total) * 100).toFixed(2) : "0.00",
          total > 0 ? ((item.E / total) * 100).toFixed(2) : "0.00",
          total > 0 ? ((item.Bos / total) * 100).toFixed(2) : "0.00",
          "100.00",
        ],
        upperGroup,
        lowerGroup,
      };
    });
  };

  const handleDownload = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Seçenek Analizi");

    // Veriyi analiz et
    const analysisData = calculateAnalysisData(data, scores, studentAnswers);

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

      if (rowIndex === 1 || row.values[1]?.toString().startsWith("Madde")) {
        row.eachCell((cell: any) => {
          cell.font = { bold: true, color: { argb: "FFFFFF" } };
          cell.alignment = { horizontal: "center" };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "4F81BD" },
          };
        });
      }

      if (rowIndex % 7 === 4) {
        row.eachCell((cell: any, colNumber: number) => {
          cell.alignment = { horizontal: colNumber === 1 ? "left" : "right" };
        });
      }

      if (rowIndex % 7 === 2) {
        row.eachCell((cell: any, colNumber: number) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "4F81BD" },
          };
        });
      }

      // if (rowIndex % 7 === 2) {
      //   row.eachCell((cell: any, colNumber: number) => {
      //     //Burada doğru yanıtları kırmızı yap
      //     if (colNumber === 8 || colNumber === 7) {
      //       cell.fill = {
      //         type: "pattern",
      //         pattern: "solid",
      //         fgColor: { argb: "FF0000" }, // Kırmızı renk
      //       };
      //     }
      //   });
      // }
    });

    // Dosyayı İndir
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "Secenek_Analizi.xlsx");
  };

  return (
    <div>
      <Button
        className="w-full flex justify-between items-center group"
        onClick={handleDownload}
      >
        <span>Seçenek Analizi (.xlsx)</span>
        <img
          src="/download-icon.svg"
          alt="İndir"
          className="w-4 h-4 ml-2 group-hover:scale-110 transition-transform"
        />
      </Button>
    </div>
  );
};

export default OptionAnalysis;
