"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { fmt } from "@/lib/format";

/**
 * Tanıtım sayfasının "madde madde" yürüyüşü.
 *
 * Örnek sınavın gerçek analizinden gelen noktalar sağda sabit bir madde
 * haritasında durur; sol taraftaki adımlar kaydırıldıkça haritada ilgili
 * maddeler öne çıkar. Kalite renkle değil konum + etiketle anlatılır; vurgu
 * rengi rapor ekranıyla aynı mavi/turuncu çifti.
 */

export type WalkPoint = {
  questionNo: number;
  difficulty: number;
  discrimination: number;
  needsAttention: boolean;
};

export type WalkStep = {
  id: string;
  title: string;
  body: ReactNode;
  /** Haritada öne çıkacak maddeler; boşsa tüm noktalar eşit görünür. */
  highlight: number[];
  /** Adımın altında gösterilen kanıt (ör. seçenek dağılımı). */
  evidence?: ReactNode;
};

const W = 420;
const H = 300;
const PAD = { left: 40, right: 16, top: 16, bottom: 36 };

function ItemMapFigure({ points, highlight, yMin }: { points: WalkPoint[]; highlight: number[]; yMin: number }) {
  const x = (v: number) => PAD.left + v * (W - PAD.left - PAD.right);
  const y = (v: number) => PAD.top + ((1 - v) / (1 - yMin)) * (H - PAD.top - PAD.bottom);
  const focus = new Set(highlight);
  const dimmed = highlight.length > 0;

  // Aynı noktaya düşen vurgulu maddeler tek etiket paylaşır. Çok sayıda madde
  // vurgulandığında etiketler birbirine biner; o adımda başlık zaten listeyi verir.
  const labels = new Map<string, { x: number; y: number; text: string[] }>();
  for (const p of points) {
    if (!focus.has(p.questionNo) || highlight.length > 3) continue;
    const key = `${p.difficulty.toFixed(3)}|${p.discrimination.toFixed(3)}`;
    const entry = labels.get(key) ?? { x: x(p.difficulty), y: y(p.discrimination), text: [] };
    entry.text.push(`M${p.questionNo}`);
    labels.set(key, entry);
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Örnek sınavın madde haritası">
      {/* Sorunlu bölgeler: çok zor, çok kolay, ayırt etmiyor */}
      <rect x={x(0)} y={y(1)} width={x(0.2) - x(0)} height={y(yMin) - y(1)} fill="var(--viz-grid)" opacity={0.45} />
      <rect x={x(0.9)} y={y(1)} width={x(1) - x(0.9)} height={y(yMin) - y(1)} fill="var(--viz-grid)" opacity={0.45} />
      <rect x={x(0.2)} y={y(0.2)} width={x(0.9) - x(0.2)} height={y(yMin) - y(0.2)} fill="var(--viz-grid)" opacity={0.45} />
      <text x={x(0.1)} y={y(1) + 14} textAnchor="middle" fontSize={11} fill="var(--viz-text-muted)">
        çok zor
      </text>
      <text x={x(0.95)} y={y(1) + 14} textAnchor="middle" fontSize={11} fill="var(--viz-text-muted)">
        çok kolay
      </text>
      <text x={x(0.55)} y={y(yMin) - 8} textAnchor="middle" fontSize={11} fill="var(--viz-text-muted)">
        ayırt etmiyor
      </text>

      {/* Eksenler */}
      <line x1={x(0)} x2={x(1)} y1={y(yMin)} y2={y(yMin)} stroke="var(--viz-axis)" />
      {[0, 0.5, 1].map((t) => (
        <text key={t} x={x(t)} y={H - 16} textAnchor="middle" fontSize={11} fill="var(--viz-text-muted)">
          {fmt(t, t === 0.5 ? 1 : 0)}
        </text>
      ))}
      <text x={x(0.5)} y={H - 2} textAnchor="middle" fontSize={11} fill="var(--viz-text-secondary)">
        Güçlük (doğru yanıt oranı)
      </text>
      {[0, 0.5, 1].map((t) => (
        <text key={t} x={PAD.left - 8} y={y(t) + 4} textAnchor="end" fontSize={11} fill="var(--viz-text-muted)">
          {fmt(t, t === 0.5 ? 1 : 0)}
        </text>
      ))}
      <text
        x={12}
        y={y((1 + yMin) / 2)}
        textAnchor="middle"
        fontSize={11}
        fill="var(--viz-text-secondary)"
        transform={`rotate(-90 12 ${y((1 + yMin) / 2)})`}
      >
        Ayırt edicilik
      </text>

      {points.map((p) => {
        const on = focus.has(p.questionNo);
        return (
          <circle
            key={p.questionNo}
            cx={x(p.difficulty)}
            cy={y(p.discrimination)}
            r={on ? 9 : 6}
            fill={p.needsAttention ? "var(--viz-accent)" : "var(--viz-series)"}
            stroke="var(--viz-surface)"
            strokeWidth={2}
            opacity={dimmed && !on ? 0.22 : 1}
            className="walk-point"
          />
        );
      })}
      {[...labels.values()].map((label) => {
        const anchorEnd = label.x > W * 0.7;
        return (
          <text
            key={label.text.join()}
            x={label.x + (anchorEnd ? -14 : 14)}
            y={label.y + 4}
            textAnchor={anchorEnd ? "end" : "start"}
            fontSize={13}
            fontWeight={600}
            fill="var(--viz-text)"
          >
            {label.text.join(", ")}
          </text>
        );
      })}
    </svg>
  );
}

