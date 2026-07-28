import { describe, expect, it } from "vitest";
import { normalizeAnswer, parseExamMatrix } from "../parse";
import { REFERENCE_MATRIX } from "./fixtures";

describe("normalizeAnswer", () => {
  it("geçerli seçenekleri olduğu gibi bırakır", () => {
    expect(normalizeAnswer("A")).toBe("A");
    expect(normalizeAnswer("E")).toBe("E");
  });

  it("büyük/küçük harf ve boşluk farkını yok sayar", () => {
    // Eski kod puanlamada normalize etmiyordu: hücrede "a " varsa "A" ile
    // eşleşmiyor, öğrenci doğru yanıtı yanlış sayılıyordu.
    expect(normalizeAnswer("a")).toBe("A");
    expect(normalizeAnswer(" A ")).toBe("A");
    expect(normalizeAnswer("b\n")).toBe("B");
  });

  it("sayısal hücrelerde çökmez", () => {
    // Eski `calculateOptionsCount` sayısal hücrede `.trim is not a function` ile
    // TypeError fırlatıyordu.
    expect(() => normalizeAnswer(1)).not.toThrow();
    expect(normalizeAnswer(1)).toBe("BOS");
    expect(normalizeAnswer(0)).toBe("BOS");
  });

  it("boş ve tanımsız değerleri BOS yapar", () => {
    expect(normalizeAnswer("")).toBe("BOS");
    expect(normalizeAnswer("   ")).toBe("BOS");
    expect(normalizeAnswer(null)).toBe("BOS");
    expect(normalizeAnswer(undefined)).toBe("BOS");
    expect(normalizeAnswer("-")).toBe("BOS");
    expect(normalizeAnswer("boş")).toBe("BOS");
  });

  it("tanınmayan işaretleri BOS sayar", () => {
    expect(normalizeAnswer("F")).toBe("BOS");
    expect(normalizeAnswer("??")).toBe("BOS");
  });
});

describe("parseExamMatrix", () => {
  it("anahtarı, isimleri ve yanıtları ayırır", () => {
    const { answerKey, studentNames, responses } = parseExamMatrix(REFERENCE_MATRIX);
    expect(answerKey).toEqual(["A", "B", "C", "D", "E"]);
    expect(studentNames).toEqual(["Ayşe", "Berk", "Ceren", "Deniz"]);
    expect(responses).toHaveLength(4);
    expect(responses[0]).toEqual(["A", "B", "C", "D", "E"]);
  });

  it("her satırı anahtar uzunluğuna tamamlar", () => {
    // Excel son sütunları boşsa kısa satır üretir; indeks erişimleri patlamamalı.
    const { responses } = parseExamMatrix([
      ["anahtar", "A", "B", "C"],
      ["Kısa satır", "A"],
    ]);
    expect(responses[0]).toEqual(["A", "BOS", "BOS"]);
  });

  it("anahtardan uzun satırları kırpar", () => {
    const { responses } = parseExamMatrix([
      ["anahtar", "A", "B"],
      ["Uzun satır", "A", "B", "C", "D"],
    ]);
    expect(responses[0]).toEqual(["A", "B"]);
  });

  it("isimsiz artık satırları atlar", () => {
    const { studentNames } = parseExamMatrix([
      ["anahtar", "A"],
      ["Ayşe", "A"],
      ["", ""],
      [null, null],
    ]);
    expect(studentNames).toEqual(["Ayşe"]);
  });

  it("eksik veya bozuk girdide boş sonuç döner", () => {
    expect(parseExamMatrix([])).toEqual({
      answerKey: [],
      studentNames: [],
      responses: [],
    });
    expect(parseExamMatrix([["sadece anahtar"]]).responses).toEqual([]);
  });
});
