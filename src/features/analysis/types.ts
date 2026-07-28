/** Bir maddeye verilebilecek yanıtlar. Boş/geçersiz her şey `BOS`'a normalize edilir. */
export type AnswerOption = "A" | "B" | "C" | "D" | "E" | "BOS";

export const ANSWER_OPTIONS: readonly AnswerOption[] = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "BOS",
] as const;

/**
 * Analiz fonksiyonlarının tamamının girdisi.
 *
 * Eski kodda ham matris (`file_data`) dolaştırılıyor ve her fonksiyon kendi içinde
 * `studentAnswer.slice(1)` ile isim sütununu atıyordu — sekiz ayrı yerde tekrarlanan
 * ve kolayca unutulabilen bir adım. Burada ayrıştırma bir kez `parseExamMatrix` ile
 * yapılır, fonksiyonlar temiz veri alır.
 */
export interface ExamData {
  /** Doğru yanıtlar, madde sırasına göre. Uzunluk = madde sayısı (k). */
  answerKey: AnswerOption[];
  /** Öğrenci adları, satır sırasına göre. Uzunluk = öğrenci sayısı (n). */
  studentNames: string[];
  /** n × k yanıt matrisi. `responses[i][j]` = i. öğrencinin j. maddeye yanıtı. */
  responses: AnswerOption[][];
}

/** Test geneli betimsel istatistikler. Tanımsız olanlar `null`. */
export interface DescriptiveStats {
  studentCount: number;
  questionCount: number;
  mean: number;
  median: number | null;
  mode: number[];
  min: number | null;
  max: number | null;
  range: number | null;
  variance: number;
  stdDeviation: number;
  skewness: number | null;
  kurtosis: number | null;
  coefficientVariation: number | null;
  successRate: number | null;
}

/** Madde başına istatistikler. Uzunlukları madde sayısına eşittir. */
export interface ItemStats {
  /** Doğru yanıtlama oranı (p). Madde güçlük indeksi. */
  difficulty: number[];
  /** Doğru yanıtlayan öğrenci sayısı. */
  correctCount: number[];
  /** Doğru yanıtlama yüzdesi (0–100). */
  correctPercentage: number[];
  variance: number[];
  stdDeviation: number[];
  /** Üst %27 – alt %27 ayırt edicilik indeksi. */
  discrimination: number[];
  /** Biserial korelasyon. p = 0 veya 1 olan maddelerde `null`. */
  rbis: (number | null)[];
  /** Point-biserial korelasyon. */
  prbis: (number | null)[];
  /** Madde güvenirlik indeksi (r_pbis × s_madde). */
  reliabilityIndex: (number | null)[];
}

/** Öğrenci başına hesaplanan değerler. Uzunlukları öğrenci sayısına eşittir. */
export interface StudentStats {
  /** Doğru yanıt sayısı. */
  scores: number[];
  /** 100 üzerinden puan. */
  points: number[];
  /** Doğru oranı (0–1). */
  successRates: number[];
  zScores: (number | null)[];
  tScores: (number | null)[];
  /** Eşit puanlar eşit sıra alır (competition ranking). */
  ranks: number[];
}

export interface ReliabilityStats {
  kr20: number | null;
  kr21: number | null;
}

/** Bir maddedeki seçenek dağılımı. */
export interface OptionDistribution {
  questionNo: number;
  counts: Record<AnswerOption, number>;
  total: number;
  percentages: Record<AnswerOption, number>;
  upperGroup: Record<AnswerOption, number>;
  lowerGroup: Record<AnswerOption, number>;
  groupSize: number;
}

/** Puan frekans tablosu satırı. */
export interface FrequencyRow {
  score: number;
  count: number;
  percentage: number;
}

/** `analyzeExam` çıktısı — raporlama ve dışa aktarma katmanının tek girdisi. */
export interface ExamAnalysis {
  descriptive: DescriptiveStats;
  reliability: ReliabilityStats;
  students: StudentStats;
  items: ItemStats;
  options: OptionDistribution[];
  frequency: FrequencyRow[];
  /** n × k ikili matris: doğru = 1, yanlış/boş = 0. */
  binaryMatrix: number[][];
}
