"use client";

import { useState, useEffect } from "react";
// import Plot from "react-plotly.js";
// import { PlotType } from "plotly.js";

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
    (n / ((n - 1) * (n - 2))) *
    scores.reduce(
      (sum: any, score: any) =>
        sum + Math.pow((score - mean) / standardDeviation, 3),
      0
    );

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

// aoruların doğru cevaplanma yüzdesi
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

///RBIS DEĞERLERİ BURADAAA
// function calculateRpbIndexForAll(
//   studentAnswers: string[][],
//   answerKey: string[],
//   stdDevPerItem: any
// ): number[] {
//   const numQuestions = answerKey.length;
//   const itemRpb: number[] = [];

//   for (let i = 0; i < numQuestions; i++) {
//     const itemScores = studentAnswers.map((studentAnswer) =>
//       studentAnswer[i] === answerKey[i] ? 1 : 0
//     );

//     const totalScores = studentAnswers.map((answers) =>
//       answers.reduce(
//         (sum, answer, index) => sum + (answer === answerKey[index] ? 1 : 0),
//         0
//       )
//     );

//     const meanItem =
//       itemScores.reduce((sum, score) => sum + score, 0) / itemScores.length;
//     const meanTotal =
//       totalScores.reduce((sum, score) => sum + score, 0) / totalScores.length;

//     // Doğru ve yanlış yanıt sayılarını hesapla
//     const correctCount = itemScores.filter((score) => score === 1).length;
//     const incorrectCount = itemScores.length - correctCount;

//     // Kök içerisinde (doğru / yanlış) oranını hesapla
//     const ratio = correctCount / incorrectCount;
//     const sqrtRatio = Math.sqrt(ratio);

//     // RPB'yi hesapla ve kök içerisindeki oran ile çarp
//     const rpb =
//       parseFloat((covariance / Math.sqrt(varianceTotal)).toFixed(2)) *
//       sqrtRatio;
//     itemRpb.push(rpb);
//   }

//   return itemRpb;
// }

// function calculateRbIndexForAll(
//   studentAnswers: string[][],
//   answerKey: string[]
// ): number[] {
//   const numQuestions = answerKey.length;
//   const itemRb: number[] = [];

//   for (let i = 0; i < numQuestions; i++) {
//     const itemScores = studentAnswers.map((studentAnswer) =>
//       studentAnswer[i] === answerKey[i] ? 1 : 0
//     );

//     const totalScores = studentAnswers.map((answers) =>
//       answers.reduce(
//         (sum, answer, index) => sum + (answer === answerKey[index] ? 1 : 0),
//         0
//       )
//     );

//     const meanItem =
//       itemScores.reduce((sum, score) => sum + score, 0) / itemScores.length;
//     const meanTotal =
//       totalScores.reduce((sum, score) => sum + score, 0) / totalScores.length;

//     const covariance = itemScores.reduce(
//       (sum, score, index) =>
//         sum + (score - meanItem) * (totalScores[index] - meanTotal),
//       0
//     );

//     const questionVariance =
//       itemScores.reduce(
//         (sum, score) => sum + Math.pow(score - meanItem, 2),
//         0
//       ) / itemScores.length;

//     const totalVariance =
//       totalScores.reduce(
//         (sum, score) => sum + Math.pow(score - meanTotal, 2),
//         0
//       ) / totalScores.length;

//     // Doğru ve yanlış yanıt sayılarını hesapla
//     const correctCount = itemScores.filter((score) => score === 1).length;
//     const incorrectCount = itemScores.length - correctCount;

//     // Kök içerisinde (doğru / yanlış) oranını hesapla
//     const ratio = correctCount / incorrectCount;
//     const sqrtRatio = Math.sqrt(ratio);

//     // RB'yi hesapla ve kök içerisindeki oran ile çarp
//     const rb =
//       parseFloat(
//         (covariance / Math.sqrt(questionVariance * totalVariance)).toFixed(2)
//       ) * sqrtRatio;
//     itemRb.push(rb);
//   }

//   return itemRb;
// }

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

// Madde Güvenirlik İndeksi Hesaplama
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
  folder_name: string;
  file_name: string;
  created_at: string;
  file_data: string[][];
}

interface File {
  id: number;
  folder_name: string;
  file_name: string;
  created_at: string;
  file_data: string[][];
}

