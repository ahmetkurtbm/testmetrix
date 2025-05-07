import React, { useState } from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  pdf,
  Font,
} from "@react-pdf/renderer";
import {
  Svg,
  Circle,
  G,
  Path,
  Text as SvgText,
  Line,
} from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";

// Font tanımlamasını güncelle
Font.register({
  family: "Roboto",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5Q.ttf",
      fontWeight: "normal",
    },
    {
      src: "https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlvAw.ttf",
      fontWeight: "bold",
    },
  ],
});

// Türkçe metinler için sabitler
const TEXTS = {
  header: "Test ve Madde İstatistikleri Öğretmen Raporu",
  testInfo: {
    title: "Test Bilgileri",
    headers: ["Öğretmen", "Okul", "Test Adı", "Sınıf", "Konu", "Test Tarihi"],
  },
  statistics: {
    title: "Test İstatistikleri",
    headers: [
      "Öğrenci Sayısı",
      "En Yüksek Puan",
      "En Düşük Puan",
      "Ortalama",
      "Standart Sapma",
      "Varyans",
      "Ortanca",
      "Mod",
      "Başarı Yüzdesi",
      "Çarpıklık Katsayısı",
      "Basıklık Katsayısı",
      "Kr-20 Güvenirlik Katsayısı",
    ],
  },
  charts: {
    successRate: "Başarı Yüzdesi",
    frequencyTable: "Frekans Tablosu",
    studentScores: "Öğrenci Puanları",
    tableHeaders: ["Puan", "F", "%"],
  },
};

const getRandomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const colors = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"];
const getColor = (index: number) => colors[index % colors.length];

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Roboto",
    backgroundColor: "#ffffff",
  },
  header: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#1a365d",
    padding: 10,
    backgroundColor: "#f8fafc",
    borderRadius: 5,
  },
  section: {
    marginBottom: 10,
    padding: 7,
    backgroundColor: "#e2e8f0",
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
    color: "#555",
  },
  p: {
    fontSize: 12,
    margin: 5,
    color: "#555",
  },
  boldText: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#222",
  },
  boldTextPie: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#222",
    textAlign: "center",
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    margin: 2,
  },
  table: {
    display: "flex",
    width: "100%",
    borderWidth: 0.5,
    borderColor: "#000",
    marginBottom: 5,
  },
  tableRow: {
    fontSize: 9,
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
  },
  tableRowFreq: {
    fontSize: 6,
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
  },
  tableHeader: {
    fontSize: 9,
    flex: 1,
    backgroundColor: "#4a5568",
    color: "#fff",
    padding: 2,
    textAlign: "center",
    fontWeight: "bold",
    borderRightWidth: 1,
    borderRightColor: "#000",
  },
  tableHeaderFreq: {
    fontSize: 6,
    flex: 1,
    backgroundColor: "#4a5568",
    color: "#fff",
    padding: 2,
    textAlign: "center",
    fontWeight: "bold",
    borderRightWidth: 1,
    borderRightColor: "#000",
  },
  tableCell: {
    fontSize: 9,
    flex: 1,
    padding: 2,
    textAlign: "center",
    borderRightWidth: 1,
    borderRightColor: "#000",
    backgroundColor: "#e2e8f0",
  },
  lastCell: {
    borderRightWidth: 0,
  },
  tableCellFreq: {
    fontSize: 6,
    flex: 1,
    padding: 2,
    textAlign: "center",
    borderRightWidth: 1,
    borderRightColor: "#000",
    backgroundColor: "#e2e8f0",
  },
  chartContainer: {
    margin: "10px auto",
    padding: 10,
    backgroundColor: "#ffffff",
    borderRadius: 5,
    width: "95%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  chartTitle: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#1a365d",
  },
  barChart: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 120,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    marginBottom: 10,
  },
  bar: {
    flex: 1,
    top: -30,
    backgroundColor: "#4a5568",
    marginHorizontal: 2,
    position: "relative",
  },
  barLabel: {
    minWidth: 50,
    position: "absolute",
    bottom: -50,
    transform: "translateX(-15%) rotate(-90deg)",
    fontSize: 8,
    color: "#fff",
    whiteSpace: "nowrap",
    overflowWrap: "normal",
    wordWrap: "normal",
    transformOrigin: "0 0",
  },
  barValue: {
    position: "absolute",
    top: -8,
    left: "50%",
    transform: "translateX(-5%)",
    fontSize: 5,
    color: "#fff",
  },
  bottomSection: {
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 5,
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
  },
  freq: {
    height: 200,
    width: "100%",
    backgroundColor: "#bbbbbb",
  },
  pie: {
    width: "100%",
    height: "90%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  pieChart: {},
  pieSlice: {
    padding: 10,
    width: 100,
    height: 100,
    backgroundColor: getRandomColor(),
    borderRadius: 100,
  },
  pieLabel: {
    color: "#000",
  },
  pieValue: {
    color: "#000",
  },
  freqTable: {
    width: "90%",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    overflow: "hidden",
  },
  freqTableHeader: {
    flexDirection: "row",
    backgroundColor: "#2c5282",
    padding: 8,
  },
  freqTableHeaderCell: {
    flex: 1,
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
  },
  freqTableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
  },
  freqTableCell: {
    flex: 1,
    padding: 8,
    fontSize: 9,
    textAlign: "center",
    color: "#1a365d",
  },
  freqTableAltRow: {
    backgroundColor: "#edf2f7",
  },
  // Add new styles for the info section
  infoContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#edf2f7",
    borderRadius: 5,
  },
  infoTitle: {
    fontSize: 14, // Increased from 12
    fontWeight: "bold",
    color: "#1a365d",
    marginBottom: 8, // Increased from 5
    textAlign: "center", // Added center alignment
  },
  infoText: {
    fontSize: 12, // Increased from 10
    color: "#4a5568",
    marginBottom: 5, // Increased from 3
    lineHeight: 1.4, // Added line height
  },
  fontSize: { fontSize: 8 }, // Font size for text in charts
});