export function ItemWalk({
  points,
  steps,
  intro,
}: {
  points: WalkPoint[];
  steps: WalkStep[];
  /** İlk ekran içeriği (başlık ve eylemler); yürüyüşün sıfırıncı adımı. */
  intro: ReactNode;
}) {
  const [active, setActive] = useState(-1);
  const refs = useRef<(HTMLElement | null)[]>([]);
  const yMin = Math.min(-0.2, ...points.map((p) => p.discrimination));

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.index));
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    refs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const current = active >= 0 ? steps[active] : null;

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-16">
      <div className="min-w-0">
        <div data-index={-1} ref={(el) => void (refs.current[0] = el)} className="lg:pb-24">
          {intro}
        </div>

        <ol className="mt-16 space-y-6 lg:mt-0 lg:space-y-0">
          {steps.map((step, index) => (
            <li
              key={step.id}
              data-index={index}
              ref={(el) => void (refs.current[index + 1] = el)}
              className="flex min-w-0 flex-col justify-center lg:min-h-[46vh] lg:py-12"
            >
              <p className="font-display text-sm font-semibold tabular-nums text-blue-600">
                {index + 1} / {steps.length}
              </p>
              <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl [text-wrap:balance]">
                {step.title}
              </h3>
              <div className="mt-3 max-w-[58ch] text-base leading-relaxed text-gray-600 sm:text-lg [text-wrap:pretty]">
                {step.body}
              </div>
              {/* Dar ekranda harita her adımın içinde; geniş ekranda sağda sabit. */}
              <div className="mt-5 max-w-md rounded-xl border border-gray-200 bg-surface p-3 lg:hidden">
                <ItemMapFigure points={points} highlight={step.highlight} yMin={yMin} />
              </div>
              {step.evidence ? <div className="mt-4">{step.evidence}</div> : null}
            </li>
          ))}
        </ol>
      </div>

      <div className="hidden lg:block">
        <div className="sticky top-[max(6rem,calc(50vh-15rem))]">
          <div className="rounded-2xl border border-gray-200 bg-surface p-5 shadow-[0_16px_40px_-24px_rgba(15,27,61,0.35)]">
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-display text-sm font-semibold text-gray-900">Örnek sınav · madde haritası</p>
              <p className="text-xs tabular-nums text-gray-500">{points.length} madde</p>
            </div>
            <div className="mt-3">
              <ItemMapFigure points={points} highlight={current?.highlight ?? []} yMin={yMin} />
            </div>
            <p className="mt-2 min-h-10 text-sm text-gray-600" aria-live="polite">
              {current
                ? current.title
                : "Her nokta bir soru. Ortada ve yukarıda kalanlar işini yapıyor; kenardakiler gözden geçirilmeli."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
