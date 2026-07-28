"use client";

import { useState } from "react";
import type { ExamAnalysis } from "@/features/analysis";
import { columnPath, fmt, niceTicks } from "./svg-utils";

/**
 * Puan dağılımı histogramı.
 *
 * Tek seri olduğu için tek hue kullanılıyor ve efsane (legend) yok — kılavuz:
 * tek seride başlık zaten neyin çizildiğini söylüyor, tek gözlü efsane kutusu
 * başlığı tekrar eder ve yer kaplar.
 *
 * Ortalama ve ortanca hairline olarak işaretli; her sütuna sayı yazılmıyor
 * (kılavuz: "her noktaya sayı yazma"), değerler hover ve alttaki tabloda.
 */
const W = 720;
const H = 260;
const PAD = { top: 16, right: 16, bottom: 44, left: 40 };

export function ScoreHistogram({ analysis }: { analysis: ExamAnalysis }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const { frequency, descriptive } = analysis;

  if (frequency.length === 0) return null;

  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const maxCount = Math.max(...frequency.map((f) => f.count));
  // Öğrenci sayısı ekseni: tam sayı adım zorunlu ("0.5 öğrenci" olmaz).
  const ticks = niceTicks(maxCount, 4, true);
  const yMax = ticks[ticks.length - 1];

  const slot = plotW / frequency.length;
  // Sütun kalınlığı 24px'te sınırlı; kalan yer boşluk olarak bırakılıyor.
  // 2px yüzey boşluğu bitişik sütunları birbirinden ayırıyor (kenarlık değil).
  const barW = Math.max(2, Math.min(24, slot - 2));

  const xOf = (index: number) => PAD.left + slot * index + (slot - barW) / 2;
  const yOf = (count: number) => PAD.top + plotH - (count / yMax) * plotH;

  const scoreMin = frequency[0].score;
  const scoreMax = frequency[frequency.length - 1].score;
  const span = Math.max(1, scoreMax - scoreMin);
  const markerX = (score: number) =>
    PAD.left + ((score - scoreMin) / span) * (plotW - slot) + slot / 2;

  return (
    <figure className="m-0">
      <figcaption className="mb-1 text-sm font-medium text-[var(--viz-text)]">
        Puan dağılımı
      </figcaption>
      <p className="mb-3 text-xs text-[var(--viz-text-secondary)]">
        Kaç öğrencinin hangi puanı aldığı. Dikey çizgiler ortalama ve ortancayı
        gösterir.
      </p>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        role="img"
        aria-label="Öğrenci puanlarının frekans dağılımı"
      >
        {/* Izgara — hairline, düz çizgi, yüzeyden bir ton uzak */}
        {ticks.map((tick) => (
          <g key={tick}>
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={yOf(tick)}
              y2={yOf(tick)}
              stroke="var(--viz-grid)"
              strokeWidth={1}
            />
            <text
              x={PAD.left - 8}
              y={yOf(tick) + 4}
              textAnchor="end"
              className="fill-[var(--viz-text-muted)]"
              style={{ fontSize: 11, fontVariantNumeric: "tabular-nums" }}
            >
              {tick}
            </text>
          </g>
        ))}

        {/* Sütunlar */}
        {frequency.map((entry, index) => {
          const barH = plotH - (yOf(entry.count) - PAD.top);
          return (
            <g key={entry.score}>
              <path
                d={columnPath(xOf(index), yOf(entry.count), barW, barH)}
                fill="var(--viz-series)"
                opacity={hovered === null || hovered === index ? 1 : 0.45}
              />
              {/* Hit alanı sütundan geniş: ince sütuna nişan almak zorunda kalınmıyor */}
              <rect
                x={PAD.left + slot * index}
                y={PAD.top}
                width={slot}
                height={plotH}
                fill="transparent"
                onMouseEnter={() => setHovered(index)}
                onMouseLeave={() => setHovered(null)}
              />
              <text
                x={xOf(index) + barW / 2}
                y={H - PAD.bottom + 16}
                textAnchor="middle"
                className="fill-[var(--viz-text-muted)]"
                style={{ fontSize: 11, fontVariantNumeric: "tabular-nums" }}
              >
                {entry.score}
              </text>
            </g>
          );
        })}

        {/* Ortalama / ortanca işaretleri */}
        {[
          { value: descriptive.mean, label: "Ort." },
          { value: descriptive.median, label: "Ortanca" },
        ].map(
          (marker, index) =>
            marker.value !== null &&
            Number.isFinite(marker.value) && (
              <g key={marker.label}>
                <line
                  x1={markerX(marker.value)}
                  x2={markerX(marker.value)}
                  y1={PAD.top}
                  y2={PAD.top + plotH}
                  stroke="var(--viz-accent)"
                  strokeWidth={2}
                />
                <text
                  x={markerX(marker.value)}
                  y={PAD.top + 12 + index * 14}
                  textAnchor="middle"
                  className="fill-[var(--viz-text-secondary)]"
                  style={{ fontSize: 11 }}
                >
                  {marker.label} {fmt(marker.value, 1)}
                </text>
              </g>
            )
        )}

        {/* Taban çizgisi */}
        <line
          x1={PAD.left}
          x2={W - PAD.right}
          y1={PAD.top + plotH}
          y2={PAD.top + plotH}
          stroke="var(--viz-axis)"
          strokeWidth={1}
        />

        <text
          x={PAD.left + plotW / 2}
          y={H - 6}
          textAnchor="middle"
          className="fill-[var(--viz-text-muted)]"
          style={{ fontSize: 11 }}
        >
          Doğru sayısı
        </text>
      </svg>

      {hovered !== null && (
        <p className="mt-2 text-sm text-[var(--viz-text-secondary)]">
          <span className="font-medium text-[var(--viz-text)]">
            {frequency[hovered].score} doğru
          </span>
          {" — "}
          {frequency[hovered].count} öğrenci (%{fmt(frequency[hovered].percentage, 1)})
        </p>
      )}
    </figure>
  );
}