// SVG Charts için yeni stiller ekle
const svgStyles = {
  chartContainer: {
    margin: "20px 0",
    padding: "10px",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
  },
  title: {
    textAlign: "center",
    fontSize: "14px",
    fontWeight: "bold",
    marginBottom: "10px",
    color: "#2d3748",
  },
};

// Veri yapısını tanımlama
interface BarData {
  label: string;
  value: number;
  displayValue?: string; // Opsiyonel displayValue ekle
}

// Veri yapısını tanımlama
interface PieData {
  label: string;
  value: string;
}

// BarChart bileşeninin prop'larını tanımlama
interface BarChartProps {
  data: BarData[];
}

// PieChart bileşeninin prop'larını tanımlama
interface PieChartProps {
  data: PieData[];
}

// Geliştirilmiş BarChart bileşeni
const BarChart: React.FC<BarChartProps> = ({ data }) => {
  const width = 600;
  const height = 500;
  const padding = 30;
  const barWidth = (width - 2 * padding) / data.length;

  return (
    <Svg width={height} height={width}>
      <G transform={`translate(${height}, 0) rotate(90)`}>
        {/* Grid lines */}
        {Array.from({ length: 11 }).map((_, i) => (
          <Path
            key={`grid-${i}`}
            d={`M ${padding} ${
              height - padding - (i * (height - 2 * padding)) / 10
            } 
               h ${width - 2 * padding}`}
            stroke="#e2e8f0"
            strokeWidth={0.2}
          />
        ))}
        {/* Y axis values */}
        {Array.from({ length: 11 }).map((_, i) => (
          <SvgText
            key={`y-label-${i}`}
            x={padding - 5}
            y={height - padding - (i * (height - 2 * padding)) / 10}
            style={styles.fontSize}
            textAnchor="end"
            fill="#4a5568"
          >
            {i * 10}
          </SvgText>
        ))}
        {/* Bars and labels */}
        {data.map((item, index) => {
          const barHeight =
            (item.value / Math.max(...data.map((item) => item.value))) *
            (height - 2 * padding);
          const x = padding + index * barWidth + 10;
          const y = height - padding - barHeight;
          const barX = x; // çubuğun başlangıç X pozisyonu
          const centerX = barX + barWidth / 2; // metin ortalanacaksa
          const textY = height - padding + 12; // çubuğun hemen altına yazı

          return (
            <G key={index}>
              {/* Bar */}
              <Path
                d={`M ${x + 2} ${height - padding} v ${-barHeight}`}
                stroke={getColor(index)}
                strokeWidth={barWidth - 8}
                strokeLinecap="round"
              />

              {/* Value label - Fixed position and rotation */}
              <SvgText
                x={x + barWidth / 2 - 4}
                y={y - 11}
                style={styles.fontSize}
                fill="#2d3748"
                textAnchor="end"
              >
                {`%${item.value}`}
              </SvgText>

              {/* Student name */}
              <SvgText
                key={index}
                x={barWidth - 30}
                y={height - padding - 15}
                style={styles.fontSize}
                fill="#4a5568"
                textAnchor="middle"
                transform={`translate(${
                  -410 + index * barWidth
                }, ${430}) rotate(270)`}
              >
                {item.label}
              </SvgText>
              <SvgText
                x={barWidth - 65}
                y={height - padding - 15}
                style={styles.fontSize}
                fill="#4a5568"
                transform={`translate(${
                  -410 + index * barWidth
                }, ${430}) rotate(270)`}
              >
                {index + 1}.
              </SvgText>
            </G>
          );
        })}
      </G>
    </Svg>
  );
};

