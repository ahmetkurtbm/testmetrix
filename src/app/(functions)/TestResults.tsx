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
import { Svg, Circle, G, Path, Text as SvgText } from "@react-pdf/renderer";
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
    backgroundColor: "#000",
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  chartTitle: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#fff",
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
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#e2e8f0",
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 2,
  },
  freq: {
    height: 200,
    width: "100%",
    backgroundColor: "#bbbbbb",
  },
  pie: {
    height: 200,
    width: "100%",
    backgroundColor: "#bbbbbb",
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
});

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
  return (
    <View style={[styles.barChart, { height: 200, padding: 10 }]}>
      {data.map((item, index) => {
        const heightPercentage = (item.value / maxValue) * 100;
        return (
          <View
            key={index}
            style={[
              styles.bar,
              {
                height: `${heightPercentage}%`,
                backgroundColor: getColor(index),
                minWidth: 20,
                maxWidth: 40,
              },
            ]}
          >
            <Text style={[styles.barValue, { color: "#fff", fontSize: 8 }]}>
              {item.displayValue || item.value}{" "}
              {/* displayValue varsa onu, yoksa value'yu göster */}
            </Text>
            <Text
              style={[
                styles.barLabel,
                {
                  bottom: -25,
                  transform: "rotate(-45deg)",
                  fontSize: 6,
                  color: "#fff",
                },
              ]}
            >
              {item.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

// Geliştirilmiş PieChart bileşeni
const PieChart: React.FC<PieChartProps> = ({ data }) => {
  const total = data.reduce((sum, item) => sum + parseFloat(item.value), 0);
  let startAngle = 0;

  return (
    <Svg width={250} height={250}>
      <G transform="translate(125, 125)">
        {data.map((item, index) => {
          const percentage = (parseFloat(item.value) / total) * 100;
          const angle = (percentage / 100) * 360;
          const endAngle = startAngle + angle;
          const largeArcFlag = angle > 180 ? 1 : 0;

          const radius = 80;
          const x1 = Math.cos((startAngle * Math.PI) / 180) * radius;
          const y1 = Math.sin((startAngle * Math.PI) / 180) * radius;
          const x2 = Math.cos((endAngle * Math.PI) / 180) * radius;
          const y2 = Math.sin((endAngle * Math.PI) / 180) * radius;

          const labelRadius = radius * 1.2;
          const midAngle = startAngle + angle / 2;
          const labelX = Math.cos((midAngle * Math.PI) / 180) * labelRadius;
          const labelY = Math.sin((midAngle * Math.PI) / 180) * labelRadius;

          const path = `
            M 0 0
            L ${x1} ${y1}
            A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
            Z
          `;

          startAngle = endAngle;

          return (
            <G key={index}>
              <Path
                d={path}
                fill={getColor(index)}
                stroke="#fff"
                strokeWidth={1}
              />
              <SvgText
                x={labelX}
                y={labelY}
                fill="#333"
                fontSize={8}
                textAnchor="middle"
                alignmentBaseline="middle"
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
  frequencyTable: { score: number; frequency: number }[];
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
  frequencyTable: { score: number; frequency: number }[];
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
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>{TEXTS.charts.successRate}</Text>
          <BarChart data={barData} />
        </View>
        <View style={styles.divider} />
        <View style={styles.bottomSection}>
          <View style={styles.freq}>
            <Text style={styles.boldTextPie}>
              {TEXTS.charts.frequencyTable}
            </Text>
            <View style={styles.table}>
              <View style={styles.tableRowFreq}>
                {TEXTS.charts.tableHeaders.map((header, index) => (
                  <Text key={index} style={styles.tableHeaderFreq}>
                    {header}
                  </Text>
                ))}
              </View>
              {Object.entries(frequencyTable).map(([value, index]) => (
                <View key={value} style={styles.tableRow}>
                  <Text style={styles.tableCellFreq}>{value[0]}</Text>
                  <Text style={styles.tableCellFreq}>{value[1]}</Text>
                  <Text style={styles.tableCellFreq}>{value[2]}%</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={styles.pie}>
            <Text style={styles.boldTextPie}>{TEXTS.charts.studentScores}</Text>
            <PieChart data={pieData} />
          </View>
        </View>
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
