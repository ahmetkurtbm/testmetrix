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

  const data = frequency.map((row) => ({
    score: row.score,
    count: row.count,
    percentage: row.percentage,
  }));

  return (
    <div>
      <h2 className="text-base font-semibold text-gray-800">Puan dağılımı</h2>
      <p className="mt-0.5 mb-3 text-xs text-gray-500">
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
            dataKey="score"
            tick={{ fontSize: 11, fill: CHART.muted }}
            tickLine={false}
            axisLine={{ stroke: CHART.axis }}
            label={{
              value: "Doğru sayısı",
              position: "insideBottom",
              offset: -12,
              style: { fontSize: 11, fill: CHART.muted },
            }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: CHART.muted }}
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
              x={Math.round(descriptive.mean)}
              stroke={CHART.accent}
              strokeWidth={2}
              strokeDasharray="4 3"
              label={{
                value: `Ort. ${fmt(descriptive.mean, 1)}`,
                position: "top",
                style: { fontSize: 11, fontWeight: 600, fill: CHART.secondary },
              }}
            />
          )}
          <Bar
            dataKey="count"
            fill="url(#histogramFill)"
            radius={[6, 6, 0, 0]}
            maxBarSize={44}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