// Geliştirilmiş PieChart bileşeni
const PieChart: React.FC<PieChartProps> = ({ data }) => {
  const width = 500; // Reduced width
  const height = 400; // Square aspect ratio
  const radius = Math.min(width, height) / 3;
  const centerX = width / 2;
  const centerY = height / 2;

  let total = data.reduce((sum, item) => sum + parseFloat(item.value), 0);
  let startAngle = 0;

  return (
    <Svg width={width} height={height}>
      <G transform={`translate(${centerX}, ${centerY})`}>
        {data.map((item, index) => {
          const percentage = (parseFloat(item.value) / total) * 100;
          const angle = (percentage / 100) * 2 * Math.PI;
          const endAngle = startAngle + angle;

          // Pie dilimi için path hesaplama
          const x1 = radius * Math.cos(startAngle);
          const y1 = radius * Math.sin(startAngle);
          const x2 = radius * Math.cos(endAngle);
          const y2 = radius * Math.sin(endAngle);

          // Büyük yay bayrağı
          const largeArcFlag = percentage > 50 ? 1 : 0;

          // Path string
          const pathData = `
            M 0 0
            L ${x1} ${y1}
            A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
            Z
          `;

          // Etiket pozisyonu
          const labelAngle = startAngle + angle / 2;
          const labelRadius = radius * 1.2;
          const labelX = labelRadius * Math.cos(labelAngle);
          const labelY = labelRadius * Math.sin(labelAngle);

          startAngle = endAngle;

          return (
            <G key={index}>
              <Path
                d={pathData}
                fill={getColor(index)}
                stroke="#ffffff"
                strokeWidth={1}
              />
              <Line
                x1={x2}
                y1={y2}
                x2={labelX}
                y2={labelY}
                stroke="#4a5568"
                strokeWidth={0.5}
              />
              <SvgText
                x={labelX}
                y={labelY}
                style={styles.fontSize}
                fill="#2d3748"
                textAnchor={labelX > 0 ? "start" : "end"}
                alignment-Baseline="middle"
              >
                {`${item.label} (${percentage.toFixed(1)}%)`}
              </SvgText>
            </G>
          );
        })}
      </G>
    </Svg>
  );
};

// FrequencyTable interface'ini güncelle
interface FrequencyData {
  [key: number]: number[];
}

// FrequencyTableProps interface'ini güncelle
interface FrequencyTableProps {
  frequencyTable: FrequencyData;
  totalScores: number;
}

