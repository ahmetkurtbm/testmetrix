"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fmt } from "@/lib/format";
import { CHART } from "./chart-theme";
import { THRESHOLDS, type ItemQuality } from "./quality";

/**
 * Madde güçlüğü — sınav boyunca akış.
 *
 * Madde haritası (saçılım) tek tek maddeleri karşılaştırmak için var; bu grafik
 * sınavın baştan sona nasıl bir zorluk eğrisi izlediğini gösteriyor — gradyan
 * dolgulu alan grafiği, "düz" bir görünüm yerine dolgun bir okuma sağlıyor.
 * Çok kolay / çok zor bölgeler arka planda hafif gölgeyle işaretli.
 */
export function ItemDifficultyArea({ items }: { items: ItemQuality[] }) {
  if (items.length === 0) return null;

  const data = items.map((item) => ({
    questionNo: item.questionNo,
    label: `M${item.questionNo}`,
    difficulty: item.difficulty,
    needsAttention: item.needsAttention,
  }));

  return (
    <div>
      <h2 className="text-base font-semibold text-gray-800">
        Madde güçlüğü akışı
      </h2>
      <p className="mt-0.5 mb-3 text-xs text-gray-500">
        Sınav boyunca madde güçlüğünün seyri. Gölgeli bantlar çok kolay ve çok
        zor eşiklerini gösterir.
      </p>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: 0 }}>
          <defs>
            <linearGradient id="difficultyFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART.series} stopOpacity={0.5} />
              <stop offset="100%" stopColor={CHART.series} stopOpacity={0.04} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={CHART.grid} vertical={false} />

          {/* Çok kolay / çok zor bantları */}
          <ReferenceArea
            y1={THRESHOLDS.easyAbove}
            y2={1}
            fill={CHART.accentSoft}
            fillOpacity={0.5}
          />
          <ReferenceArea
            y1={0}
            y2={THRESHOLDS.hardBelow}
            fill={CHART.accentSoft}
            fillOpacity={0.5}
          />

          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: CHART.muted }}
            tickLine={false}
            axisLine={{ stroke: CHART.axis }}
            interval={data.length > 20 ? Math.ceil(data.length / 20) - 1 : 0}
          />
          <YAxis
            domain={[0, 1]}
            ticks={[0, 0.25, 0.5, 0.75, 1]}
            tick={{ fontSize: 11, fill: CHART.muted }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={CHART.tooltip}
            formatter={(value) => [fmt(value as number), "Güçlük (p)"]}
            labelFormatter={(label) => `Madde ${label}`}
          />
          <Area
            type="monotone"
            dataKey="difficulty"
            stroke={CHART.series}
            strokeWidth={2.5}
            fill="url(#difficultyFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
