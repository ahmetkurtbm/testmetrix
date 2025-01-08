import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface ExcelReportsProps {
  data: string[][];
}

type OptionData = {
  madde: string;
  A: number;
  B: number;
  C: number;
  D: number;
  E: number;
  Boş: number;
};

import QuestionAnalysis from "../../(functions)/OptionAnalysis";
import StudentAnswers01 from "../../(functions)/StudentAnswers01";
import StudentAnswers from "../../(functions)/StudentAnswers";
import StudentAnalysis from "../../(functions)/StudentAnalysis";
import TestAnalysis from "../../(functions)/TestAnalysis";
import OptionAnalysis from "../../(functions)/OptionAnalysis";
import Header from "@/app/(components)/header";

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
    return []; // Eğer skorlar boşsa, boş dizi döndür
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
  return scores.map((score: any) => (score - average) / standardDeviation);
}

// T-skoru (her öğrenci için)
function calculateTScores(zScores: any) {
  return zScores.map((z: any) => 50 + 10 * z);
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

// Her soru için madde varyansını hesaplar
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

// Madde Ayırt Edicilik İndeksi (RBIS) Hesaplama
function calculateRbisIndexForAll(studentAnswers: any, answerKey: any) {
  const studentScores = calculateStudentAnswers01(studentAnswers, answerKey);

  const itemRbis = [];

  const numQuestions = answerKey.length;

  for (let i = 0; i < numQuestions; i++) {
    const itemScores = studentScores.map(
      (studentAnswer: any) => studentAnswer[i]
    );

    const meanItem =
      itemScores.reduce((sum: any, score: any) => sum + score, 0) /
      itemScores.length;

    const totalScores = studentScores.map((answers: any) =>
      answers.reduce((sum: any, score: any) => sum + score, 0)
    );

    const meanTotal =
      totalScores.reduce((sum: any, score: any) => sum + score, 0) /
      totalScores.length;

    const covariance =
      itemScores.reduce(
        (sum: any, score: any, index: any) =>
          sum + (score - meanItem) * (totalScores[index] - meanTotal),
        0
      ) / itemScores.length;

    const varianceTotal =
      totalScores.reduce(
        (sum: any, score: any) => sum + Math.pow(score - meanTotal, 2),
        0
      ) / totalScores.length;

    const rbis = (covariance / Math.sqrt(varianceTotal)).toFixed(2);

    itemRbis.push(rbis);
  }

  return itemRbis;
}

// Madde Ayırt Edicilik İndeksi (PRBIS) Hesaplama Düzeltilecek
function calculatePrbisIndexForAll(studentAnswers: any, answerKey: any) {
  const studentScores = calculateStudentAnswers01(studentAnswers, answerKey); // Öğrencilerin 0-1 formatındaki cevapları
  const totalScores = studentAnswers.map((answers: any) =>
    answers.reduce(
      (sum: any, answer: any, index: any) =>
        sum + (answer === answerKey[index] ? 1 : 0),
      0
    )
  );

  const prbisIndices = [];
  const numQuestions = answerKey.length;

  // Her bir soru için PRBIS hesaplıyoruz
  for (let i = 0; i < numQuestions; i++) {
    // Her bir soruya ait yanıtları alıyoruz
    const itemScores = studentScores.map(
      (studentAnswer: any) => studentAnswer[i]
    );

    // Soru puanlarının ortalamasını hesaplıyoruz
    const questionMean =
      itemScores.reduce((sum: any, score: any) => sum + score, 0) /
      itemScores.length;

    // Toplam puanların ortalamasını hesaplıyoruz
    const totalMean =
      totalScores.reduce((sum: any, score: any) => sum + score, 0) /
      totalScores.length;

    // Kovaryans hesaplaması
    const covariance = itemScores.reduce(
      (sum: any, score: any, studentIndex: any) =>
        sum + (score - questionMean) * (totalScores[studentIndex] - totalMean),
      0
    );

    // Soru varyansı
    const questionVariance =
      itemScores.reduce(
        (sum: any, score: any) => sum + Math.pow(score - questionMean, 2),
        0
      ) / itemScores.length;

    // Toplam varyans
    const totalVariance =
      totalScores.reduce(
        (sum: any, score: any) => sum + Math.pow(score - totalMean, 2),
        0
      ) / totalScores.length;

    // PRBIS Hesaplaması
    const prbis = (
      covariance / Math.sqrt(questionVariance * totalVariance)
    ).toFixed(2);

    prbisIndices.push(prbis); // Sonuçları diziye ekliyoruz
  }

  return prbisIndices; // Her soru için PRBIS değerlerini döndürüyoruz
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
    const counts: any = { A: 0, B: 0, C: 0, D: 0, E: 0, Boş: 0 };

    // Tüm katılımcıların yanıtlarını işle
    studentAnswers.forEach((response: any) => {
      const answer = response[i]?.trim().toUpperCase() || "Boş"; // Yanıtları normalize et
      if (counts.hasOwnProperty(answer)) {
        counts[answer]++;
      } else {
        counts["Boş"]++;
      }
    });

    // Sonucu OptionData formatında ekle
    result.push({
      madde: `Madde${i}`,
      A: counts.A,
      B: counts.B,
      C: counts.C,
      D: counts.D,
      E: counts.E,
      Boş: counts.Boş,
    });
  }

  return result; // OptionData[] türünde bir dizi döndür
}