// FrequencyTableSection bileşenini güncelle
const FrequencyTableSection: React.FC<FrequencyTableProps> = ({
  frequencyTable,
  totalScores,
}) => {
  const tableData = Object.entries(frequencyTable)
    .map(([_, row]) => {
      const [score, freq, perc] = row; // Array destructuring ile değerleri al

      // Calculate cumulative frequency
      const cumFreq = Object.values(frequencyTable)
        .filter((r) => r[0] >= score)
        .reduce((sum, r) => sum + r[1], 0);

      // Calculate cumulative percentage
      const cumPerc = ((cumFreq / totalScores) * 100).toFixed(1);

      return {
        score,
        freq,
        perc,
        cumFreq,
        cumPerc,
      };
    })
    .sort((a, b) => b.score - a.score);

  return (
    <View break style={styles.freqTable}>
      <Text style={styles.boldTextPie}>Frekans Dağılım Tablosu</Text>
      <View style={styles.freqTableHeader}>
        <Text style={styles.freqTableHeaderCell}>Puan</Text>
        <Text style={styles.freqTableHeaderCell}>f</Text>
        <Text style={styles.freqTableHeaderCell}>%</Text>
        <Text style={styles.freqTableHeaderCell}>yf</Text>
        <Text style={styles.freqTableHeaderCell}>y%</Text>
      </View>
      {tableData.map((row, index) => (
        <View
          key={`${row.score}-${index}`}
          style={[
            styles.freqTableRow,
            { backgroundColor: index % 2 === 0 ? "#f8fafc" : "#edf2f7" },
          ]}
        >
          <Text style={styles.freqTableCell}>{row.score}</Text>
          <Text style={styles.freqTableCell}>{row.freq}</Text>
          <Text style={styles.freqTableCell}>{row.perc.toFixed(2)}%</Text>
          <Text style={styles.freqTableCell}>{row.cumFreq}</Text>
          <Text style={styles.freqTableCell}>{row.cumPerc}%</Text>
        </View>
      ))}
    </View>
  );
};

interface TestData {
  teacher: string;
  school: string;
  testName: string;
  class: string;
  subject: string;
  date: string;
  studentCount: number;
  highestScore: number;
  lowestScore: number;
  meanScore: number;
  stdDeviation: number;
  frequencyTable: FrequencyData; // Değişti
  median: number;
  mode: number[];
  kr20: number;
  skewness: number;
  kurtosis: number;
  successRate: number;
  varyans: number;
}

interface TestResultsPDFProps {
  data: TestData;
  scores: number[];
  studentNames: string[];
  maxScore: number;
  minScore: number;
  average: number;
  standardDeviation: number;
  frequencyTable: FrequencyData; // Değişti
  median: number;
  mode: number[];
  kr20: number;
  skewness: number;
  kurtosis: number;
  successRate: number;
  varyans: number;
  itemAnalysis: ItemAnalysis;
}

// Add new interface for item analysis
interface ItemAnalysis {
  difficulty: number[];
  discrimination: number[];
  correctProbability: number[]; // Eklendi
}

// Yeni CorrectProbabilityChart bileşeni
const CorrectProbabilityChart: React.FC<{ correctProbability: number[] }> = ({
  correctProbability,
}) => {
  const width = 600;
  const height = 200;
  const padding = 30;
  const barWidth = (width - 2 * padding) / correctProbability.length;

  return (
    <View style={styles.section}>
      <Text style={styles.boldText}>Doğru Yanıtlanma Olasılığı</Text>
      <Svg width={width} height={height}>
        {/* Grid lines */}
        {Array.from({ length: 11 }).map((_, i) => (
          <Path
            key={`grid-${i}`}
            d={`M ${padding} ${
              height - padding - (i * (height - 2 * padding)) / 10
            } 
               h ${width - 2 * padding}`}
            stroke="#e2e8f0"
            strokeWidth={0.2}
          />
        ))}

        {/* Y axis values */}
        {Array.from({ length: 11 }).map((_, i) => (
          <SvgText
            key={`y-label-${i}`}
            x={padding - 5}
            y={height - padding - (i * (height - 2 * padding)) / 10}
            style={styles.fontSize}
            fill="#4a5568"
            textAnchor="end"
          >
            {i * 10}%
          </SvgText>
        ))}

        {/* Bars */}
        {correctProbability.map((prob, index) => {
          const barHeight = (height - 2 * padding) * prob;
          const x = padding + index * barWidth;
          const y = height - padding;

          return (
            <G key={index}>
              {/* Doğru yanıtlanma (Mavi) */}
              <Path
                d={`M ${x + 2} ${y} v ${-barHeight}`}
                stroke="#1a365d"
                strokeWidth={barWidth - 4}
                strokeLinecap="round"
              />
              {/* Yanlış yanıtlanma (Kırmızı) */}
              <Path
                d={`M ${x + 2} ${y - barHeight} v ${-(
                  height -
                  2 * padding -
                  barHeight
                )}`}
                stroke="#dc2626"
                strokeWidth={barWidth - 4}
                strokeLinecap="round"
              />

              {/* Madde numarası */}
              <SvgText
                x={x + barWidth / 2}
                y={height - 10}
                style={styles.fontSize}
                fill="#4a5568"
                textAnchor="middle"
              >
                {`M${index + 1}`}
              </SvgText>

              {/* Yüzde değeri */}
              <SvgText
                x={x + barWidth / 2}
                y={y - barHeight - 10}
                style={styles.fontSize}
                fill="#1a365d"
                textAnchor="middle"
              >
                {`%${(prob * 100).toFixed(0)}`}
              </SvgText>
            </G>
          );
        })}
      </Svg>
    </View>
  );
};

