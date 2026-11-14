"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ExamAnalysis } from "@/features/analysis";
import { fmt } from "@/lib/format";
import { CHART } from "./chart-theme";

/**
 * Puan dağılımı.
 *
 * Sütunlar gradyan dolgulu ve kalın — düz tek renk yerine üstten koyu,
 * tabana doğru açılan bir dolgu. Tek seri olduğu için efsane yok; başlık zaten
 * neyin çizildiğini söylüyor. Her sütuna sayı yazılmıyor, değerler tooltip'te.
 */
export function ScoreHistogram({ analysis }: { analysis: ExamAnalysis }) {
  const { frequency, descriptive } = analysis;
  if (frequency.length === 0) return null;

  // Hiç öğrencinin almadığı puanlar da eksende yer almalı; yoksa sütunlar eşit
  // aralıkla dizilir ve dağılımın şekli bozulur (5…13, 15, 19 gibi boşluklar kaybolur).
  const k = descriptive.questionCount;
  const byScore = new Map(frequency.map((row) => [row.score, row]));
  const data = Array.from({ length: k + 1 }, (_, score) => ({
    score,
    count: byScore.get(score)?.count ?? 0,
    percentage: byScore.get(score)?.percentage ?? 0,
  }));
  const step = k <= 12 ? 1 : k <= 30 ? 2 : 5;
  const ticks = Array.from({ length: Math.floor(k / step) + 1 }, (_, i) => i * step);

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900">Puan dağılımı</h3>
      <p className="mt-1 mb-4 text-sm text-gray-500">
        Kaç öğrencinin hangi puanı aldığı. Kesikli çizgi ortalamayı gösterir.
      </p>

      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 16, right: 8, bottom: 20, left: 0 }}>
          <defs>
            <linearGradient id="histogramFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART.series} stopOpacity={0.95} />
              <stop offset="100%" stopColor={CHART.series} stopOpacity={0.55} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={CHART.grid} vertical={false} />
          <XAxis
            type="number"
            dataKey="score"
            domain={[-0.5, k + 0.5]}
            ticks={ticks}
            tickFormatter={(value: number) => String(value)}
            tick={{ fontSize: 12, fill: CHART.muted }}
            tickLine={false}
            axisLine={{ stroke: CHART.axis }}
            label={{
              value: "Doğru sayısı",
              position: "insideBottom",
              offset: -12,
              style: { fontSize: 12, fill: CHART.muted },
            }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: CHART.muted }}
            tickLine={false}
            axisLine={false}
            // Öğrenci sayısı tam sayıdır; "0.5 öğrenci" gibi bir eksen değeri olmamalı.
            allowDecimals={false}
          />
          <Tooltip
            cursor={{ fill: "rgba(42,120,214,0.06)" }}
            contentStyle={CHART.tooltip}
            formatter={(value, _name, item) => [
              `${value} öğrenci (%${fmt((item.payload as { percentage: number }).percentage, 1)})`,
              "",
            ]}
            labelFormatter={(label) => `${label} doğru`}
          />
          {Number.isFinite(descriptive.mean) && descriptive.mean > 0 && (
            <ReferenceLine
              x={descriptive.mean}
              stroke={CHART.accent}
              strokeWidth={2}
              strokeDasharray="4 3"
              label={{
                value: `Ort. ${fmt(descriptive.mean, 1)}`,
                position: "top",
                style: { fontSize: 12, fontWeight: 600, fill: CHART.secondary },
              }}
            />
          )}
          <Bar
            dataKey="count"
            fill="url(#histogramFill)"
            radius={[6, 6, 0, 0]}
            maxBarSize={44}
            minPointSize={0}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
