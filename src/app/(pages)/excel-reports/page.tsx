"use client";

import { useState, useEffect } from "react";

import { Line, Bar, Pie, Radar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
} from "chart.js";
// Gerekli bileşenleri kaydet
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend
);

type OptionData = {
  madde: string;
  A: number;
  B: number;
  C: number;
  D: number;
  E: number;
  Bos: number;
};

import QuestionAnalysis from "../../(functions)/QuestionAnalysis";
import StudentAnswers01 from "../../(functions)/StudentAnswers01";
import StudentAnswers from "../../(functions)/StudentAnswers";
import StudentAnalysis from "../../(functions)/StudentAnalysis";
import TestAnalysis from "../../(functions)/TestAnalysis";
import OptionAnalysis from "../../(functions)/OptionAnalysis";
import { ComboboxForData } from "@/components/ui/comboboxForGraficData";
import { ComboboxForGrafic } from "@/components/ui/comboboxForGrafic";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import TestResults from "@/app/(functions)/TestResults";

// Öğrenci yanıtlarının 0-1 üzerinden skorlarını hesaplar
function calculateStudentAnswers01(studentAnswers: any, answerKey: any) {
  return studentAnswers.map((studentAnswer: any) => {
    const tempStudentAnswer = studentAnswer.slice(1);

    const result = tempStudentAnswer.map((answer: any, index: any) => {
      return answer === answerKey[index] ? 1 : 0;
    });

    return result;
  });
}

// öğrencilerin doğru yanıt sayıları (puanları)
function calculateScores(answerKey: any, studentAnswers: any) {
  return studentAnswers.map((studentAnswer: any) => {
    let correctCount = 0;
    const tempStudentAnswer = studentAnswer.slice(1);
    tempStudentAnswer.forEach((answer: any, index: any) => {
      if (answer === answerKey[index]) {
        correctCount += 1;
      }
    });
    return correctCount;
  });
}

// öğrencilerin Puanlarını Hesaplar (puanları)
function calculatePoints(
  answerKey: any,
  studentAnswers: any,
  numberOfQuestions: any
) {
  return studentAnswers.map((studentAnswer: any) => {
    let correctCount = 0;
    const tempStudentAnswer = studentAnswer.slice(1);
    tempStudentAnswer.forEach((answer: any, index: any) => {
      if (answer === answerKey[index]) {
        correctCount += 1;
      }
    });
    return correctCount * (100 / numberOfQuestions);
  });
}

// öğrenci puanlarının ortalaması
function calculateAverage(scores: any) {
  if (!scores || scores.length === 0) {
    return 0;
  }
  const total = scores.reduce((sum: any, score: any) => sum + score, 0);
  return total / scores.length;
}

// öğrenci puanlarının maxı
function calculateMaxScore(scores: any) {
  if (!scores || scores.length === 0) {
    return null;
  }
  return Math.max(...scores);
}

// öğrenci puanlarının mini
function calculateMinScore(scores: any) {
  if (!scores || scores.length === 0) {
    return null;
  }
  return Math.min(...scores);
}

// öğrenci puanlarının varyansı
function calculateVariance(scores: any) {
  if (!scores || scores.length === 0) {
    return 0;
  }
  const mean =
    scores.reduce((sum: any, score: any) => sum + score, 0) / scores.length;
  const variance =
    scores.reduce(
      (sum: any, score: any) => sum + Math.pow(score - mean, 2),
      0
    ) / scores.length;
  return variance;
}

// öğrenci puanlarının standart sapması
function calculateStandardDeviation(scores: any) {
  const variance = calculateVariance(scores);
  return Math.sqrt(variance);
}

// öğrenci puanlarının modları
function calculateMode(scores: number[]): number[] {
  if (!scores || scores.length === 0) {
    return []; // Eğer skorlar boşsa, Bos dizi döndür
  }

  // frequency nesnesinin türünü açıkça belirtiyoruz
  const frequency: { [key: number]: number } = {}; // Skorların frekanslarını tutmak için nesne
  scores.forEach((score) => {
    frequency[score] = (frequency[score] || 0) + 1; // Frekansları sayıyoruz
  });

  const maxFrequency = Math.max(...Object.values(frequency)); // En yüksek frekans
  const modes = Object.keys(frequency)
    .filter((key) => frequency[Number(key)] === maxFrequency) // Anahtarları sayıya dönüştürüp kontrol ediyoruz
    .map((key) => Number(key)); // Sonuçları sayıya dönüştür

  return modes; // Modları bir dizi olarak döndür
}

// öğrenci puanlarının medyanı
function calculateMedian(scores: any) {
  if (!scores || scores.length === 0) {
    return null;
  }
  const sortedScores = [...scores].sort((a, b) => a - b);
  const mid = Math.floor(sortedScores.length / 2);

  if (sortedScores.length % 2 === 0) {
    return (sortedScores[mid - 1] + sortedScores[mid]) / 2; // Çift sayıda eleman varsa ortadaki iki elemanın ortalaması
  } else {
    return sortedScores[mid]; // Tek sayıda eleman varsa ortadaki eleman
  }
}

// öğrenci puanlarının aralığı ranjı
function calculateRange(scores: any) {
  return Math.max(...scores) - Math.min(...scores);
}

