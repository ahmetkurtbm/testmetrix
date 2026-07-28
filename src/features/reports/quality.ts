import type { ExamAnalysis } from "@/features/analysis";

/**
 * Madde kalitesi sınıflandırması.
 *
 * Saf ve tek yerde: eşikler bileşenlere dağılmasın diye. Klasik test kuramında
 * yaygın kabul gören sınırlar kullanılıyor.
 *
 * Sınıflandırma ekranda RENKLE kodlanmıyor — kırmızı/yeşil durum çifti
 * deuteranopide ayırt edilemediği için kalite; konum (madde haritasındaki yeri),
 * etiket ve ikonla veriliyor.
 */

export type ItemFlag = "ok" | "tooEasy" | "tooHard" | "weakDiscrimination" | "negative";

export interface ItemQuality {
  questionNo: number;
  difficulty: number;
  discrimination: number;
  flag: ItemFlag;
  /** Kısa etiket — rozet ve harita etiketi için. */
  label: string;
  /** Tek satır açıklama; psikometri terimi bilmeyen için. */
  explanation: string;
  /** Sorunlu maddeler haritada vurgulanır. */
  needsAttention: boolean;
}

export const THRESHOLDS = {
  /** Bu değerin altındaki güçlük "çok zor". */
  hardBelow: 0.2,
  /** Bu değerin üstündeki güçlük "çok kolay". */
  easyAbove: 0.9,
  /** Bu değerin altındaki ayırt edicilik zayıf. */
  weakDiscriminationBelow: 0.2,
} as const;

export function classifyItem(
  questionNo: number,
  difficulty: number,
  discrimination: number
): ItemQuality {
  const base = { questionNo, difficulty, discrimination };

  // Negatif ayırt edicilik en ciddi durum: testi iyi yapanlar bu maddeyi daha
  // ÇOK yanlış yapmış. Genellikle cevap anahtarı hatasına işaret eder.
  if (discrimination < 0) {
    return {
      ...base,
      flag: "negative",
      label: "Ters çalışıyor",
      explanation:
        "Testte başarılı olanlar bu maddeyi daha çok yanlış yapmış — cevap anahtarını kontrol edin.",
      needsAttention: true,
    };
  }

  if (difficulty > THRESHOLDS.easyAbove) {
    return {
      ...base,
      flag: "tooEasy",
      label: "Çok kolay",
      explanation:
        "Neredeyse herkes doğru yaptı; öğrenciler arasında ayrım yaratmıyor.",
      needsAttention: true,
    };
  }

  if (difficulty < THRESHOLDS.hardBelow) {
    return {
      ...base,
      flag: "tooHard",
      label: "Çok zor",
      explanation:
        "Neredeyse kimse doğru yapamadı; konu işlenmemiş ya da madde anlaşılmıyor olabilir.",
      needsAttention: true,
    };
  }

  if (discrimination < THRESHOLDS.weakDiscriminationBelow) {
    return {
      ...base,
      flag: "weakDiscrimination",
      label: "Ayırt etmiyor",
      explanation:
        "Başarılı ve başarısız öğrenciler bu maddede benzer sonuç verdi; çeldiricileri gözden geçirin.",
      needsAttention: true,
    };
  }

  return {
    ...base,
    flag: "ok",
    label: "İyi",
    explanation: "Güçlük ve ayırt edicilik beklenen aralıkta.",
    needsAttention: false,
  };
}

export function classifyItems(analysis: ExamAnalysis): ItemQuality[] {
  return analysis.items.difficulty.map((difficulty, index) =>
    classifyItem(index + 1, difficulty, analysis.items.discrimination[index])
  );
}

/**
 * KR-20 yorumu.
 *
 * Hesaplanamayan durumlar (tek madde, sıfır varyans) `null` gelir ve burada
 * açıkça belirtilir — eskiden 0 olarak gösteriliyor, "güvenirlik sıfır" gibi
 * okunuyordu.
 */
export function interpretReliability(kr20: number | null): {
  label: string;
  detail: string;
} {
  if (kr20 === null || !Number.isFinite(kr20)) {
    return {
      label: "Hesaplanamadı",
      detail:
        "Güvenirlik için en az iki madde ve puanlarda değişkenlik gerekir. Tüm öğrenciler aynı puanı almışsa hesaplanamaz.",
    };
  }
  if (kr20 >= 0.8) {
    return { label: "Yüksek güvenirlik", detail: "Test tutarlı ölçüm yapıyor." };
  }
  if (kr20 >= 0.6) {
    return {
      label: "Kabul edilebilir",
      detail: "Sınıf içi değerlendirme için yeterli sayılır.",
    };
  }
  if (kr20 >= 0.4) {
    return {
      label: "Düşük",
      detail: "Maddeler arasında tutarlılık zayıf; sorunlu maddeleri gözden geçirin.",
    };
  }
  return {
    label: "Çok düşük",
    detail: "Test tutarlı ölçüm yapmıyor; madde analizini dikkatle inceleyin.",
  };
}
