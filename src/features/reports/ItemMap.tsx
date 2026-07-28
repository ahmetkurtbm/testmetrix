"use client";

import { useMemo, useState } from "react";
import { fmt } from "./svg-utils";
import { THRESHOLDS, type ItemQuality } from "./quality";

/**
 * Madde haritası — güçlük (x) ve ayırt edicilik (y).
 *
 * Ekranın en değerli görünümü: "hangi soruyu değiştirmeliyim" sorusunu tek
 * bakışta yanıtlıyor. Sağ üstteki maddeler iyi; kenarlara savrulanlar sorunlu.
 *
 * Kalite RENKLE kodlanmıyor. Kırmızı/yeşil durum çifti deuteranopide ΔE 4.1 ile
 * ayırt edilemiyor (doğrulayıcı çıktısı), yani kullanıcıların bir bölümü için
 * anlamsız olurdu. Bunun yerine **vurgu deseni**: sorunlu maddeler aksan renginde
 * ve DOĞRUDAN ETİKETLİ, geri kalanı geri planda. Böylece kimlik renge değil,
 * konum + etiket ikilisine bağlı.
 */
const W = 720;
const H = 380;
const PAD = { top: 20, right: 24, bottom: 48, left: 52 };

export function ItemMap({
  items,
  selected,
  onSelect,
}: {
  items: ItemQuality[];
  selected: number | null;
  onSelect: (questionNo: number | null) => void;
}) {
  const [hovered, setHovered] = useState<number | null>(null);

  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const yDomain = useMemo(() => {
    const values = items.map((i) => i.discrimination);
    return {
      min: Math.min(-0.2, ...values),
      max: Math.max(1, ...values),
    };
  }, [items]);

  const xOf = (difficulty: number) => PAD.left + difficulty * plotW;
  const yOf = (discrimination: number) =>
    PAD.top +
    plotH -
    ((discrimination - yDomain.min) / (yDomain.max - yDomain.min)) * plotH;

  /**
   * Etiketlenecek maddeler.
   *
   * Her sorunlu maddeyi etiketlemek 50+ maddelik sınavlarda etiketleri üst üste
   * bindiriyor. Basit bir çakışma kontrolü: yerleştirilmiş bir etikete çok yakın
   * olan atlanır — değeri zaten hover'da ve tabloda var, yani hiçbir şey
   * yalnızca etikete bağlı değil.
   */
  const labelled = useMemo(() => {
    const placed: { x: number; y: number }[] = [];
    const result = new Set<number>();

    for (const item of items.filter((i) => i.needsAttention)) {
      const x = xOf(item.difficulty);
      const y = yOf(item.discrimination);
      const collides = placed.some(
        (p) => Math.abs(p.x - x) < 34 && Math.abs(p.y - y) < 16
      );
      if (!collides) {
        placed.push({ x, y });
        result.add(item.questionNo);
      }
    }
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, yDomain]);

  const active = hovered ?? selected;
  const activeItem = items.find((i) => i.questionNo === active) ?? null;
  const attentionCount = items.filter((i) => i.needsAttention).length;

  return (
    <figure className="m-0">
      <figcaption className="mb-1 text-sm font-medium text-[var(--viz-text)]">
        Madde haritası
      </figcaption>
      <p className="mb-3 text-xs text-[var(--viz-text-secondary)]">
        Sağ üst bölge ideal: orta güçlükte ve iyi ayırt eden maddeler. Bir maddeye
        tıklayarak seçenek dağılımını görebilirsiniz.
      </p>

      {/* İki görsel sınıf var → efsane zorunlu; renk tek başına kimlik taşımıyor */}
      <div className="mb-2 flex flex-wrap items-center gap-4 text-xs text-[var(--viz-text-secondary)]">
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full"
            style={{ background: "var(--viz-series)" }}
          />
          Beklenen aralıkta ({items.length - attentionCount})
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full"
            style={{ background: "var(--viz-accent)" }}
          />
          Gözden geçirin ({attentionCount})
        </span>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        role="img"
        aria-label="Maddelerin güçlük ve ayırt edicilik dağılımı"
      >
        {/* Eşik çizgileri — hairline, düz */}
        {[THRESHOLDS.hardBelow, THRESHOLDS.easyAbove].map((threshold) => (
          <line
            key={threshold}
            x1={xOf(threshold)}
            x2={xOf(threshold)}
            y1={PAD.top}
            y2={PAD.top + plotH}
            stroke="var(--viz-grid)"
            strokeWidth={1}
          />
        ))}
        <line
          x1={PAD.left}
          x2={W - PAD.right}
          y1={yOf(THRESHOLDS.weakDiscriminationBelow)}
          y2={yOf(THRESHOLDS.weakDiscriminationBelow)}
          stroke="var(--viz-grid)"
          strokeWidth={1}
        />
        {/* Sıfır çizgisi: altı negatif ayırt edicilik */}
        {yDomain.min < 0 && (
          <line
            x1={PAD.left}
            x2={W - PAD.right}
            y1={yOf(0)}
            y2={yOf(0)}
            stroke="var(--viz-axis)"
            strokeWidth={1}
          />
        )}

        {/* Eksenler */}
        {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
          <text
            key={tick}
            x={xOf(tick)}
            y={H - PAD.bottom + 18}
            textAnchor="middle"
            className="fill-[var(--viz-text-muted)]"
            style={{ fontSize: 11, fontVariantNumeric: "tabular-nums" }}
          >
            {tick.toFixed(2)}
          </text>
        ))}
        {[yDomain.min, 0.2, 0.5, yDomain.max].map((tick) => (
          <text
            key={tick}
            x={PAD.left - 10}
            y={yOf(tick) + 4}
            textAnchor="end"
            className="fill-[var(--viz-text-muted)]"
            style={{ fontSize: 11, fontVariantNumeric: "tabular-nums" }}
          >
            {tick.toFixed(2)}
          </text>
        ))}

        <text
          x={PAD.left + plotW / 2}
          y={H - 8}
          textAnchor="middle"
          className="fill-[var(--viz-text-muted)]"
          style={{ fontSize: 11 }}
        >
          Güçlük (doğru yanıtlama oranı) →
        </text>
        <text
          x={14}
          y={PAD.top + plotH / 2}
          textAnchor="middle"
          transform={`rotate(-90 14 ${PAD.top + plotH / 2})`}
          className="fill-[var(--viz-text-muted)]"
          style={{ fontSize: 11 }}
        >
          Ayırt edicilik →
        </text>

        {/* Noktalar. Sorunlular üstte çizilsin diye sona bırakılıyor. */}
        {[...items]
          .sort((a, b) => Number(a.needsAttention) - Number(b.needsAttention))
          .map((item) => {
            const x = xOf(item.difficulty);
            const y = yOf(item.discrimination);
            const isActive = active === item.questionNo;
            const color = item.needsAttention
              ? "var(--viz-accent)"
              : "var(--viz-series)";

            return (
              <g key={item.questionNo}>
                {/* 2px yüzey halkası: üst üste binen noktalar ayrık okunuyor */}
                <circle
                  cx={x}
                  cy={y}
                  r={isActive ? 8 : 6}
                  fill={color}
                  stroke="var(--viz-surface-raised)"
                  strokeWidth={2}
                  opacity={active === null || isActive ? 1 : 0.5}
                />
                {/* Hit alanı noktadan büyük (~24px): ince nişan gerekmiyor */}
                <circle
                  cx={x}
                  cy={y}
                  r={13}
                  fill="transparent"
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() => setHovered(item.questionNo)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() =>
                    onSelect(selected === item.questionNo ? null : item.questionNo)
                  }
                />
                {labelled.has(item.questionNo) && (
                  <text
                    x={x + 11}
                    y={y + 4}
                    className="fill-[var(--viz-text-secondary)]"
                    style={{ fontSize: 11 }}
                  >
                    M{item.questionNo}
                  </text>
                )}
              </g>
            );
          })}
      </svg>

      {activeItem ? (
        <div className="mt-2 rounded-md bg-[var(--viz-surface)] border border-black/5 dark:border-white/10 p-3">
          <p className="text-sm font-medium text-[var(--viz-text)]">
            Madde {activeItem.questionNo} — {activeItem.label}
          </p>
          <p className="mt-0.5 text-xs text-[var(--viz-text-secondary)]">
            {activeItem.explanation}
          </p>
          <p className="mt-1 text-xs text-[var(--viz-text-muted)]">
            Güçlük {fmt(activeItem.difficulty)} · Ayırt edicilik{" "}
            {fmt(activeItem.discrimination)}
          </p>
        </div>
      ) : (
        <p className="mt-2 text-xs text-[var(--viz-text-muted)]">
          Ayrıntı için bir maddenin üzerine gelin.
        </p>
      )}
    </figure>
  );
}