// öğrenci puanlarının çarpıklık katsayısı
function calculateSkewness(scores: any) {
  const n = scores.length;
  if (n < 3) return null;

  const mean = scores.reduce((sum: any, score: any) => sum + score, 0) / n;
  const standardDeviation = Math.sqrt(
    scores.reduce(
      (sum: any, score: any) => sum + Math.pow(score - mean, 2),
      0
    ) / n
  );

  const skewness =
    scores.reduce((sum: number, score: number) => {
      return sum + Math.pow(score - mean, 3);
    }, 0) /
    (scores.length * Math.pow(standardDeviation, 3));

  return skewness.toFixed(2);
}

// öğrenci puanlarının basıklık katsayısı
function calculateKurtosis(scores: any) {
  const n = scores.length;
  if (n < 3) return null;

  const mean = scores.reduce((sum: any, score: any) => sum + score, 0) / n;
  const standardDeviation = Math.sqrt(
    scores.reduce(
      (sum: any, score: any) => sum + Math.pow(score - mean, 2),
      0
    ) / n
  );

  const kurtosis =
    scores.reduce(
      (sum: any, score: any) =>
        sum + Math.pow((score - mean) / standardDeviation, 4),
      0
    ) /
      n -
    3;

  return kurtosis.toFixed(2);
}

// öğrenci puanlarının toplam başarı yüzdesi
function calculateSuccessRate(scores: any) {
  const totalScore = scores.reduce((sum: any, score: any) => sum + score, 0);
  const maxScore: any = calculateMaxScore(scores);
  return ((totalScore / (maxScore * scores.length)) * 100).toFixed(2);
}

// öğrenci puanlarının KR20 ayırt edicilik sayısı
function calculateKR20(variance: any, totalQuestions: any, percentageMap: any) {
  const pValues = [];
  const qValues: any = [];
  for (let i = 0; i < totalQuestions; i++) {
    const p = percentageMap[i] / 100;
    const q = 1 - p;
    pValues.push(p);
    qValues.push(q);
  }

  const numerator = pValues.reduce(
    (sum, p, index) => sum + p * qValues[index],
    0
  );
  const kr20 =
    (totalQuestions / (totalQuestions - 1)) * (1 - numerator / variance);

  return kr20.toFixed(2);
}

// öğrenci puanlarının KR21 güvenirlik sayısı düzeltilecek
function calculateKR21(average: any, variance: any, totalQuestions: any) {
  const kr21 =
    (totalQuestions / (totalQuestions - 1)) *
    (1 - (average * (totalQuestions - average)) / (variance * totalQuestions));

  return kr21.toFixed(2);
}

// öğrenci puanlarının bağıl değişkenlik katsayısını hesaplar
function calculateRelativeCoefficientOfVariation(
  standardDeviation: any,
  average: any
) {
  return ((standardDeviation / average) * 100).toFixed(2);
}

// soruların doğru cevaplanma yüzdesi
function calculatePercentageMapPerQuestion(
  answerKey: any,
  studentAnswers: any
) {
  const totalStudents = studentAnswers.length;
  const totalQuestions = answerKey.length;

  if (totalStudents === 0 || totalQuestions === 0) {
    return [];
  }

  const correctCounts = new Array(totalQuestions).fill(0);

  studentAnswers.forEach((studentAnswer: any) => {
    const tempStudentAnswer = studentAnswer.slice(1);
    tempStudentAnswer.forEach((answer: any, index: any) => {
      if (answer === answerKey[index]) {
        correctCounts[index] += 1;
      }
    });
  });

  return correctCounts.map((count) =>
    ((count / totalStudents) * 100).toFixed(2)
  );
}

// Soruların kaçar kez doğru cevaplandığını hesaplar
function calculateCorrectCount(answerKey: any, studentAnswers: any) {
  const totalStudents = studentAnswers.length;
  const totalQuestions = answerKey.length;

  if (totalStudents === 0 || totalQuestions === 0) {
    return [];
  }

  const correctCounts = new Array(totalQuestions).fill(0);

  studentAnswers.forEach((studentAnswer: any) => {
    const tempStudentAnswer = studentAnswer.slice(1);
    tempStudentAnswer.forEach((answer: any, index: any) => {
      if (answer === answerKey[index]) {
        correctCounts[index] += 1;
      }
    });
  });

  return correctCounts;
}

// başarı oranı (her öğrenci için)
function calculateSuccessRates(scores: any, totalQuestions: any) {
  return scores.map((score: any) => score / totalQuestions);
}

// Z-skoru (her öğrenci için)
function calculateZScores(scores: any, average: any, standardDeviation: any) {
  return scores.map((score: any) =>
    parseFloat(((score - average) / standardDeviation).toFixed(3))
  );
}

// T-skoru (her öğrenci için)
function calculateTScores(zScores: any) {
  return zScores.map((z: any) => parseFloat((50 + 10 * z).toFixed(3)));
}

// öğrencilerin başarı sırasını hesaplar
function calculateRanks(scores: any) {
  const sortedScores = [...scores].sort((a, b) => b - a);

  const ranks = scores.map((score: any) => {
    const rank = sortedScores.indexOf(score) + 1;

    sortedScores[sortedScores.indexOf(score)] = null;

    return rank;
  });

  return ranks;
}

