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
    marginBottom: 15,
    padding: 10,
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
    marginTop: 2,
    padding: 5,
    backgroundColor: "#fff",
    borderRadius: 5,
    marginBottom: 10,
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
    height: 400,
    width: "100%",
    backgroundColor: "#fff",
    marginTop: 20,
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
    marginTop: 10,
    width: "100%",
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
  const maxValue = Math.max(...data.map((item) => item.value));
  const width = 500;
  const height = 250;
  const padding = 40;
  const barWidth = (width - 2 * padding) / data.length;

  return (
    <Svg width={width} height={height}>
      {/* Grid çizgileri */}
      {Array.from({ length: 11 }).map((_, i) => (
        <Path
          key={`grid-${i}`}
          d={`M ${padding} ${
            height - padding - (i * (height - 2 * padding)) / 10
          } 
             h ${width - 2 * padding}`}
          stroke="#e2e8f0"
          strokeWidth={0.5}
        />
      ))}

      {/* Y ekseni değerleri */}
      {Array.from({ length: 11 }).map((_, i) => (
        <SvgText
          key={`y-label-${i}`}
          x={padding - 5}
          y={height - padding - (i * (height - 2 * padding)) / 10}
          textAnchor="end"
          font-size={8}
          fill="#4a5568"
        >
          {i * 10}
        </SvgText>
      ))}

      {/* Barlar */}
      {data.map((item, index) => {
        const barHeight = (item.value / maxValue) * (height - 2 * padding);
        const x = padding + index * barWidth;
        const y = height - padding - barHeight;

        return (
          <G key={index}>
            <Path
              d={`M ${x + 2} ${height - padding} v ${-barHeight}`}
              stroke={getColor(index)}
              strokeWidth={barWidth - 4}
              strokeLinecap="round"
            />
            {/* Bar değeri */}
            <SvgText
              x={x + barWidth / 2}
              y={y - 8}
              font-size={8}
              fill="#2d3748"
              textAnchor="middle"
            >
              {item.displayValue || item.value}
            </SvgText>
            {/* X ekseni etiketi */}
            <SvgText
              x={x + barWidth / 2}
              y={height - padding + 15}
              font-size={6}
              fill="#4a5568"
              textAnchor="middle"
              transform={`rotate(45, ${x + barWidth / 2}, ${
                height - padding + 15
              })`}
            >
              {item.label}
            </SvgText>
          </G>
        );
      })}
    </Svg>
  );
};

// Geliştirilmiş PieChart bileşeni
const PieChart: React.FC<PieChartProps> = ({ data }) => {
  const width = 500;
  const height = 400;
  const radius = Math.min(width, height) / 2.5;
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
                font-size={8}
                fill="#2d3748"
                textAnchor={labelX > 0 ? "start" : "end"}
                alignment-baseline="middle"
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
}

const TestResultsPDF: React.FC<TestResultsPDFProps> = ({
  data,
  scores,
  studentNames,
  maxScore,
  minScore,
  average,
  median,
  standardDeviation,
  skewness,
  kr20,
  frequencyTable,
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
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>
          Test Sonuç Grafikleri ve Frekans Dağılımı
        </Text>
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>{TEXTS.charts.successRate}</Text>
          <View style={{ alignItems: "center" }}>
            <BarChart data={barData} />
          </View>
        </View>
        <View style={styles.bottomSection}>
          <View style={styles.pie}>
            <Text style={styles.boldTextPie}>{TEXTS.charts.studentScores}</Text>
            <PieChart data={pieData} />
          </View>
        </View>
      </Page>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Frekans Dağılım Tablosu</Text>
        <FrequencyTableSection
          frequencyTable={frequencyTable}
          totalScores={scores.length}
        />
      </Page>
    </Document>
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
      />
    ).toBlob();
    saveAs(blob, "Test_Sonuclari.pdf");
  };

  return (
    <div>
      <Button className="w-full" onClick={handleDownload}>
        Test Sonuçları İndir <img src="download-icon.svg" />
      </Button>
    </div>
  );
};

export default TestResults;