interface ExcelReportsProps {
  data: string[][]; // Assuming data is an array of string arrays
}

const ExcelReports: React.FC<ExcelReportsProps> = ({ data }) => {
  const answerKey = data[0].slice(1); // Answer key excluding first column
  const studentAnswers = data.slice(1); // All students' answers excluding first row
  const studentNames = data.slice(1).map((row) => row[0]); // Extract student names from first column
  const numberOfQuestions = answerKey.length;
  const numberOfStudents = studentAnswers.length;

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

  // First effect to calculate the scores
  useEffect(() => {
    const calculatedScores = calculateScores(answerKey, studentAnswers);
    setScores(calculatedScores);
  }, []);

  // Second effect to calculate other metrics based on scores
  useEffect(() => {
    if (scores.length === 0) return;

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
    const kr20Value = calculateKR20(
      varianceValue,
      numberOfQuestions,
      percentageMapPerQuestion
    );
    const kr21Value = calculateKR21(avg, varianceValue, numberOfQuestions);
    const relCoefVariation = calculateRelativeCoefficientOfVariation(
      stdDev,
      avg
    );
    const percMap = calculatePercentageMapPerQuestion(
      answerKey,
      studentAnswers
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
    const rbis = calculateRbisIndexForAll(studentAnswers, answerKey);
    const prbis = calculatePrbisIndexForAll(studentAnswers, answerKey);
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

    // Set state values
    setAverage(avg);
    setVariance(varianceValue);
    setStandardDeviation(stdDev);
    setMode(mode);
    setMaxScore(max);
    setRange(rangeValue);
    setMedian(median);
    setSkewness(typeof skew === "number" ? skew : 0);
    setKurtosis(typeof kurt === "number" ? kurt : 0);
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

    setReliabilityIndex(reliability);
    setOptionCounts(optionCount);
    setCorrectCount(correctCount);
  }, [scores, answerKey, studentAnswers, numberOfQuestions]);

  return (
    <div className="p-6">
      <Header />

      <h2 className="text-3xl font-semibold mb-4">Excel Raporları</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Student Analysis */}
        <div className="mt-6">
          <StudentAnalysis
            studentNames={studentNames}
            scores={scores}
            numberOfQuestions={numberOfQuestions}
            tScore={tScores}
            zScore={zScores}
            succesRates={ranks}
          />
        </div>

        {/* Question Analysis */}
        <div className="mt-6">
          <h1>Question Analizi</h1>
          {/* <QuestionAnalysis
            correctCount={correctCount}
            percentageMap={percentageMapPerQuestion}
            itemVariance={variancePerItem}
            itemStd={stdDevPerItem}
            itemDifficulty={difficultyIndex}
            itemRbis={rbisIndex}
            itemPrbis={prbisIndex}
            itemDiscrimination={discriminationIndex}
            itemReliability={reliabilityIndex}
          /> */}
        </div>
      </div>

      <div className="mt-6">
        <TestAnalysis
          studentCount={numberOfStudents}
          questionCount={numberOfQuestions}
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

      <div className="mt-6">
        <OptionAnalysis data={optionCounts} />
      </div>

      <div className="mt-6">
        <StudentAnswers
          studentNames={studentNames}
          studentAnswers={studentAnswers}
          answerKey={answerKey}
          scores={scores}
        />
      </div>

      <div className="mt-6">
        <StudentAnswers01
          studentNames={studentNames}
          studentAnswers01={studentAnswer01}
          answerKey={answerKey}
          scores={scores}
        />
      </div>

      <div className="mt-6">
        <p>
          <strong>Öğrenci Sayısı:</strong> {numberOfStudents}
        </p>
        <p>
          <strong>Soru Sayısı:</strong> {numberOfQuestions}
        </p>
        <p>
          <strong>Ortalama Puan:</strong> {average.toFixed(2)}
        </p>
        <p>
          <strong>Standart Sapma:</strong> {standardDeviation.toFixed(2)}
        </p>
        <p>
          <strong>Varyans:</strong> {variance.toFixed(2)}
        </p>
        <p>
          <strong>Ortanca (Median):</strong> {median}
        </p>
        <p>
          <strong>Mod:</strong> {mode}
        </p>
        <p>
          <strong>Maksimum Puan:</strong> {maxScore}
        </p>
        <p>
          <strong>Ranj (Range):</strong> {range}
        </p>
        <p>
          <strong>Çarpıklık Katsayısı (Skewness):</strong> {skewness}
        </p>
        <p>
          <strong>Basıklık Katsayısı (Kurtosis):</strong> {kurtosis}
        </p>
        <p>
          <strong>Test Puanlarının Başarı Yüzdesi:</strong> {successRate}%
        </p>
        <p>
          <strong>KR-20 Güvenirlik Katsayısı:</strong> {kr20}
        </p>
        <p>
          <strong>KR-21 Güvenirlik Katsayısı:</strong> {kr21}
        </p>
        <p>
          <strong>Bağıl Değişkenlik Katsayısı:</strong>{" "}
          {relativeCoefficientOfVariation}
        </p>
      </div>
    </div>
  );
};

export default ExcelReports;
