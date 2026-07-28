/**
 * Tanıtım sayfasındaki örnek sınav.
 *
 * 12 öğrenci, 10 madde. Gerçekçi bir yetenek dağılımı içeriyor: 1. madde çok
 * kolay (12'de 11 doğru), 10. madde çok zor (12'de 1 doğru). Böylece tanıtımda
 * gösterilen güçlük ve ayırt edicilik değerleri anlamlı çıkıyor.
 *
 * Ham matris biçiminde tutuluyor — yani yüklenen bir Excel dosyasıyla birebir
 * aynı yapıda. Tanıtım sayfası bunu gerçek `parseExamMatrix` + `analyzeExam`
 * hattından geçiriyor; ekranda gösterilen sayılar elle yazılmış değil.
 */
export const SAMPLE_EXAM_MATRIX: string[][] = [
  ["Cevap Anahtarı", "A", "B", "C", "D", "E", "A", "B", "C", "D", "E"],
  ["Ayşe Yılmaz", "A", "B", "C", "D", "E", "A", "B", "C", "D", "E"],
  ["Berk Demir", "A", "B", "C", "D", "E", "A", "B", "C", "D", "C"],
  ["Ceren Kaya", "A", "B", "C", "D", "E", "A", "B", "C", "A", "E"],
  ["Deniz Arslan", "A", "B", "C", "D", "E", "A", "B", "C", "A", "C"],
  ["Emre Şahin", "A", "B", "C", "D", "E", "A", "B", "A", "A", "C"],
  ["Fatma Çelik", "A", "B", "C", "D", "E", "A", "D", "C", "A", "C"],
  ["Gökhan Aydın", "A", "B", "C", "D", "E", "B", "B", "A", "A", "C"],
  ["Hale Öztürk", "A", "B", "C", "D", "A", "A", "D", "A", "A", "C"],
  ["İlker Doğan", "A", "B", "C", "A", "E", "A", "D", "A", "A", "C"],
  ["Jale Koç", "A", "B", "A", "A", "E", "A", "D", "A", "A", "C"],
  ["Kemal Ateş", "A", "B", "A", "A", "B", "A", "D", "A", "A", "C"],
  ["Leyla Yıldız", "B", "D", "A", "A", "B", "A", "D", "A", "A", "C"],
];
