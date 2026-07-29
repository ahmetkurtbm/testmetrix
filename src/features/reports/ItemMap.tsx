"use client";

import { useMemo } from "react";
import {
  CartesianGrid,
  Cell,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { fmt } from "@/lib/format";
import { CHART } from "./chart-theme";
import { THRESHOLDS, type ItemQuality } from "./quality";

/**
 * Madde haritası — güçlük (x) ve ayırt edicilik (y).
 *
 * Ekranın en değerli görünümü: "hangi soruyu değiştirmeliyim" sorusunu tek
 * bakışta yanıtlıyor. Ortada ve yukarıda kalan maddeler iyi; kenarlara
 * savrulanlar sorunlu.
 *
 * Kalite renkle değil, KONUM + ETİKET ile veriliyor. Kırmızı/yeşil durum çifti
 * deuteranopide ayırt edilemediği için kullanılmadı; dikkat isteyen maddeler
 * turuncu ve ayrıca "M7" gibi doğrudan etiketli.
 */
export function ItemMap({
  items,
  selected,
  onSelect,
}: {
  items: ItemQuality[];
  selected: number | null;
  onSelect: (questionNo: number | null) => void;
}) {
  const data = useMemo(
    () =>
      items.map((item) => ({
        x: item.difficulty,
        y: item.discrimination,
        questionNo: item.questionNo,
        label: item.label,
        explanation: item.explanation,
        needsAttention: item.needsAttention,
        // Etiket yalnızca sorunlu maddelerde; her noktaya yazı koymak
        // 50 maddelik sınavda okunmaz hale geliyor.
        tag: item.needsAttention ? `M${item.questionNo}` : "",
      })),
    [items]
  );

  const attention = items.filter((i) => i.needsAttention).length;
  const yMin = Math.min(-0.2, ...items.map((i) => i.discrimination));

  return (
    <div>
      <h2 className="text-base font-semibold text-gray-800">Madde haritası</h2>
      <p className="mt-0.5 mb-2 text-xs text-gray-500">
        Yukarıda ve ortada kalan maddeler iyi. Bir noktaya tıklayarak seçenek
        dağılımını görebilirsiniz.
      </p>

      {/* İki görsel sınıf var → efsane şart; renk tek başına kimlik taşımıyor */}
      <div className="mb-2 flex flex-wrap items-center gap-4 text-xs text-gray-600">
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full"
            style={{ background: CHART.series }}
          />
          Beklenen aralıkta ({items.length - attention})
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full"
            style={{ background: CHART.accent }}
          />
          Gözden geçirin ({attention})
        </span>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart margin={{ top: 10, right: 16, bottom: 22, left: 0 }}>
          <CartesianGrid stroke={CHART.grid} />
          <XAxis
            type="number"
            dataKey="x"
            domain={[0, 1]}
            ticks={[0, 0.25, 0.5, 0.75, 1]}
            tick={{ fontSize: 11, fill: CHART.muted }}
            tickLine={false}
            axisLine={{ stroke: CHART.axis }}
            label={{
              value: "Güçlük (doğru yanıtlama oranı)",
              position: "insideBottom",
              offset: -14,
              style: { fontSize: 11, fill: CHART.muted },
            }}
          />
          <YAxis
            type="number"
            dataKey="y"
            domain={[yMin, "auto"]}
            tick={{ fontSize: 11, fill: CHART.muted }}
            tickLine={false}
            axisLine={false}
            label={{
              value: "Ayırt edicilik",
              angle: -90,
              position: "insideLeft",
              style: { fontSize: 11, fill: CHART.muted },
            }}
          />
          <ZAxis range={[70, 70]} />

          {/* Eşik çizgileri */}
          <ReferenceLine x={THRESHOLDS.hardBelow} stroke={CHART.grid} />
          <ReferenceLine x={THRESHOLDS.easyAbove} stroke={CHART.grid} />
          <ReferenceLine
            y={THRESHOLDS.weakDiscriminationBelow}
            stroke={CHART.grid}
          />
          {yMin < 0 && <ReferenceLine y={0} stroke={CHART.axis} />}

          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            contentStyle={CHART.tooltip}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const point = payload[0].payload as (typeof data)[number];
              return (
                <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg max-w-[240px]">
                  <p className="text-sm font-medium text-gray-800">
                    Madde {point.questionNo} — {point.label}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-600">
                    {point.explanation}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Güçlük {fmt(point.x)} · Ayırt edicilik {fmt(point.y)}
                  </p>
                </div>
              );
            }}
          />

          <Scatter
            data={data}
            onClick={(point) => {
              const clicked = point as unknown as { questionNo: number };
              onSelect(
                selected === clicked.questionNo ? null : clicked.questionNo
              );
            }}
            cursor="pointer"
          >
            {data.map((point) => (
              <Cell
                key={point.questionNo}
                fill={point.needsAttention ? CHART.accent : CHART.series}
                stroke="#ffffff"
                strokeWidth={selected === point.questionNo ? 3 : 1.5}
              />
            ))}
            <LabelList
              dataKey="tag"
              position="right"
              offset={8}
              style={{ fontSize: 11, fill: CHART.secondary }}
            />
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