const ExcelReports = () => {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND;

  const [data, setData] = useState<ExcelUpdateProps | null>(null);

  const [answerKey, setAnswerKey] = useState<string[]>([]);
  const [studentAnswers, setStudentAnswers] = useState<string[][]>([[]]);
  const [studentNames, setStudentNames] = useState<string[]>([]);
  const [numberOfQuestions, setNumberOfQuestions] = useState<number>(0);
  const [numberOfStudents, setNumberOfStudents] = useState<number>(0);

  // States for various calculated metrics
  const [scores, setScores] = useState<number[]>([]);
  const [average, setAverage] = useState<number>(0);
  const [standardDeviation, setStandardDeviation] = useState<number>(0);
  const [variance, setVariance] = useState<number>(0);
  const [maxScore, setMaxScore] = useState<number>(0);
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
    "Öğrenci Puanlarının Frekansları"
  );
  // const [selectedGrafic, setSelectedGrafic] = useState<PlotType>("bar");
  const [xValues, setXValues] = useState<any>();
  const [yValues, setYValues] = useState<any>();

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
          });

          if (response.ok) {
            const fetchedData: File[] = await response.json();

            const file_name = fetchedData[0].file_name;
            const folder_name = fetchedData[0].folder_name;
            const created_at = fetchedData[0].created_at;
            const file_data = fetchedData[0].file_data;

            setData({ file_name, folder_name, created_at, file_data });
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

      setScores(calculatedScores);
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
    // const rbis = calculateRbIndexForAll(studentAnswers, answerKey);
    // const prbis = calculateRpbIndexForAll(studentAnswers, answerKey);
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
    // setRbisIndex(rbis.map((item) => Number(item) || 0)); // Converts string to number
    // setPrbisIndex(prbis.map((item) => Number(item) || 0)); // Converts string to number
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
        return scores;
      case "Öğrenci Puanlarının Frekansları":
        return frekansTable;
      case "Madde Başına Yüzde Haritası (Percentage Map Per Question)":
        return percentageMapPerQuestion;
      case "Başarı Oranları (Success Rates)":
        return successRates;
      case "Z Puanları (Z-Scores)":
        return zScores;
      case "T Puanları (T-Scores)":
        return tScores;
      case "Sıralamalar (Ranks)":
        return ranks;
      case "Madde Bazında Varyans (Item Variance)":
        return variancePerItem;
      case "Madde Bazında Standart Sapma (Item Standard Deviation)":
        return stdDevPerItem;
      case "Madde Zorluk İndeksi (Item Difficulty Index)":
        return difficultyIndex;
      case "Madde Toplam Korelasyon Katsayısı (RBis)":
        return rbisIndex;
      case "Çift Katsayılı Kolerasyon Değeri (pRBis)":
        return prbisIndex;
      case "Ayırt Edicilik İndeksi (Discrimination Index)":
        return discriminationIndex;
      case "reliabiGüvenirlik İndeksi (Reliability Index)lityIndex":
        return reliabilityIndex;
      default:
        return [];
    }
  };

  useEffect(() => {
    if (selectedGraficsData === "Öğrenci Puanlarının Frekansları") {
      const freqData = calculateFrekans(scores);
      setXValues(freqData.map(([score]) => score)); // 📌 Puanları X ekseni için al
      setYValues(freqData.map(([_, count]) => count)); // 📌 Frekansları Y ekseni için al
    } else {
      setXValues(
        Array.from({ length: getDataForPlot().length }, (_, i) => i + 1)
      );
      setYValues(getDataForPlot());
    }
  }, [scores, selectedGraficsData]);

  return (
    <div>
      <h2 className="text-3xl font-semibold text-center p-1 m-2 text-green-500">
        Veri Raporları
      </h2>
      <div className="p-1 flex gap-1 justify-center">
        {/* Sol Taraftaki Excelleri İndirme Alanı */}
        <div className="flex-col gap-1 p-1 bg-slate-500 rounded-md w-1/4">
          {/* Student Analysis */}
          <div className="m-3">
            <StudentAnalysis
              studentNames={studentNames!}
              scores={scores}
              numberOfQuestions={numberOfQuestions!}
              tScore={tScores}
              zScore={zScores}
              succesRates={ranks}
            />
          </div>

          {/* Question Analysis */}
          <div className="m-3">
            <QuestionAnalysis
              correctCount={correctCount}
              percentageMap={percentageMapPerQuestion}
              itemVariance={variancePerItem}
              itemStd={stdDevPerItem}
              itemDifficulty={difficultyIndex}
              // itemRbis={rbisIndex}
              // itemPrbis={prbisIndex}
              item27={discriminationIndex}
              itemReliability={reliabilityIndex}
            />
          </div>

          <div className="m-3">
            <TestAnalysis
              studentCount={numberOfStudents!}
              questionCount={numberOfQuestions!}
              scores={scores}
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
          </div>

          <div className="m-3">
            <OptionAnalysis data={optionCounts} />
          </div>

          <div className="m-3">
            <StudentAnswers
              studentNames={studentNames!}
              studentAnswers={studentAnswers!}
              answerKey={answerKey!}
              scores={scores}
            />
          </div>

          <div className="m-3">
            <StudentAnswers01
              studentNames={studentNames!}
              studentAnswers01={studentAnswer01}
              answerKey={answerKey!}
              scores={scores}
            />
          </div>
        </div>

        {/* Orta Taraftaki Grafikler Gösterme Alanı */}
        {/* <div className="flex-col gap-1 p-2 bg-black rounded-md w-1/2">
          <p className="text-white text-center p-2">Grafikler</p>
          <div className="flex gap-1">
            <ComboboxForData
              value={selectedGraficsData}
              setValue={setSelectedGraficsData}
            />
            <ComboboxForGrafic
              value={selectedGrafic}
              setValue={setSelectedGrafic}
            />
          </div>

          <div className="flex justify-center rounded-md mt-6">
            {xValues !== undefined &&
              yValues !== undefined &&
              selectedGrafic !== undefined &&
              selectedGraficsData !== undefined && (
                <Plot
                  data={[
                    {
                      labels: xValues,
                      values: yValues,
                      x: xValues,
                      y: yValues,
                      type: selectedGrafic,
                      mode: "lines+markers",
                      marker: { color: "blue" },
                    },
                  ]}
                  layout={{
                    title: selectedGraficsData,
                    xaxis: { title: "" },
                    yaxis: { title: "Değerler" },
                  }}
                />
              )}
          </div>
        </div> */}

        {/* Sağ Taraftaki Genel Verileri Gösterme Alanı */}
        <div className="flex flex-col gap-2 p-6 rounded-lg bg-gradient-to-r from-blue-400 to-indigo-500 shadow-xl w-1/4 overflow-auto">
          <p className="text-white text-lg font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
            <strong>Öğrenci Sayısı:</strong> {numberOfStudents}
          </p>
          <p className="text-white text-lg whitespace-nowrap overflow-hidden text-ellipsis">
            <strong>Madde Sayısı:</strong> {numberOfQuestions}
          </p>
          <p className="text-white text-lg whitespace-nowrap overflow-hidden text-ellipsis">
            <strong>Ortalama Puan:</strong> {average.toFixed(2)}
          </p>
          <p className="text-white text-lg whitespace-nowrap overflow-hidden text-ellipsis">
            <strong>Standart Sapma:</strong> {standardDeviation.toFixed(2)}
          </p>
          <p className="text-white text-lg whitespace-nowrap overflow-hidden text-ellipsis">
            <strong>Varyans:</strong> {variance.toFixed(2)}
          </p>
          <p className="text-white text-lg whitespace-nowrap overflow-hidden text-ellipsis">
            <strong>Ortanca (Median):</strong> {median}
          </p>
          <p className="text-white text-lg whitespace-nowrap overflow-hidden text-ellipsis">
            <strong>Mod:</strong> {mode.length > 0 ? mode.join(", ") : "----"}
          </p>
          <p className="text-white text-lg whitespace-nowrap overflow-hidden text-ellipsis">
            <strong>Maksimum Puan:</strong> {maxScore}
          </p>
          <p className="text-white text-lg whitespace-nowrap overflow-hidden text-ellipsis">
            <strong>Ranj (Range):</strong> {range}
          </p>
          <p className="text-white text-lg whitespace-nowrap overflow-hidden text-ellipsis">
            <strong>Çarpıklık Katsayısı (Skewness):</strong> {skewness}
          </p>
          <p className="text-white text-lg whitespace-nowrap overflow-hidden text-ellipsis">
            <strong>Basıklık Katsayısı (Kurtosis):</strong> {kurtosis}
          </p>
          <p className="text-white text-lg whitespace-nowrap overflow-hidden text-ellipsis">
            <strong>Puanların Başarı Yüzdesi:</strong> {successRate}%
          </p>
          <p className="text-white text-lg whitespace-nowrap overflow-hidden text-ellipsis">
            <strong>KR-20 Güvenirlik Katsayısı:</strong> {kr20}
          </p>
          <p className="text-white text-lg whitespace-nowrap overflow-hidden text-ellipsis">
            <strong>KR-21 Güvenirlik Katsayısı:</strong> {kr21}
          </p>
          <p className="text-white text-lg whitespace-nowrap overflow-hidden text-ellipsis">
            <strong>Bağıl Değişkenlik Katsayısı:</strong>{" "}
            {relativeCoefficientOfVariation}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExcelReports;
