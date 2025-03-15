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

// Google Fonts'tan bir font ekleme
// Font.register({
//   family: "Roboto",
//   fonts: [
//     {
//       src: "fonts.ttf",
//     }, // Regular
//     {
//       src: "fonts2.ttf",
//       fontWeight: "bold",
//     }, // Bold
//   ],
// });

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
    // fontFamily: "Roboto",
    backgroundColor: "#f8f9fa",
  },
  header: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#333",
    borderWidth: 1,
  },
  section: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#e2e8f0", // Açık gri arka plan
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
    backgroundColor: "#4a5568", // Koyu gri arka plan
    color: "#fff", // Beyaz yazı rengi
    padding: 2,
    textAlign: "center",
    fontWeight: "bold",
    borderRightWidth: 1,
    borderRightColor: "#000",
  },
  tableHeaderFreq: {
    fontSize: 6,
    flex: 1,
    backgroundColor: "#4a5568", // Koyu gri arka plan
    color: "#fff", // Beyaz yazı rengi
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
    backgroundColor: "#e2e8f0", // Açık gri arka plan
  },
  lastCell: {
    borderRightWidth: 0, // Son hücrenin sağ çizgisini kaldır
  },
  tableCellFreq: {
    fontSize: 6,
    flex: 1,
    padding: 2,
    textAlign: "center",
    borderRightWidth: 1,
    borderRightColor: "#000",
    backgroundColor: "#e2e8f0", // Açık gri arka plan
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
    left: "50%",
    transform: "translateX(-15%) rotate(-90deg)", // Çapraz hizala
    fontSize: 8,
    color: "#fff",
    whiteSpace: "nowrap", // Metni tek satırda tut
    overflowWrap: "normal",
    wordWrap: "normal",
    transformOrigin: "0 0", // Dönüş merkezini ayarla
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
    width: 100, // Sabit genişlik
    height: 100, // Sabit yükseklik
    backgroundColor: getRandomColor(),
    borderRadius: 100, // Yüzde yerine sabit bir değer kullanın
  },
  pieLabel: {
    // minWidth: 50,
    // position: "absolute",
    // bottom: -50,
    // left: "50%",
    // transform: "translateX(-15%) rotate(-90deg)", // Çapraz hizala
    // fontSize: 8,
    // whiteSpace: "nowrap", // Metni tek satırda tut
    // overflowWrap: "normal",
    // wordWrap: "normal",
    // transformOrigin: "0 0", // Dönüş merkezini ayarla
    color: "#000",
  },
  pieValue: {
    // position: "absolute",
    // top: -8,
    // left: "50%",
    // transform: "translateX(-5%)",
    // fontSize: 5,
    color: "#000",
  },
});