// Her madde için madde varyansını hesaplar
function calculateItemVarianceForAll(studentAnswers: any, answerKey: any) {
  const studentScores = calculateStudentAnswers01(studentAnswers, answerKey);

  const itemVariances = [];

  const numQuestions = answerKey.length;

  for (let i = 0; i < numQuestions; i++) {
    const itemScores = studentScores.map(
      (studentAnswer: any) => studentAnswer[i]
    );

    const n = itemScores.length;

    const mean =
      itemScores.reduce((sum: any, score: any) => sum + score, 0) / n;

    const variance =
      itemScores.reduce(
        (sum: any, score: any) => sum + Math.pow(score - mean, 2),
        0
      ) / n;

    const tempVariance = variance.toFixed(2);

    itemVariances.push(tempVariance);
  }

  return itemVariances;
}

// Madde Standart Sapması Hesaplama
function calculateItemStdDevForAll(studentAnswers: any, answerKey: any) {
  return calculateItemVarianceForAll(studentAnswers, answerKey).map(
    (variance) => {
      const tempVariance: any = variance;
      return Math.sqrt(tempVariance).toFixed(2);
    }
  );
}

// Madde Güçlük İndeksi Hesaplama
function calculateItemDifficultyIndexForAll(
  studentAnswers: any,
  answerKey: any
) {
  const studentScores = calculateStudentAnswers01(studentAnswers, answerKey);

  const itemDifficulties = [];

  const numQuestions = answerKey.length;

  for (let i = 0; i < numQuestions; i++) {
    const itemScores = studentScores.map(
      (studentAnswer: any) => studentAnswer[i]
    );

    const difficulty = (
      itemScores.reduce((sum: any, score: any) => sum + score, 0) /
      itemScores.length
    ).toFixed(2);

    itemDifficulties.push(difficulty);
  }

  return itemDifficulties;
}

// Rbis
function calculateRbIndexForAll(
  studentAnswers01: string[][], // Öğrenci cevapları (0 ve 1'lerden oluşan string dizisi)
  stdDev: number, // Her soru için standart sapma
  scores: number[], // Her öğrencinin toplam puanı
  average: number, // Tüm öğrencilerin toplam puan ortalaması
  numberOfQuestions: number, // Soru sayısı
  numberOfStudents: number // Öğrenci sayısı
): number[] {
  const itemRpb: number[] = []; // RPB değerlerini tutacak dizi

  // Tablodan p ve O değerlerini eşleştiren bir obje oluştur
  const pToO: { [key: string]: number } = {
    "0.01": 0.026,
    "0.02": 0.049,
    "0.03": 0.068,
    "0.04": 0.086,
    "0.05": 0.102,
    "0.06": 0.118,
    "0.07": 0.133,
    "0.08": 0.148,
    "0.09": 0.163,
    "0.10": 0.176,
    "0.11": 0.187,
    "0.12": 0.199,
    "0.13": 0.211,
    "0.14": 0.223,
    "0.15": 0.232,
    "0.16": 0.244,
    "0.17": 0.254,
    "0.18": 0.261,
    "0.19": 0.271,
    "0.20": 0.28,
    "0.21": 0.287,
    "0.22": 0.297,
    "0.23": 0.303,
    "0.24": 0.31,
    "0.25": 0.319,
    "0.26": 0.325,
    "0.27": 0.331,
    "0.28": 0.337,
    "0.29": 0.343,
    "0.30": 0.348,
    "0.31": 0.352,
    "0.32": 0.357,
    "0.33": 0.362,
    "0.34": 0.367,
    "0.35": 0.37,
    "0.36": 0.374,
    "0.37": 0.378,
    "0.38": 0.38,
    "0.39": 0.384,
    "0.40": 0.387,
    "0.41": 0.389,
    "0.42": 0.391,
    "0.43": 0.393,
    "0.44": 0.394,
    "0.45": 0.396,
    "0.46": 0.397,
    "0.47": 0.398,
    "0.48": 0.398,
    "0.49": 0.399,
    "0.50": 0.399,
    "0.51": 0.399,
    "0.52": 0.398,
    "0.53": 0.398,
    "0.54": 0.397,
    "0.55": 0.396,
    "0.56": 0.394,
    "0.57": 0.393,
    "0.58": 0.391,
    "0.59": 0.389,
    "0.60": 0.387,
    "0.61": 0.384,
    "0.62": 0.38,
    "0.63": 0.378,
    "0.64": 0.374,
    "0.65": 0.37,
    "0.66": 0.367,
    "0.67": 0.362,
    "0.68": 0.357,
    "0.69": 0.352,
    "0.70": 0.348,
    "0.71": 0.343,
    "0.72": 0.337,
    "0.73": 0.331,
    "0.74": 0.325,
    "0.75": 0.319,
    "0.76": 0.31,
    "0.77": 0.303,
    "0.78": 0.297,
    "0.79": 0.287,
    "0.80": 0.28,
    "0.81": 0.271,
    "0.82": 0.261,
    "0.83": 0.254,
    "0.84": 0.244,
    "0.85": 0.232,
    "0.86": 0.223,
    "0.87": 0.211,
    "0.88": 0.199,
    "0.89": 0.187,
    "0.90": 0.176,
    "0.91": 0.163,
    "0.92": 0.148,
    "0.93": 0.133,
    "0.94": 0.118,
    "0.95": 0.102,
    "0.96": 0.086,
    "0.97": 0.068,
    "0.98": 0.049,
    "0.99": 0.026,
  };

  for (let i = 0; i < numberOfQuestions; i++) {
    // Her soru için öğrencilerin cevaplarını al (0 veya 1)
    const itemScores = studentAnswers01.map((student) => parseInt(student[i]));

    // Puan dizilerini ve ortalamayı hesaplayan fonksiyon
    const calculateMean = (arr: number[]): number =>
      arr.length > 0
        ? arr.reduce((sum, score) => sum + score, 0) / arr.length
        : 0;

    // Öğrenci puanlarını ayırma işlemi
    const { correctScores, inCorrectScores } = itemScores.reduce(
      (acc, score, index) => {
        if (score === 1) acc.correctScores.push(scores[index]);
        else if (score === 0) acc.inCorrectScores.push(scores[index]);
        return acc;
      },
      { correctScores: [] as number[], inCorrectScores: [] as number[] }
    );

    // Ortalama hesaplamaları
    const meanCorrect: number = calculateMean(correctScores);
    const meanInCorrect: number = calculateMean(inCorrectScores);

    // Doğru ve yanlış yapanların sayısı
    const correctCount = correctScores.length;
    const incorrectCount = itemScores.length - correctCount;

    const p = correctCount / numberOfStudents; // Doğru yapanların oranı
    const q = 1 - p;

    const bis =
      ((meanCorrect - meanInCorrect) / stdDev) * ((p * q) / pToO[p.toFixed(2)]);

    itemRpb.push(parseFloat(bis.toFixed(2))); // Sonucu 2 ondalık basamağa yuvarla
  }
  return itemRpb;
}

