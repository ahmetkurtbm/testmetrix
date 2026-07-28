import { describe, expect, it } from "vitest";
import { kurtosis, skewness, successRate } from "../descriptive";
import { upperLowerGroups } from "../groups";
import { correlationsOf, difficultyOf, reliabilityIndexOf } from "../item-analysis";
import { normalOrdinateAt, probit } from "../normal";
import { kr20, kr21 } from "../reliability";
import { ranksOf } from "../scoring";

/**
 * Bu dosya, eski koddaki somut hataların her birini kilitler.
 * Her testin başlığı düzeltilen davranışı anlatır.
 */

describe("sıralama — eşit puanlar", () => {
  it("eşit puan alanlar eşit sıra alır", () => {
    // Eski `calculateRanks` sıralı diziye null yazarak ilerliyordu; indexOf her
    // seferinde baştan aradığı için eşit puanlarda sıralar kayıyordu.
    expect(ranksOf([10, 8, 8, 5])).toEqual([1, 2, 2, 4]);
  });

  it("tüm puanlar eşitse herkes birinci olur", () => {
    expect(ranksOf([7, 7, 7])).toEqual([1, 1, 1]);
  });

  it("giriş sırasını korur, puana göre yeniden dizmez", () => {
    expect(ranksOf([5, 9, 7])).toEqual([3, 1, 2]);
  });
});

describe("biserial korelasyon — p = 0 ve p = 1", () => {
  const scores = [3, 2, 1];

  it("herkesin doğru yaptığı maddede NaN yerine null döner", () => {
    // Eski kodda pToO["1.00"] tanımsızdı → bis = NaN.
    const binary = [[1], [1], [1]];
    const { rbis, prbis } = correlationsOf(binary, scores, difficultyOf(binary));
    expect(rbis[0]).toBeNull();
    expect(prbis[0]).toBeNull();
  });

  it("kimsenin doğru yapamadığı maddede null döner", () => {
    const binary = [[0], [0], [0]];
    const { rbis, prbis } = correlationsOf(binary, scores, difficultyOf(binary));
    expect(rbis[0]).toBeNull();
    expect(prbis[0]).toBeNull();
  });

  it("tüm puanlar eşitse (σ = 0) korelasyon tanımsızdır", () => {
    const binary = [[1], [0]];
    const { rbis, prbis } = correlationsOf(binary, [2, 2], difficultyOf(binary));
    expect(rbis[0]).toBeNull();
    expect(prbis[0]).toBeNull();
  });
});

describe("normal eğri ordinatı", () => {
  it("matematiksel olarak doğru ordinatı üretir", () => {
    // φ(0) = 1/√(2π)
    expect(normalOrdinateAt(0.5)).toBeCloseTo(1 / Math.sqrt(2 * Math.PI), 12);

    // Bilinen kuantillerden ordinatı türetip karşılaştır — elle yazılmış
    // ondalık sabite güvenmek yerine tanımın kendisini doğruluyoruz.
    const phi = (z: number) => Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI);
    expect(normalOrdinateAt(0.25)).toBeCloseTo(phi(-0.6744897501960817), 8);
    expect(normalOrdinateAt(0.1)).toBeCloseTo(phi(-1.2815515655446004), 8);
    expect(normalOrdinateAt(0.05)).toBeCloseTo(phi(-1.6448536269514722), 8);
  });

  it("eski lookup tablosunun yuvarlama hatasını düzeltir", () => {
    // Eski pToO tablosu 3 ondalığa yuvarlanmıştı ve bazı satırları kaymıştı:
    // p = 0.10 için 0.176 yazıyordu, doğrusu 0.17550. p = 0.25 için 0.319
    // yazıyordu, doğrusu 0.31778. Yeni değerler tabloya ~0.001 içinde yakın
    // ama yuvarlama kaybı yok.
    expect(normalOrdinateAt(0.1)).toBeCloseTo(0.176, 2);
    expect(normalOrdinateAt(0.25)).toBeCloseTo(0.319, 2);
    expect(normalOrdinateAt(0.75)).toBeCloseTo(0.319, 2);
    expect(normalOrdinateAt(0.9)).toBeCloseTo(0.176, 2);
  });

  it("p ve 1−p için aynı ordinatı verir (simetri)", () => {
    expect(normalOrdinateAt(0.3)).toBeCloseTo(normalOrdinateAt(0.7)!, 12);
  });

  it("tablonun kapsamadığı uçlarda null döner", () => {
    expect(normalOrdinateAt(0)).toBeNull();
    expect(normalOrdinateAt(1)).toBeNull();
  });

  it("probit simetriktir", () => {
    expect(probit(0.5)).toBeCloseTo(0, 10);
    expect(probit(0.975)).toBeCloseTo(1.959964, 5);
    expect(probit(0.025)).toBeCloseTo(-1.959964, 5);
  });
});