// Veri yapısını tanımlama
interface BarData {
  label: string;
  value: number;
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

// Çubuk grafik bileşeni
const BarChart: React.FC<BarChartProps> = ({ data }) => (
  <View style={styles.barChart}>
    {data.map((item, index) => (
      <View
        key={index}
        style={[
          styles.bar,
          { height: `${item.value}%`, backgroundColor: getRandomColor() },
        ]}
      >
        <Text style={styles.barValue}>{item.value}%</Text> {/* Değer */}
        <Text style={styles.barLabel}>{item.label}</Text> {/* Etiket */}
      </View>
    ))}
  </View>
);

const PieChart: React.FC<PieChartProps> = ({ data }) => {
  const total = data.reduce((sum, item) => sum + parseFloat(item.value), 0);
  let startAngle = 0;

  return (
    <Svg width={200} height={200}>
      <G transform="translate(100, 100)">
        {data.map((item, index) => {
          const angle = (parseFloat(item.value) / total) * 360;
          const endAngle = startAngle + angle;
          const largeArcFlag = angle > 180 ? 1 : 0;

          const x1 = Math.cos((startAngle * Math.PI) / 180) * 50;
          const y1 = Math.sin((startAngle * Math.PI) / 180) * 50;
          const x2 = Math.cos((endAngle * Math.PI) / 180) * 50;
          const y2 = Math.sin((endAngle * Math.PI) / 180) * 50;

          const path = `
            M 0 0
            L ${x1} ${y1}
            A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2}
            Z
          `;

          // Dilimin orta açısını hesapla
          const middleAngle = startAngle + angle / 2;

          // Metin konumunu orta açıya göre ayarla
          const textX = Math.cos((middleAngle * Math.PI) / 180) * 30; // 30, dairenin yarıçapından daha küçük bir değer
          const textY = Math.sin((middleAngle * Math.PI) / 180) * 30; // 30, dairenin yarıçapından daha küçük bir değer

          startAngle = endAngle;

          return (
            <G key={index}>
              <Path d={path} fill={getColor(index)} />
              {/* Label değerleri dairenin dışına yerleştir */}
              <SvgText
                x={x1 * 1.2}
                y={y1 * 1.2}
                fill="#000"
                font-size={8}
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {item.label}
              </SvgText>
              {/* Value değerleri dilimlerin ortasına yerleştir */}
              <SvgText
                x={textX}
                y={textY}
                fill="#000"
                font-size={8}
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {item.value}%
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
  stdDeviation: number; // number olarak kalmalı
  frequencyTable: { score: number; frequency: number }[];
  median: number;
  mode: number[];
  kr20: number;
  skewness: number;
  kurtosis: number;
  successRate: number;
  varyans: number; // number olarak kalmalı
}

interface TestResultsPDFProps {
  data: TestData;
  scores: number[];
  studentNames: string[]; // studentNames için tür belirtin
  maxScore: number;
  minScore: number;
  average: number;
  standardDeviation: number;
  frequencyTable: { score: number; frequency: number }[]; // frequencyTable için tür belirtin
  median: number;
  mode: number[]; // mode için tür belirtin
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
  standardDeviation,
  frequencyTable,
}) => {
  // studentNames ve scores dizilerini birleştirerek grafik için uygun veri yapısını oluştur
  const barData = studentNames.map((name, index) => ({
    label: name,
    value: scores[index],
  }));

  interface ScoreCounts {
    [key: number]: number;
  }

  // Puanların tekrar sayısını hesapla
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
        .toString() + "%", // Yüzde olarak hesapla
  }));

  console.log(frequencyTable);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>
          {/* 📊 */}
          Test ve Madde Istatistikleri Ogretmen Raporu
        </Text>
        <View style={styles.section}>
          <Text style={styles.boldText}>Test Bilgileri</Text>
          <View style={styles.tableRow}>
            <Text style={styles.tableHeader}>Ogretmen</Text>
            <Text style={styles.tableHeader}>Okul</Text>
            <Text style={styles.tableHeader}>Test Adi</Text>
            <Text style={styles.tableHeader}>Sinif</Text>
            <Text style={styles.tableHeader}>Konu</Text>
            <Text style={styles.tableHeader}>Test Tarihi</Text>
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
          <Text style={styles.boldText}>
            {/*📈 */}
            Test Istatistikleri
          </Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.tableHeader}>Ogrenci Sayisi</Text>
              <Text style={styles.tableHeader}>En Yüksek Puan</Text>
              <Text style={styles.tableHeader}>En Düsük Puan</Text>
              <Text style={styles.tableHeader}>Ortalama</Text>
              <Text style={styles.tableHeader}>Standart Sapma</Text>
              <Text style={styles.tableHeader}>Varyans</Text>
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
              <Text style={styles.tableHeader}>Ortanca</Text>
              <Text style={styles.tableHeader}>Mod</Text>
              <Text style={styles.tableHeader}>Basari Yüzdesi</Text>
              <Text style={styles.tableHeader}>Çarpiklik Katsayisi</Text>
              <Text style={styles.tableHeader}>Basiklik Katsayisi</Text>
              <Text style={styles.tableHeader}>Kr-20 Güvenirlik Katsayisi</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>{data.median}</Text>
              <Text style={styles.tableCell}>{data.mode.join(", ")}</Text>{" "}
              <Text style={styles.tableCell}>{data.successRate}</Text>
              <Text style={styles.tableCell}>{data.skewness}</Text>
              <Text style={styles.tableCell}>{data.kurtosis}</Text>
              <Text style={styles.tableCell}>{data.kr20}</Text>
            </View>
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.p}>
            Testten en dusuk {minScore} puan, en yuksek {maxScore} puan
            alinmistir. Puanlara iliskin dagilim X3 olarak elde edilmistir. X3
            ………………X5…….……………………………….Bagil degiskenlik katsayisi X6 bulunmustur.
            Grubun X7 oldugu belirlenmistir. Bagil degiskenlik katsayisin gore
            gruplar karsilastirilabilir. Carpiklik ve basiklik katsayisi dikkate
            alindiginda grubun yigilma noktasini belirlemek amaciyla merkezi
            egilim olcusu olarak X8 kullanilmasi onerilmektedir. Grubun yaridan
            fazlasi aritmetik ortalamanin X9 yer almaktadir. Testten elde edilen
            puanlara ait guvenirlik katsayisi X10 olarak bulunmustur. Bu
            katsayisinin X11 oldugu soylenebilir. X12…………………….
          </Text>
        </View>

        <View style={styles.divider} />
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Basari Yüzdesi</Text>
          <BarChart data={barData} />
        </View>

        <View style={styles.divider} />
        <View style={styles.bottomSection}>
          <View style={styles.freq}>
            <Text style={styles.boldTextPie}>Freakans Tablosu</Text>
            <View style={styles.table}>
              <View style={styles.tableRowFreq}>
                <Text style={styles.tableHeaderFreq}>Puan</Text>
                <Text style={styles.tableHeaderFreq}>F</Text>
                <Text style={styles.tableHeaderFreq}>%</Text>
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
            <Text style={styles.boldTextPie}>Ogrenci Puanlari</Text>
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
        Test Sonuçlari <img src="download-icon.svg" />
      </Button>
    </div>
  );
};

export default TestResults;