// Prbis
function calculateRpbIndexForAll(
  studentAnswers01: string[][], // Öğrenci cevapları (0 ve 1'lerden oluşan string dizisi)
  stdDev: number, // Her soru için standart sapma
  scores: number[], // Her öğrencinin toplam puanı
  average: number, // Tüm öğrencilerin toplam puan ortalaması
  numberOfQuestions: number // Soru sayısı
): number[] {
  const itemRpb: number[] = []; // RPB değerlerini tutacak dizi

  for (let i = 0; i < numberOfQuestions; i++) {
    const itemScores = studentAnswers01.map((student) => parseInt(student[i]));

    // Puan dizilerini ve ortalamayı hesaplayan fonksiyon
    const calculateMean = (arr: number[]): number =>
      arr.length > 0
        ? arr.reduce((sum, score) => sum + score, 0) / arr.length
        : 0;

    // Öğrenci puanlarını ayırma işlemi
    const { correctScores, inCorrectScores } = itemScores.reduce(
      (acc, score, index) => {
        if (score === 1) acc.correctScores.push(scores[index]);
        else if (score === 0) acc.inCorrectScores.push(scores[index]);
        return acc;
      },
      { correctScores: [] as number[], inCorrectScores: [] as number[] }
    );

    // Ortalama hesaplamaları
    const meanCorrect: number = calculateMean(correctScores);
    const meanInCorrect: number = calculateMean(inCorrectScores);

    // Doğru ve yanlış yapanların sayısı
    const correctCount = correctScores.length;
    const incorrectCount = itemScores.length - correctCount;

    const p = correctCount / scores.length; // Doğru yapanların oranı
    const q = 1 - p;

    const rBis = ((meanCorrect - meanInCorrect) / stdDev) * Math.sqrt(p * q);

    itemRpb.push(parseFloat(rBis.toFixed(2))); // Sonucu 2 ondalık basamağa yuvarla
  }

  return itemRpb;
}

// Madde Ayırt Edicilik İndeksi (%27) Hesaplama
function calculateDiscriminationIndexForAll(
  studentAnswers: any,
  answerKey: any
) {
  const studentScores = calculateStudentAnswers01(studentAnswers, answerKey);

  const itemDiscriminations = [];

  const numQuestions = answerKey.length;

  const topGroupSize = Math.ceil(studentScores.length * 0.27);
  const bottomGroupSize = Math.ceil(studentScores.length * 0.27);

  for (let i = 0; i < numQuestions; i++) {
    const itemScores = studentScores.map(
      (studentAnswer: any) => studentAnswer[i]
    );

    const totalScores = studentScores.map((answers: any) =>
      answers.reduce((sum: any, score: any) => sum + score, 0)
    );

    const sortedScores = totalScores.map((total: any, index: any) => ({
      total,
      itemScore: itemScores[index],
    }));
    sortedScores.sort((a: any, b: any) => b.total - a.total);

    const topGroup = sortedScores.slice(0, topGroupSize);
    const bottomGroup = sortedScores.slice(-bottomGroupSize);

    const topMean =
      topGroup.reduce((sum: any, item: any) => sum + item.itemScore, 0) /
      topGroup.length;

    const bottomMean =
      bottomGroup.reduce((sum: any, item: any) => sum + item.itemScore, 0) /
      bottomGroup.length;

    const discrimination = (topMean - bottomMean).toFixed(2);

    itemDiscriminations.push(discrimination);
  }

  return itemDiscriminations;
}

// Madde Güvenilirlik İndeksi Hesaplama
function calculateReliabilityIndexForAll(studentAnswers: any, answerKey: any) {
  const itemVariances: any = calculateItemVarianceForAll(
    studentAnswers,
    answerKey
  );
  const itemStdDevs: any = calculateItemStdDevForAll(studentAnswers, answerKey);

  const reliabilityIndexes = itemVariances.map((variance: any, index: any) =>
    (Math.sqrt(variance) * itemStdDevs[index]).toFixed(2)
  );
  return reliabilityIndexes;
}