describe("KR-20 / KR-21 korumaları", () => {
  it("tek maddelik testte null döner (eskiden Infinity)", () => {
    expect(kr20([0.5], 1)).toBeNull();
    expect(kr21(0.5, 1, 1)).toBeNull();
  });

  it("tüm puanlar eşitken null döner (eskiden NaN → 0 gösteriliyordu)", () => {
    expect(kr20([0.5, 0.5], 0)).toBeNull();
    expect(kr21(1, 0, 2)).toBeNull();
  });
});

describe("madde güvenirlik indeksi", () => {
  it("varyansın kopyası değil, r_pbis × s_madde değeridir", () => {
    // Eski formül sqrt(varyans) × itemStdDev idi; itemStdDev zaten sqrt(varyans)
    // olduğu için sonuç varyansa eşitleniyordu, yani sütun varyansı tekrarlıyordu.
    const prbis = [0.4, 0.6];
    const itemStdDev = [0.5, 0.5];
    expect(reliabilityIndexOf(prbis, itemStdDev)).toEqual([0.2, 0.3]);
  });

  it("korelasyonu tanımsız maddede null kalır", () => {
    expect(reliabilityIndexOf([null], [0])).toEqual([null]);
  });
});

describe("toplam başarı yüzdesi", () => {
  it("paydada madde sayısını kullanır, alınmış en yüksek puanı değil", () => {
    // 10 soruluk testte iki öğrenci de 2 doğru yapmış.
    // Eski formül: toplam(4) / (max(2) × n(2)) = %100 — gerçekte %20.
    expect(successRate([2, 2], 10)).toBe(20);
  });

  it("tam başarıda %100 döner", () => {
    expect(successRate([10, 10], 10)).toBe(100);
  });

  it("madde sayısı bilinmiyorsa null döner", () => {
    expect(successRate([1, 2], 0)).toBeNull();
  });
});

describe("çarpıklık ve basıklık korumaları", () => {
  it("n < 3 için null döner", () => {
    expect(skewness([1, 2])).toBeNull();
    expect(kurtosis([1, 2])).toBeNull();
  });

  it("tüm değerler eşitken null döner (eskiden NaN)", () => {
    expect(skewness([4, 4, 4])).toBeNull();
    expect(kurtosis([4, 4, 4])).toBeNull();
  });

  it("sayı döndürür, string değil", () => {
    // Eski kod toFixed(2) ile string dönüyordu ama tipi number deklare edilmişti.
    expect(typeof skewness([1, 2, 9])).toBe("number");
    expect(typeof kurtosis([1, 2, 9])).toBe("number");
  });
});

describe("üst/alt %27 grupları", () => {
  it("iki bölüm de aynı grup büyüklüğünü kullanır", () => {
    // Eskiden ayırt edicilik ceil(n×0.27), seçenek analizi round(n×0.27)
    // kullanıyordu; n = 15'te biri 5 diğeri 4 kişiyle çalışıyordu.
    const groups = upperLowerGroups(Array.from({ length: 15 }, (_, i) => i));
    expect(groups?.groupSize).toBe(4);
    expect(groups?.upper).toHaveLength(4);
    expect(groups?.lower).toHaveLength(4);
  });

  it("gruplar örtüşmez", () => {
    const groups = upperLowerGroups([5, 4, 3]);
    const overlap = groups!.upper.filter((i) => groups!.lower.includes(i));
    expect(overlap).toEqual([]);
  });

  it("en yüksek ve en düşük puanlıları doğru seçer", () => {
    const groups = upperLowerGroups([1, 9, 5, 2]);
    expect(groups?.upper).toEqual([1]); // 9 puanlı
    expect(groups?.lower).toEqual([0]); // 1 puanlı
  });

  it("tek öğrencide grup oluşturulamaz", () => {
    expect(upperLowerGroups([5])).toBeNull();
  });
});
