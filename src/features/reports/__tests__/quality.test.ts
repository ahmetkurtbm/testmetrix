import { describe, expect, it } from "vitest";
import { classifyItem, interpretReliability } from "../quality";

describe("classifyItem", () => {
  it("beklenen aralıktaki maddeyi iyi sayar", () => {
    const item = classifyItem(1, 0.55, 0.45);
    expect(item.flag).toBe("ok");
    expect(item.needsAttention).toBe(false);
  });

  it("çok kolay maddeyi işaretler", () => {
    expect(classifyItem(1, 0.95, 0.3).flag).toBe("tooEasy");
  });

  it("çok zor maddeyi işaretler", () => {
    expect(classifyItem(1, 0.1, 0.3).flag).toBe("tooHard");
  });

  it("ayırt ediciliği zayıf maddeyi işaretler", () => {
    expect(classifyItem(1, 0.5, 0.1).flag).toBe("weakDiscrimination");
  });

  it("negatif ayırt edicilik diğer her şeyin önüne geçer", () => {
    // Hem çok kolay hem negatif ayırt edici bir madde: asıl sorun cevap
    // anahtarı olabileceği için o bildirilmeli.
    const item = classifyItem(1, 0.95, -0.3);
    expect(item.flag).toBe("negative");
    expect(item.explanation).toMatch(/cevap anahtar/i);
  });

  it("sınır değerler kolay/zor sayılmaz", () => {
    // Eşikler kesin: 0.9 ve 0.2 tam değerleri sorunlu değil.
    expect(classifyItem(1, 0.9, 0.4).flag).toBe("ok");
    expect(classifyItem(1, 0.2, 0.4).flag).toBe("ok");
    expect(classifyItem(1, 0.5, 0.2).flag).toBe("ok");
  });

  it("herkesin doğru yaptığı madde (p = 1) çok kolay sayılır", () => {
    expect(classifyItem(1, 1, 0).flag).toBe("tooEasy");
  });

  it("kimsenin doğru yapamadığı madde (p = 0) çok zor sayılır", () => {
    expect(classifyItem(1, 0, 0).flag).toBe("tooHard");
  });
});

describe("interpretReliability", () => {
  it("hesaplanamayan KR-20 için sebep açıklar", () => {
    // Eskiden bu durum 0 olarak gösteriliyor, "güvenirlik sıfır" gibi okunuyordu.
    const result = interpretReliability(null);
    expect(result.label).toBe("Hesaplanamadı");
    expect(result.detail).toMatch(/en az iki madde/i);
  });

  it("NaN'ı da hesaplanamadı sayar", () => {
    expect(interpretReliability(NaN).label).toBe("Hesaplanamadı");
  });

  it("değere göre seviye döndürür", () => {
    expect(interpretReliability(0.85).label).toBe("Yüksek güvenirlik");
    expect(interpretReliability(0.7).label).toBe("Kabul edilebilir");
    expect(interpretReliability(0.5).label).toBe("Düşük");
    expect(interpretReliability(0.1).label).toBe("Çok düşük");
  });

  it("negatif KR-20 çok düşük sayılır", () => {
    // KR-20 matematiksel olarak negatif çıkabilir.
    expect(interpretReliability(-0.4).label).toBe("Çok düşük");
  });
});
