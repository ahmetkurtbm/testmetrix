"use client";

import { RadialBar, RadialBarChart, PolarAngleAxis } from "recharts";
import { fmt } from "@/lib/format";
import { CHART } from "./chart-theme";
import { interpretReliability } from "./quality";

/**
 * KR-20 göstergesi.
 *
 * Düz bir sayı yerine dolgulu bir yarım halka: değer 0–1 arasında olduğu için
 * gösterge (gauge) doğal bir eşleşme. Hesaplanamayan durumda (null) halka boş
 * kalır ve "—" yazar; eskiden bu durum 0 olarak gösterilip "güvenirlik sıfır"
 * gibi okunuyordu.
 */
export function ReliabilityGauge({ kr20 }: { kr20: number | null }) {
  const info = interpretReliability(kr20);
  const value = kr20 === null || !Number.isFinite(kr20) ? 0 : Math.max(0, Math.min(1, kr20));

  const data = [{ value, fill: "url(#reliabilityFill)" }];

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-28 h-28 shrink-0">
        <RadialBarChart
          width={112}
          height={112}
          cx={56}
          cy={56}
          innerRadius={38}
          outerRadius={52}
          barSize={12}
          startAngle={90}
          endAngle={-270}
          data={data}
        >
          <defs>
            <linearGradient id="reliabilityFill" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={CHART.series} />
              <stop offset="100%" stopColor={CHART.accent} />
            </linearGradient>
          </defs>
          <PolarAngleAxis
            type="number"
            domain={[0, 1]}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            dataKey="value"
            cornerRadius={6}
            background={{ fill: "#eef1f5" }}
          />
        </RadialBarChart>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-gray-800">{fmt(kr20)}</span>
        </div>
      </div>

      <div>
        <div className="text-xs text-gray-500">KR-20 güvenirlik</div>
        <div className="mt-0.5 text-sm font-semibold text-gray-800">
          {info.label}
        </div>
        <p className="mt-1 text-xs text-gray-500 leading-relaxed max-w-[220px]">
          {info.detail}
        </p>
      </div>
    </div>
  );
}