// Add DifficultyLevelTable component
const DifficultyLevelTable: React.FC<{ itemAnalysis: ItemAnalysis }> = ({
  itemAnalysis,
}) => {
  const categories = itemAnalysis.difficulty.reduce(
    (acc: any, diff, index) => {
      const itemName = `M${index + 1}`;
      if (diff >= 0.8) acc.veryEasy.push(itemName);
      else if (diff >= 0.65) acc.easy.push(itemName);
      else if (diff >= 0.35) acc.moderate.push(itemName);
      else if (diff >= 0.2) acc.difficult.push(itemName);
      else acc.veryDifficult.push(itemName);
      return acc;
    },
    { veryEasy: [], easy: [], moderate: [], difficult: [], veryDifficult: [] }
  );

  return (
    <View style={styles.section}>
      <Text style={styles.boldText}>Madde Güçlük İndeksi Analizi</Text>
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={[styles.tableHeader, { flex: 1 }]}>Ölçüt</Text>
          <Text style={[styles.tableHeader, { flex: 2 }]}>Maddeler</Text>
        </View>
        {[
          {
            label: "Çok Kolay Maddeler (0.80-1.00)",
            items: categories.veryEasy,
          },
          { label: "Kolay Maddeler (0.65-0.79)", items: categories.easy },
          {
            label: "Orta Güçlükte Maddeler (0.35-0.64)",
            items: categories.moderate,
          },
          { label: "Zor Maddeler (0.20-0.34)", items: categories.difficult },
          {
            label: "Oldukça Zor Maddeler (0.00-0.19)",
            items: categories.veryDifficult,
          },
        ].map((category, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 1 }]}>
              {category.label}
            </Text>
            <Text style={[styles.tableCell, { flex: 2 }]}>
              {category.items.length > 0 ? category.items.join(", ") : "-"}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// Add DiscriminationLevelTable component
const DiscriminationLevelTable: React.FC<{ itemAnalysis: ItemAnalysis }> = ({
  itemAnalysis,
}) => {
  const categories = itemAnalysis.discrimination.reduce(
    (acc: any, disc, index) => {
      const itemName = `M${index + 1}`;
      if (disc >= 0.4) acc.excellent.push(itemName);
      else if (disc >= 0.3) acc.good.push(itemName);
      else if (disc >= 0.2) acc.acceptable.push(itemName);
      else if (disc >= 0.0) acc.poor.push(itemName);
      else acc.negative.push(itemName);
      return acc;
    },
    { excellent: [], good: [], acceptable: [], poor: [], negative: [] }
  );

  return (
    <View style={styles.section}>
      <Text style={styles.boldText}>Madde Ayırt Edicilik İndeksi Analizi</Text>
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={[styles.tableHeader, { flex: 1 }]}>Ölçüt</Text>
          <Text style={[styles.tableHeader, { flex: 2 }]}>Maddeler</Text>
        </View>
        {[
          {
            label: "Çok İyi Maddeler (0.40-1.00)",
            items: categories.excellent,
          },
          { label: "İyi Maddeler (0.30-0.39)", items: categories.good },
          {
            label: "Orta Düzey Maddeler (0.20-0.29)",
            items: categories.acceptable,
          },
          { label: "Zayıf Maddeler (0.00-0.19)", items: categories.poor },
          { label: "Çok Zayıf Maddeler (negatif)", items: categories.negative },
        ].map((category, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 1 }]}>
              {category.label}
            </Text>
            <Text style={[styles.tableCell, { flex: 2 }]}>
              {category.items.length > 0 ? category.items.join(", ") : "-"}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// Update TestResultsPDF page
const TestResultsPDF: React.FC<TestResultsPDFProps> = ({
  data,
  scores,
  studentNames,
  maxScore,
  minScore,
  average,
  standardDeviation,
  frequencyTable,
  median,
  mode,
  kr20,
  skewness,
  kurtosis,
  successRate,
  varyans,
  itemAnalysis,
}) => {
  const barData = studentNames.map((name, index) => ({
    label: name,
    value: scores[index],
    displayValue: `%${scores[index].toFixed(0)}`, // Yüzde işareti ve tam sayı formatı
  }));

  interface ScoreCounts {
    [key: number]: number;
  }

  const scoreCounts = scores.reduce((acc: ScoreCounts, score) => {
    acc[score] = (acc[score] || 0) + 1;
    return acc;
  }, {} as ScoreCounts);

  const totalScores = scores.length;

  const pieData = Object.keys(scoreCounts).map((score) => ({
    label: `${score}`,
    value:
      ((scoreCounts[parseInt(score, 10)] / totalScores) * 100)
        .toFixed(2)
        .toString() + "%",
  }));

  const dagilimTipi =
    skewness === 0
      ? "normal dağılım"
      : skewness > 0
      ? "sağa çarpık"
      : "sola çarpık";

  const dagilimAciklamasi =
    skewness === 0
      ? `Normal dağılım, merkezi eğilim ölçülerinin birbirine yakın çıktığı durumda ortaya çıkar. 
         Çarpıklık katsayısı (-1, +1) aralığında olduğundan dağılımın normalden çok uzaklaşmadığı varsayılabilir. 
         Grubun aritmetik ortalama çevresinden yığıldığı ve çok düşük ve çok yüksek puanlarda daha az öğrencinin yer aldığı söylenebilir.`
      : skewness > 0
      ? `Sağa çarpık dağılım, Mod<Ortanca<Aritmetik Ortalama olduğu durumda veriler sol tarafa yani düşük puanlara yığıldığında ortaya çıkar. 
         Simetriklik bozulmuş ve verilerin yarıdan fazlası aritmetik ortalamanın altında kalmıştır. 
         Bir başarı testinde soruların zor olduğu ya da grubun görece başarısız olduğu şeklinde yorumlanabilir.`
      : `Sola çarpık dağılım, Aritmetik Ortalama<Ortanca<Mod olduğu durumda veriler sağ tarafa yani yüksek puanlara yığıldığında ortaya çıkar. 
         Simetriklik bozulmuş ve verilerin yarıdan fazlası aritmetik ortalamanın üstünde kalmıştır. 
         Bir başarı testinde soruların kolay olduğu ya da grubun görece başarılı olduğu şeklinde yorumlanabilir.`;

  return (
    <Document>
      {/* First page remains the same */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>{TEXTS.header}</Text>
        <View style={styles.section}>
          <Text style={styles.boldText}>{TEXTS.testInfo.title}</Text>
          <View style={styles.tableRow}>
            {TEXTS.testInfo.headers.map((header, index) => (
              <Text key={index} style={styles.tableHeader}>
                {header}
              </Text>
            ))}
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>{data.teacher}</Text>
            <Text style={styles.tableCell}>{data.school}</Text>
            <Text style={styles.tableCell}>{data.testName}</Text>
            <Text style={styles.tableCell}>{data.class}</Text>
            <Text style={styles.tableCell}>{data.subject}</Text>
            <Text style={styles.tableCell}>{data.date}</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.section}>
          <Text style={styles.boldText}>{TEXTS.statistics.title}</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              {TEXTS.statistics.headers.slice(0, 6).map((header, index) => (
                <Text key={index} style={styles.tableHeader}>
                  {header}
                </Text>
              ))}
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>{data.studentCount}</Text>
              <Text style={styles.tableCell}>{data.highestScore}</Text>
              <Text style={styles.tableCell}>{data.lowestScore}</Text>
              <Text style={styles.tableCell}>{data.meanScore}</Text>
              <Text style={styles.tableCell}>{data.stdDeviation}</Text>
              <Text style={styles.tableCell}>{data.varyans}</Text>
            </View>
          </View>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              {TEXTS.statistics.headers.slice(6).map((header, index) => (
                <Text key={index} style={styles.tableHeader}>
                  {header}
                </Text>
              ))}
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>{data.median}</Text>
              <Text style={styles.tableCell}>{data.mode.join(", ")}</Text>
              <Text style={styles.tableCell}>{data.successRate}</Text>
              <Text style={styles.tableCell}>{data.skewness}</Text>
              <Text style={styles.tableCell}>{data.kurtosis}</Text>
              <Text style={styles.tableCell}>{data.kr20}</Text>
            </View>
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.p}>
            {`Testten en düşük ${minScore} puan, en yüksek ${maxScore} puan alınmıştır. 
            Puanlara ilişkin dağılım ${dagilimTipi} olarak elde edilmiştir. 
            ${dagilimAciklamasi}
            Bağıl değişkenlik katsayısı ${(
              (standardDeviation / average) *
              100
            ).toFixed(2)} bulunmuştur. 
            Grubun ${
              dagilimTipi === "normal dağılım" ? "heterojen" : "homojen"
            } olduğu belirlenmiştir. 
            Çarpıklık ve basıklık katsayısı dikkate alındığında grubun yığılma noktasını belirlemek amacıyla 
            merkezi eğilim ölçüsü olarak ${
              skewness < 1.5 && skewness > -1.5 ? average : median
            } kullanılması önerilmektedir. 
            Grubun yarıdan fazlası aritmetik ortalamanın ${
              skewness > 0 ? "üstünde" : "altında"
            } yer almaktadır. 
            Testten elde edilen puanlara ait güvenirlik katsayısı ${kr20} olarak bulunmuştur. 
            Bu katsayısının ${
              kr20 > 0.7 ? "yeterli" : "yetersiz"
            } olduğu söylenebilir. 
            ${
              kr20 > 0.7
                ? "Bu durumda testin güvenirliği yeterli kabul edilebilir."
                : "Bu durumda testin güvenirliği yetersiz kabul edilebilir."
            }`}
          </Text>
        </View>
        <View style={styles.divider} />
      </Page>

      {/* Bar Chart page - Force landscape orientation */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Öğrenci Başarı Grafiği</Text>
        <View style={[styles.chartContainer, { height: "85%", margin: 10 }]}>
          <BarChart data={barData} />
        </View>
      </Page>

      {/* Pie Chart and Frequency Table on same page */}
      <Page size="A4" style={styles.page}>
        <View style={{ height: "60%" }}>
          <Text style={styles.header}>Puan Dağılım Grafiği</Text>
          <View style={styles.pie}>
            <PieChart data={pieData} />
          </View>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Daire Grafik</Text>
          <Text style={styles.infoText}>
            • Bu daire grafik, öğrencilerin aldıkları puanların dağılımını
            göstermektedir.
          </Text>
          <Text style={styles.infoText}>
            • Her dilim farklı bir puan değerini temsil eder ve yüzdelik olarak
            gösterilmiştir.
          </Text>
          <Text style={styles.infoText}>
            • En yüksek yüzdeye sahip dilim (
            {Math.max(...pieData.map((d) => parseFloat(d.value)))}%), en çok
            alınan puanı göstermektedir.
          </Text>
          <Text style={styles.infoText}>
            • Ortalama puan: {average.toFixed(2)}
          </Text>
          <Text style={styles.infoText}>
            • Puan aralığı: {minScore} - {maxScore}
          </Text>
          <Text style={styles.infoText}>
            • Toplam öğrenci sayısı: {scores.length}
          </Text>
          <Text style={styles.infoText}>
            • Başarı oranı: %{successRate.toFixed(2)}
          </Text>
        </View>
      </Page>

      {/* Add new page for frequency table */}
      <Page size="A4" style={styles.page}>
        <View style={{ height: "100%" }}>
          <FrequencyTableSection
            frequencyTable={frequencyTable}
            totalScores={scores.length}
          />
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        <View>
          <ItemAnalysisTable itemAnalysis={itemAnalysis} />
          <DifficultyLevelTable itemAnalysis={itemAnalysis} />
          <DiscriminationLevelTable itemAnalysis={itemAnalysis} />
        </View>
      </Page>

      {/* Madde analizi sayfası güncellemesi */}
      <Page size="A4" style={styles.page}>
        <View>
          <CorrectProbabilityChart
            correctProbability={itemAnalysis.difficulty}
          />
        </View>
      </Page>
    </Document>
  );
};

// Update ItemAnalysisTable component
const ItemAnalysisTable: React.FC<{ itemAnalysis: ItemAnalysis }> = ({
  itemAnalysis,
}) => {
  const itemCount = itemAnalysis.difficulty.length;
  const halfLength = Math.ceil(itemCount / 2);

  return (
    <View style={styles.section}>
      <Text style={styles.boldText}>Madde Analiz Tablosu</Text>
      <View style={styles.table}>
        <View style={styles.tableRow}>
          {/* First half headers */}
          <Text style={[styles.tableHeader, { flex: 0.5 }]}>Madde No</Text>
          <Text style={[styles.tableHeader, { flex: 1 }]}>Güçlük İndeksi</Text>
          <Text style={[styles.tableHeader, { flex: 1 }]}>Ayırt Edicilik</Text>
          {/* Second half headers */}
          <Text style={[styles.tableHeader, { flex: 0.5 }]}>Madde No</Text>
          <Text style={[styles.tableHeader, { flex: 1 }]}>Güçlük İndeksi</Text>
          <Text style={[styles.tableHeader, { flex: 1 }]}>Ayırt Edicilik</Text>
        </View>

        {Array.from({ length: halfLength }).map((_, i) => (
          <View key={i} style={styles.tableRow}>
            {/* First half data */}
            <Text style={[styles.tableCell, { flex: 0.5 }]}>M{i + 1}</Text>
            <Text style={[styles.tableCell, { flex: 1 }]}>
              {itemAnalysis.difficulty[i]?.toFixed(2) || "-"}
            </Text>
            <Text style={[styles.tableCell, { flex: 1 }]}>
              {itemAnalysis.discrimination[i]?.toFixed(2) || "-"}
            </Text>

            {/* Second half data */}
            <Text style={[styles.tableCell, { flex: 0.5 }]}>
              {i + halfLength < itemCount ? `M${i + halfLength + 1}` : "-"}
            </Text>
            <Text style={[styles.tableCell, { flex: 1 }]}>
              {itemAnalysis.difficulty[i + halfLength]?.toFixed(2) || "-"}
            </Text>
            <Text style={[styles.tableCell, { flex: 1 }]}>
              {itemAnalysis.discrimination[i + halfLength]?.toFixed(2) || "-"}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const TestResults: React.FC<any> = ({
  scores,
  studentNames,
  maxScore,
  minScore,
  average,
  standardDeviation,
  frequencyTable,
  median,
  mode,
  varyans,
  successRate,
  kr20,
  kurtosis,
  skewness,
  itemDifficulty,
  itemDiscrimination,
  itemCorrectProbability,
}) => {
  const testData: TestData = {
    teacher: "Mehmet Yilmaz",
    school: "Kocaeli Atilim Lisesi",
    testName: "Matematik",
    class: "2",
    subject: "Modüler Aritmetik",
    date: "08.08.2024 / 16:00",
    studentCount: studentNames.length,
    highestScore: maxScore,
    lowestScore: minScore,
    meanScore: average,
    stdDeviation: standardDeviation.toFixed(2),
    frequencyTable: frequencyTable,
    median: median,
    mode: mode,
    varyans: varyans.toFixed(2),
    successRate: successRate,
    kr20: kr20,
    kurtosis: kurtosis,
    skewness: skewness,
  };

  const itemAnalysis: ItemAnalysis = {
    difficulty: itemDifficulty,
    discrimination: itemDiscrimination,
    correctProbability: itemCorrectProbability,
  };

  const handleDownload = async () => {
    const blob = await pdf(
      <TestResultsPDF
        data={testData}
        scores={scores}
        studentNames={studentNames}
        maxScore={maxScore}
        minScore={minScore}
        average={average}
        standardDeviation={standardDeviation}
        frequencyTable={frequencyTable}
        median={median}
        mode={mode}
        successRate={successRate}
        kr20={kr20}
        varyans={varyans}
        kurtosis={kurtosis}
        skewness={skewness}
        itemAnalysis={itemAnalysis}
      />
    ).toBlob();
    saveAs(blob, "Test_Sonuclari.pdf");
  };

  return (
    <div className="space-y-2">
      <Button
        className="w-full flex justify-between items-center group"
        onClick={handleDownload}
      >
        <span>Test Sonuçları (.pdf)</span>
        <img
          src="/download-icon.svg"
          alt="İndir"
          className="w-4 h-4 ml-2 group-hover:scale-110 transition-transform"
        />
      </Button>
    </div>
  );
};

export default TestResults;
