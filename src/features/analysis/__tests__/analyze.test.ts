import { describe, expect, it } from "vitest";
import { analyzeExam } from "../index";
import { parseExamMatrix } from "../parse";
import { EXPECTED, referenceExam } from "./fixtures";

describe("analyzeExam — referans sınav", () => {
  const result = analyzeExam(referenceExam);

  it("puanları doğru hesaplar", () => {
    expect(result.students.scores).toEqual(EXPECTED.scores);
    expect(result.students.points).toEqual([100, 80, 60, 20]);
    expect(result.students.successRates).toEqual([1, 0.8, 0.6, 0.2]);
    expect(result.students.ranks).toEqual([1, 2, 3, 4]);
  });

  it("betimsel istatistikleri doğru hesaplar", () => {
    const { descriptive } = result;
    expect(descriptive.studentCount).toBe(4);
    expect(descriptive.questionCount).toBe(5);
    expect(descriptive.mean).toBe(EXPECTED.mean);
    expect(descriptive.variance).toBe(EXPECTED.variance);
    expect(descriptive.median).toBe(3.5);
    expect(descriptive.min).toBe(1);
    expect(descriptive.max).toBe(5);
    expect(descriptive.range).toBe(4);
    expect(descriptive.successRate).toBe(EXPECTED.successRate);
  });

  it("madde güçlüklerinin toplamı ortalamaya eşittir", () => {
    // Psikometrik özdeşlik: Σp = ortalama doğru sayısı. Tutmuyorsa puanlama
    // ile madde analizi birbirinden kopmuş demektir.
    expect(result.items.difficulty).toEqual(EXPECTED.difficulty);
    const sum = result.items.difficulty.reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(result.descriptive.mean, 10);
  });

  it("KR-20 ve KR-21 değerlerini doğru hesaplar", () => {
    expect(result.reliability.kr20).toBeCloseTo(EXPECTED.kr20, 12);
    expect(result.reliability.kr21).toBeCloseTo(EXPECTED.kr21, 12);
  });

  it("madde varyansı p(1−p)'ye eşittir", () => {
    expect(result.items.variance).toEqual([0, 0.1875, 0.1875, 0.25, 0.1875]);
    result.items.stdDeviation.forEach((sd, j) => {
      expect(sd).toBeCloseTo(Math.sqrt(result.items.variance[j]), 12);
    });
  });

  it("herkesin doğru yaptığı 1. maddede korelasyonlar tanımsızdır", () => {
    expect(result.items.difficulty[0]).toBe(1);
    expect(result.items.rbis[0]).toBeNull();
    expect(result.items.prbis[0]).toBeNull();
    expect(result.items.reliabilityIndex[0]).toBeNull();
  });

  it("ayırt edici maddelerde korelasyon pozitiftir", () => {
    // 2–5. maddeleri üst gruptakiler doğru, alt gruptakiler yanlış yapmış.
    for (let j = 1; j < 5; j++) {
      expect(result.items.prbis[j]).toBeGreaterThan(0);
      expect(result.items.rbis[j]).toBeGreaterThan(0);
    }
    expect(result.items.prbis[4]).toBeCloseTo(0.6831, 4);
  });

  it("seçenek dağılımını çıkarır", () => {
    const q1 = result.options[0];
    expect(q1.questionNo).toBe(1);
    expect(q1.counts.A).toBe(4);
    expect(q1.counts.B).toBe(0);
    expect(q1.total).toBe(4);
    expect(q1.percentages.A).toBe(100);

    const q5 = result.options[4];
    expect(q5.counts.E).toBe(1);
    expect(q5.counts.A).toBe(3);
  });

  it("frekans tablosunu puana göre artan üretir", () => {
    expect(result.frequency).toEqual([
      { score: 1, count: 1, percentage: 25 },
      { score: 3, count: 1, percentage: 25 },
      { score: 4, count: 1, percentage: 25 },
      { score: 5, count: 1, percentage: 25 },
    ]);
  });
});

describe("analyzeExam — sınır durumlar", () => {
  it("boş sınavda çökmez", () => {
    const result = analyzeExam(parseExamMatrix([]));
    expect(result.students.scores).toEqual([]);
    expect(result.items.difficulty).toEqual([]);
    expect(result.reliability.kr20).toBeNull();
    expect(result.descriptive.successRate).toBeNull();
  });

  it("tek öğrenci ve tek maddede tanımsızları null döndürür", () => {
    const result = analyzeExam(
      parseExamMatrix([
        ["anahtar", "A"],
        ["Tek Öğrenci", "A"],
      ])
    );
    expect(result.students.scores).toEqual([1]);
    expect(result.descriptive.successRate).toBe(100);
    expect(result.reliability.kr20).toBeNull();
    expect(result.reliability.kr21).toBeNull();
    expect(result.items.rbis[0]).toBeNull();
    expect(result.descriptive.skewness).toBeNull();
  });

  it("tüm öğrenciler aynı puanı aldığında tanımsızları null döndürür", () => {
    const result = analyzeExam(
      parseExamMatrix([
        ["anahtar", "A", "B"],
        ["Bir", "A", "X"],
        ["İki", "A", "X"],
        ["Üç", "A", "X"],
      ])
    );
    expect(result.students.scores).toEqual([1, 1, 1]);
    expect(result.descriptive.variance).toBe(0);
    expect(result.reliability.kr20).toBeNull();
    expect(result.students.zScores).toEqual([null, null, null]);
    expect(result.students.ranks).toEqual([1, 1, 1]);
    expect(result.descriptive.coefficientVariation).not.toBeNull();
  });

  it("hiç kimse doğru yapamadığında sıfır puan döner", () => {
    const result = analyzeExam(
      parseExamMatrix([
        ["anahtar", "A", "B"],
        ["Bir", "C", "C"],
        ["İki", "D", "D"],
      ])
    );
    expect(result.students.scores).toEqual([0, 0]);
    expect(result.items.difficulty).toEqual([0, 0]);
    expect(result.descriptive.successRate).toBe(0);
    expect(result.items.rbis).toEqual([null, null]);
  });

  it("boş bırakılan yanıtları yanlış sayar ama BOS olarak raporlar", () => {
    const result = analyzeExam(
      parseExamMatrix([
        ["anahtar", "A", "B"],
        ["Bir", "A", ""],
        ["İki", "A", "B"],
      ])
    );
    expect(result.students.scores).toEqual([1, 2]);
    expect(result.options[1].counts.BOS).toBe(1);
    expect(result.options[1].counts.B).toBe(1);
  });
});