// Madde başına işaretlenen şık sayılarını tutar
function calculateOptionsCount(studentAnswers: any) {
  const questionCount = studentAnswers[0].length - 1; // Kişi adı hariç
  const result = [];

  for (let i = 1; i <= questionCount; i++) {
    const counts: any = { A: 0, B: 0, C: 0, D: 0, E: 0, Bos: 0 };

    // Tüm katılımcıların yanıtlarını işle
    studentAnswers.forEach((response: any) => {
      const answer = response[i]?.trim().toUpperCase() || "Bos"; // Yanıtları normalize et
      if (counts.hasOwnProperty(answer)) {
        counts[answer]++;
      } else {
        counts["Bos"]++;
      }
    });

    // Sonucu OptionData formatında ekle
    result.push({
      madde: `Madde ${i}`,
      A: counts.A,
      B: counts.B,
      C: counts.C,
      D: counts.D,
      E: counts.E,
      Bos: counts.Bos,
    });
  }

  return result; // OptionData[] türünde bir dizi döndür
}

// Öğrenci Puanları İçin Frekans Tablosu
function calculateFrekans(scores: any) {
  const frequencyMap: Record<number, number> = scores.reduce(
    (acc: any, score: any) => {
      acc[score] = (acc[score] || 0) + 1;
      return acc;
    },
    {}
  );
  const totalScores = scores.length;
  const frequencyTable = Object.entries(frequencyMap).map(([score, count]) => [
    parseInt(score, 10),
    count,
    Number(((count / totalScores) * 100).toFixed(2)),
  ]);
  return frequencyTable;
}

interface ExcelUpdateProps {
  folder_id: string;
  file_name: string;
  created_at: string;
  file_data: string[][];
}

interface File {
  id: string;
  folder_id: string;
  file_name: string;
  created_at: string;
  file_data: string[][];
}

