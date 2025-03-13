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
    marginBottom: 10,
  },
  tableRow: {
    fontSize: 12,
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
  },
  tableHeader: {
    fontSize: 12,
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
    fontSize: 12,
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
  chartContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#000",
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#fff",
  },
  barChart: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 150,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    marginBottom: 10,
  },
  bar: {
    flex: 1,
    backgroundColor: "#4a5568",
    marginHorizontal: 2,
    position: "relative",
  },
  barLabel: {
    position: "absolute",
    bottom: -20,
    left: "50%",
    transform: "translateX(-15%)",
    fontSize: 10,
    color: "#fff",
  },
  barValue: {
    position: "absolute",
    top: -10,
    left: "50%",
    transform: "translateX(-10%)",
    fontSize: 10,
    color: "#fff",
  },
});

// Örnek veri dizisi
const barData = [
  { label: "Ahmet", value: 85 },
  { label: "Mehmet", value: 60 },
  { label: "Fatma", value: 75 },
  { label: "Ali", value: 50 },
  { label: "Ahmet", value: 85 },
  { label: "Mehmet", value: 60 },
  { label: "Ayse", value: 90 },
  { label: "Fatma", value: 75 },
  { label: "Ali", value: 50 },
  { label: "Ahmet", value: 85 },
  { label: "Mehmet", value: 60 },
  { label: "Ayse", value: 90 },
  { label: "Fatma", value: 75 },
  { label: "Ali", value: 50 },
];

// Veri yapısını tanımlama
interface BarData {
  label: string;
  value: number;
}

// BarChart bileşeninin prop'larını tanımlama
interface BarChartProps {
  data: BarData[];
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
}

interface TestResultsPDFProps {
  data: TestData;
}

const TestResultsPDF: React.FC<TestResultsPDFProps> = ({ data }) => (
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
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>{data.studentCount}</Text>
            <Text style={styles.tableCell}>{data.highestScore}</Text>
            <Text style={styles.tableCell}>{data.lowestScore}</Text>
            <Text style={styles.tableCell}>{data.meanScore}</Text>
            <Text style={styles.tableCell}>{data.stdDeviation}</Text>
          </View>
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.p}>
          Testten en düşük X1 puan, en yüksek X2 puan alınmıştır. Puanlara
          ilişkin dağılım X3 olarak elde edilmiştir. X3
          ………………X5…….……………………………….Bağıl değişkenlik katsayısı X6 bulunmuştur.
          Grubun X7 olduğu belirlenmiştir. Bağıl değişkenlik katsayısın göre
          gruplar karşılaştırılabilir. Çarpıklık ve basıklık katsayısı dikkate
          alındığında grubun yığılma noktasını belirlemek amacıyla merkezi
          eğilim ölçüsü olarak X8 kullanılması önerilmektedir. Grubun yarıdan
          fazlası aritmetik ortalamanın X9 yer almaktadır. Testten elde edilen
          puanlara ait güvenirlik katsayısı X10 olarak bulunmuştur. Bu
          katsayısının X11 olduğu söylenebilir. X12…………………….
        </Text>
      </View>

      <View style={styles.divider} />
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Basari Yüzdesi</Text>
        <BarChart data={barData}></BarChart>
      </View>
    </Page>
  </Document>
);

const TestResults: React.FC<any> = ({ veri }) => {
  const testData: TestData = {
    teacher: "Mehmet Yilmaz",
    school: "Kocaeli Atilim Lisesi",
    testName: "Matematik",
    class: "2",
    subject: "Modüler Aritmetik",
    date: "08.08.2024 / 16:00",
    studentCount: 20,
    highestScore: 13.0,
    lowestScore: 3.0,
    meanScore: 7.05,
    stdDeviation: 3.25,
  };

  const handleDownload = async () => {
    const blob = await pdf(<TestResultsPDF data={testData} />).toBlob();
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