const ExcelReports = () => {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND;
  const router = useRouter();

  // Token Kontrolü
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/user-authentication`, {
          method: "GET",
          credentials: "include", // Çerezleri otomatik ekler
        });

        if (!response.ok) {
          router.push("/login");
        }
      } catch (error) {
        console.error("Kimlik doğrulama hatası:", error);
        router.push("/login");
      }
    };

    checkAuth();
  }, []);

  const [data, setData] = useState<ExcelUpdateProps | null>(null);
  const [answerKey, setAnswerKey] = useState<string[]>([]);
  const [studentAnswers, setStudentAnswers] = useState<string[][]>([[]]);
  const [studentNames, setStudentNames] = useState<string[]>([]);
  const [numberOfQuestions, setNumberOfQuestions] = useState<number>(0);
  const [numberOfStudents, setNumberOfStudents] = useState<number>(0);

  // States for various calculated metrics
  const [scores, setScores] = useState<number[]>([]);
  const [poitns, setPoints] = useState<number[]>([]);
  const [average, setAverage] = useState<number>(0);
  const [standardDeviation, setStandardDeviation] = useState<number>(0);
  const [variance, setVariance] = useState<number>(0);
  const [maxScore, setMaxScore] = useState<number>(0);
  const [minScore, setMinScore] = useState<number>(0);
  const [median, setMedian] = useState<number>(0);
  const [range, setRange] = useState<number>(0);
  const [skewness, setSkewness] = useState<number>(0);
  const [kurtosis, setKurtosis] = useState<number>(0);
  const [successRate, setSuccessRate] = useState<number>(0);
  const [kr20, setKr20] = useState<number>(0);
  const [kr21, setKr21] = useState<number>(0);
  const [relativeCoefficientOfVariation, setRelativeCoefficientOfVariation] =
    useState<number>(0);
  const [mode, setMode] = useState<number[]>([]);
  const [percentageMapPerQuestion, setPercentageMapPerQuestion] = useState<
    number[]
  >([]);
  const [studentAnswer01, setStudentAnswer01] = useState<(string | number)[][]>(
    []
  );
  const [successRates, setSuccessRates] = useState<number[]>([]);
  const [zScores, setZScores] = useState<number[]>([]);
  const [tScores, setTScores] = useState<number[]>([]);
  const [ranks, setRanks] = useState<number[]>([]);
  const [variancePerItem, setVariancePerItem] = useState<number[]>([]);
  const [stdDevPerItem, setStdDevPerItem] = useState<number[]>([]);
  const [difficultyIndex, setDifficultyIndex] = useState<number[]>([]);
  const [rbisIndex, setRbisIndex] = useState<number[]>([]);
  const [prbisIndex, setPrbisIndex] = useState<number[]>([]);
  const [discriminationIndex, setDiscriminationIndex] = useState<number[]>([]);
  const [reliabilityIndex, setReliabilityIndex] = useState<number[]>([]);
  const [optionCounts, setOptionCounts] = useState<OptionData[]>([]);
  const [correctCount, setCorrectCount] = useState<number[]>([]);
  const [frekansTable, setFrekansTable] = useState<number[][]>([]);

  const [selectedGraficsData, setSelectedGraficsData] = useState(
    "Öğrencilerin Puanları"
  );
  const [selectedGrafic, setSelectedGrafic] = useState<any>("bar");
  const [xValues, setXValues] = useState<any[]>();
  const [yValues, setYValues] = useState<any[]>();

  // first useEffect
  useEffect(() => {
    const getExcel = async () => {
      //const fileId = params.get("file-id");
      const searchParams = new URLSearchParams(window.location.search);
      const fileId = searchParams.get("file-id");

      if (fileId) {
        try {
          const response = await fetch(`${BACKEND_URL}/excel`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ fileId }),
            credentials: "include",
          });

          if (response.ok) {
            const fetchedData: File = await response.json();

            const file_name = fetchedData.file_name;
            const folder_id = fetchedData.folder_id;
            const created_at = fetchedData.created_at;
            const file_data = fetchedData.file_data;

            setData({ file_name, folder_id, created_at, file_data });
          } else {
            console.error("Failed to fetch data:", await response.json());
          }
        } catch (error) {
          console.error("Error fetching Excel data:", error);
        }
      }
    };

    getExcel();
  }, []);

  // just
  useEffect(() => {
    if (data?.file_data) {
      const key = data.file_data[0].slice(1); // Answer key excluding first column
      const answers = data.file_data.slice(1); // All students' answers excluding first row
      const names = data.file_data.slice(1).map((row) => row[0]); // Extract student names from first column

      const calculatedScores = calculateScores(key, answers);
      const calculatedPoints = calculatePoints(key, answers, key.length);

      setScores(calculatedScores);
      setPoints(calculatedPoints);
      setAnswerKey(key);
      setStudentAnswers(answers);
      setStudentNames(names);
      setNumberOfQuestions(key.length);
      setNumberOfStudents(answers.length);
    }
  }, [data]);

  // all data
  useEffect(() => {
    // Calculate the various metrics
    const avg = calculateAverage(scores);
    const varianceValue = calculateVariance(scores);
    const stdDev = calculateStandardDeviation(scores);
    const mode = calculateMode(scores);
    const median = calculateMedian(scores);
    const max = calculateMaxScore(scores) ?? 0;
    const min = calculateMinScore(scores) ?? 0;
    const rangeValue = calculateRange(scores);
    const skew = calculateSkewness(scores);
    const kurt = calculateKurtosis(scores);
    const successRateValue = calculateSuccessRate(scores);
    const percMap = calculatePercentageMapPerQuestion(
      answerKey,
      studentAnswers
    );
    const kr20Value = calculateKR20(varianceValue, numberOfQuestions, percMap);
    const kr21Value = calculateKR21(avg, varianceValue, numberOfQuestions);
    const relCoefVariation = calculateRelativeCoefficientOfVariation(
      stdDev,
      avg
    );

    const studentAns01 = calculateStudentAnswers01(studentAnswers, answerKey);
    const successRates = calculateSuccessRates(scores, numberOfQuestions);
    const zScores = calculateZScores(scores, avg, stdDev);
    const tScores = calculateTScores(zScores);
    const ranksValue = calculateRanks(scores);
    const itemVariance = calculateItemVarianceForAll(studentAnswers, answerKey);
    const itemStdDev = calculateItemStdDevForAll(studentAnswers, answerKey);
    const difficultyIndexValue = calculateItemDifficultyIndexForAll(
      studentAnswers,
      answerKey
    );
    const rbis = calculateRbIndexForAll(
      studentAns01,
      stdDev,
      scores,
      avg,
      numberOfQuestions,
      numberOfStudents
    );
    const prbis = calculateRpbIndexForAll(
      studentAns01,
      stdDev,
      scores,
      avg,
      numberOfQuestions
    );
    const discrimination = calculateDiscriminationIndexForAll(
      studentAnswers,
      answerKey
    );
    const reliability = calculateReliabilityIndexForAll(
      studentAnswers,
      answerKey
    );
    const optionCount = calculateOptionsCount(studentAnswers);
    const correctCount = calculateCorrectCount(answerKey, studentAnswers);
    const frequencyTable = calculateFrekans(scores);

    // Set state values
    setAverage(avg);
    setVariance(varianceValue);
    setStandardDeviation(stdDev);
    setMode(mode);
    setMaxScore(max);
    setMinScore(min);
    setRange(rangeValue);
    setMedian(median);
    setSkewness(Number(skew));
    setKurtosis(Number(kurt));
    setSuccessRate(
      isNaN(Number(successRateValue)) ? 0 : Number(successRateValue)
    );
    setKr20(isNaN(Number(kr20Value)) ? 0 : Number(kr20Value));
    setKr21(isNaN(Number(kr21Value)) ? 0 : Number(kr21Value));
    setRelativeCoefficientOfVariation(
      isNaN(Number(relCoefVariation)) ? 0 : Number(relCoefVariation)
    );
    setStudentAnswer01(studentAns01);
    setSuccessRates(successRates);
    setZScores(zScores);
    setTScores(tScores);
    setRanks(ranksValue);
    setVariancePerItem(itemVariance.map((item) => Number(item) || 0)); // Converts string to number
    setStdDevPerItem(itemStdDev.map((item) => Number(item) || 0)); // Converts string to number
    setDifficultyIndex(difficultyIndexValue.map((item) => Number(item) || 0)); // Converts string to number
    setRbisIndex(rbis.map((item) => Number(item) || 0)); // Converts string to number
    setPrbisIndex(prbis.map((item) => Number(item) || 0)); // Converts string to number
    setDiscriminationIndex(discrimination.map((item) => Number(item) || 0)); // Converts string to number
    setPercentageMapPerQuestion(percMap.map((item) => Number(item) || 0)); // Converts string to number

    setReliabilityIndex(reliability.map((item: number) => Number(item) || 0));
    setOptionCounts(optionCount);
    setCorrectCount(correctCount);
    setFrekansTable(frequencyTable);
  }, [scores]);

  // grafik için veri döndürür
  const getDataForPlot = () => {
    switch (selectedGraficsData) {
      case "Öğrencilerin Puanları":
        return poitns;
      case "Öğrenci Puanlarının Frekansları":
        return frekansTable;
      case "Madde Güçlük İndeksi":
        return difficultyIndex;
      case "Başarı Yüzdeleri":
        return successRates;
      case "Z Puanları":
        return zScores;
      case "T Puanları":
        return tScores;
      // case "Öğrenci Sıralamaları":
      //   return ranks;
      case "Madde Bazında Varyans":
        return variancePerItem;
      case "Madde Bazında Standart Sapma":
        return stdDevPerItem;
      case "Madde Toplam Korelasyon Katsayısı (Bis)":
        return rbisIndex;
      case "Çift Katsayılı Kolerasyon Değeri (pBis)":
        return prbisIndex;
      case "Ayırt Edicilik İndeksi":
        return discriminationIndex;
      case "Güvenirlik İndeksi":
        return reliabilityIndex;
      default:
        return [];
    }
  };

  const [options, setOptions] = useState({
    responsive: true,
    maintainAspectRatio: false,
    // indexAxis: window.innerWidth < 640 ? "y" : "x", // indexAxisID yerine indexAxis kullanılmalı
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
        labels: {
          color: "#fff",
          font: { size: 14 },
        },
      },
      title: {
        display: true,
        text: `📊 ${selectedGraficsData}`,
        color: "#fff",
        font: { size: 20 },
      },
      tooltip: {
        enabled: true,
        backgroundColor: "#333",
        titleFont: { size: 16 },
        bodyFont: { size: 14 },
      },
    },
    scales: {
      y: {
        ticks: {
          color: "#fff",
          font: { size: 12 },
          autoSkip: true,
          maxRotation: window.innerWidth < 640 ? 0 : 45,
          minRotation: 0,
        },
        grid: { color: "rgba(200, 200, 200, 0.2)" },
      },
      x: {
        ticks: {
          color: "#fff",
          font: { size: 12 },
          autoSkip: true,
          maxRotation: window.innerWidth < 640 ? 0 : 45,
        },
        grid: { color: "rgba(200, 200, 200, 0.2)" },
      },
    },
  });

  // Resize listener'ı da güncellememiz gerekiyor
  useEffect(() => {
    const handleResize = () => {
      setOptions({
        ...options,
        // indexAxis: window.innerWidth < 640 ? "y" : "x", // Burayı da güncelle
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [options]);

  const tempdata = getDataForPlot();
  const labelPrefix =
    tempdata.length === numberOfStudents
      ? "Öğrenci"
      : tempdata.length === numberOfQuestions
      ? "Madde"
      : "Veri";

  // Eğer tempdata.length === 30 ise labels, studentNames dizisi olsun
  const labels =
    tempdata.length === numberOfStudents
      ? studentNames
      : tempdata.map((_, index) => `${labelPrefix} ${index + 1}`);

  // X ekseni için otomatik etiketler

  // Rastgele renkler oluştur (Pie ve Doughnut için)
  const generateColors = (count: number) =>
    Array.from(
      { length: count },
      () => `hsl(${Math.floor(Math.random() * 360)}, 80%, 60%)`
    );

  const label =
    tempdata.length === 30
      ? "Öğrenci"
      : tempdata.length === 50
      ? "Madde"
      : "Değer";

  const graficdata = {
    labels:
      selectedGraficsData === "Öğrenci Puanlarının Frekansları"
        ? yValues
        : labels,
    datasets: [
      {
        label: label,
        data:
          selectedGraficsData === "Öğrenci Puanlarının Frekansları"
            ? xValues
            : getDataForPlot(),
        textColor: "rgb(250,250,250)",
        borderColor: "rgb(54, 162, 235)",
        backgroundColor: generateColors(getDataForPlot().length), // Pasta/Radar grafikleri için renkli
        borderWidth: 2,
        pointRadius: 5, // Noktaları büyüt
        pointBackgroundColor: "rgb(255, 99, 132)", // Nokta rengi
        hoverBackgroundColor: "rgba(255, 99, 132, 0.6)", // Hover efekti
      },
    ],
  };

  // Seçilen grafik türüne göre bileşeni belirle
  const renderChart = () => {
    switch (selectedGrafic) {
      case "bar":
        return <Bar data={graficdata} options={options} />;
      case "pie":
        return <Pie data={graficdata} options={options} />;
      case "radar":
        return <Radar data={graficdata} options={options} />;
      case "doughnut":
        return <Doughnut data={graficdata} options={options} />;
      default:
        return <Line data={graficdata} options={options} />;
    }
  };

  return (
    <div className="h-screen overflow-y-auto bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-white/40 backdrop-blur-sm"></div>
        <img
          className="w-full h-full object-cover opacity-20"
          src="bg-anaekran.jpg"
          alt="background"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full p-2 sm:p-4">
        <div className="flex flex-col lg:flex-row gap-4 h-full">
          {/* Stats Panel */}
          <div className="w-full order-1 lg:order-3 lg:w-1/4 bg-slate-800/80 backdrop-blur-sm rounded-xl">
            <div className="h-[320px] lg:h-[calc(100vh-2rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent p-2 sm:p-4">
              {/* Add heading with same styling */}
              <div className="mb-2 pb-1 border-b border-white/20">
                <h2 className="text-xl font-bold text-center text-white">
                  📈 Değerler
                </h2>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-1">
                {[
                  { label: "Öğrenci Sayısı", value: numberOfStudents },
                  { label: "Madde Sayısı", value: numberOfQuestions },
                  { label: "Ortalama Puan", value: average.toFixed(2) },
                  {
                    label: "Standart Sapma",
                    value: standardDeviation.toFixed(2),
                  },
                  { label: "Varyans", value: variance.toFixed(2) },
                  { label: "Ortanca (Median)", value: median },
                  { label: "Maksimum Puan", value: maxScore },
                  { label: "Ranj (Range)", value: range },
                  { label: "KR-20", value: kr20.toFixed(2) },
                  { label: "KR-21", value: kr21.toFixed(2) },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="bg-white/10 p-1 sm:p-1 rounded-lg hover:bg-white/20 transition-colors"
                  >
                    <div className="text-xs sm:text-sm text-gray-300">
                      {item.label}
                    </div>
                    <div className="text-base sm:text-lg font-semibold text-white">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Downloads Panel */}
          <div className="w-full order-2 lg:order-1 lg:w-1/4 bg-slate-800/80 backdrop-blur-sm rounded-xl">
            <div className="h-[560px] lg:h-[calc(100vh-2rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent p-2 sm:p-3">
              <div className="mb-2 pb-1 border-b border-white/20">
                <h2 className="text-xl font-bold text-center text-white">
                  📊 Raporlar
                </h2>
              </div>
              <div className="space-y-2">
                {[
                  {
                    component: (
                      <StudentAnalysis
                        studentNames={studentNames!}
                        scores={scores}
                        numberOfQuestions={numberOfQuestions!}
                        tScore={tScores}
                        zScore={zScores}
                        succesRates={ranks}
                      />
                    ),
                  },
                  {
                    component: (
                      <QuestionAnalysis
                        correctCount={correctCount}
                        percentageMap={percentageMapPerQuestion}
                        itemVariance={variancePerItem}
                        itemStd={stdDevPerItem}
                        itemDifficulty={difficultyIndex}
                        itemRbis={rbisIndex}
                        itemPrbis={prbisIndex}
                        item27={discriminationIndex}
                        itemReliability={reliabilityIndex}
                      />
                    ),
                  },
                  {
                    component: (
                      <TestAnalysis
                        studentCount={numberOfStudents!}
                        questionCount={numberOfQuestions!}
                        scores={scores}
                        points={poitns}
                        mean={average}
                        median={median}
                        mode={mode}
                        range={range}
                        stdDeviation={standardDeviation}
                        variance={variance}
                        kr20={kr20}
                        kr21={kr21}
                        skewness={skewness}
                        kurtosis={kurtosis}
                        coefficientVariation={relativeCoefficientOfVariation}
                      />
                    ),
                  },
                  {
                    component: (
                      <OptionAnalysis
                        data={optionCounts}
                        scores={scores}
                        studentAnswers={studentAnswers}
                      />
                    ),
                  },
                  {
                    component: (
                      <StudentAnswers
                        studentNames={studentNames!}
                        studentAnswers={studentAnswers!}
                        answerKey={answerKey!}
                        scores={scores}
                      />
                    ),
                  },
                  {
                    component: (
                      <StudentAnswers01
                        studentNames={studentNames!}
                        studentAnswers01={studentAnswer01}
                        answerKey={answerKey!}
                        scores={scores}
                      />
                    ),
                  },
                  {
                    component: (
                      <TestResults
                        studentNames={studentNames!}
                        scores={scores}
                        maxScore={maxScore}
                        minScore={minScore}
                        average={average}
                        standardDeviation={standardDeviation}
                        frequencyTable={frekansTable}
                        median={median}
                        mode={mode}
                        kr20={kr20}
                        successRate={successRate}
                        varyans={variance}
                        kurtosis={kurtosis}
                        skewness={skewness}
                        correctCount={correctCount}
                      />
                    ),
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="bg-white/10 rounded-lg p-3 hover:bg-white/20 transition-colors"
                  >
                    {item.component}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Charts Panel */}
          <div className="w-full order-3 lg:order-2 lg:w-1/2 bg-slate-800/80 backdrop-blur-sm rounded-xl p-2 sm:p-4 flex flex-col">
            <div className="flex flex-col gap-2 mb-4">
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="w-full sm:w-1/2">
                  <ComboboxForData
                    value={selectedGraficsData}
                    setValue={setSelectedGraficsData}
                  />
                </div>
                <div className="w-full sm:w-1/2">
                  <ComboboxForGrafic
                    value={selectedGrafic}
                    setValue={setSelectedGrafic}
                  />
                </div>
              </div>
            </div>
            <div className="flex-1 min-h-[600px] lg:h-[calc(100vh-10rem)] bg-slate-900/50 rounded-lg p-2 sm:p-4">
              {renderChart()}
            </div>
          </div>
        </div>
      </div>

      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={true}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
};

export default ExcelReports;
