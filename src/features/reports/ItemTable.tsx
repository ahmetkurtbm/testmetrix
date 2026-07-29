"use client";

import { useMemo, useState } from "react";
import type { ExamAnalysis } from "@/features/analysis";
import { fmt } from "@/lib/format";
import { CHART } from "./chart-theme";
import type { ItemQuality } from "./quality";

/**
 * Madde tablosu — grafiğin tablo eşdeğeri.
 *
 * Haritadaki her nokta burada sayı olarak da var; hiçbir değer yalnızca renkle
 * ya da yalnızca tooltip ile erişilebilir değil. Durum sütunu renk + ikon +
 * metin taşıyor.
 */
type SortKey = "questionNo" | "difficulty" | "discrimination" | "prbis";

const ICONS: Record<string, string> = {
  ok: "✓",
  tooEasy: "▲",
  tooHard: "▼",
  weakDiscrimination: "!",
  negative: "✕",
};

export function ItemTable({
  analysis,
  items,
  selected,
  onSelect,
}: {
  analysis: ExamAnalysis;
  items: ItemQuality[];
  selected: number | null;
  onSelect: (questionNo: number | null) => void;
}) {
  const [sort, setSort] = useState<{ key: SortKey; asc: boolean }>({
    key: "questionNo",
    asc: true,
  });

  const rows = useMemo(() => {
    const withStats = items.map((item) => ({
      ...item,
      prbis: analysis.items.prbis[item.questionNo - 1],
      correctCount: analysis.items.correctCount[item.questionNo - 1],
    }));

    return withStats.sort((a, b) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      // null her zaman sona: "hesaplanamadı" en küçük değer değil.
      if (av === null) return 1;
      if (bv === null) return -1;
      return sort.asc
        ? (av as number) - (bv as number)
        : (bv as number) - (av as number);
    });
  }, [items, analysis, sort]);

  const header = (key: SortKey, label: string, align = "left") => (
    <th
      className={`px-3 py-2 font-medium text-${align} cursor-pointer select-none hover:text-gray-900`}
      onClick={() =>
        setSort((prev) => ({ key, asc: prev.key === key ? !prev.asc : true }))
      }
    >
      {label}
      {sort.key === key && (
        <span className="ml-1 text-gray-400">{sort.asc ? "↑" : "↓"}</span>
      )}
    </th>
  );

  return (
    <div>
      <h2 className="text-base font-semibold text-gray-800">Madde istatistikleri</h2>
      <p className="mt-0.5 mb-3 text-xs text-gray-500">
        Başlığa tıklayarak sıralayın. “—” hesaplanamayan değer demektir.
      </p>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table
          className="min-w-full text-sm"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              {header("questionNo", "Madde")}
              {header("difficulty", "Güçlük (p)")}
              {header("discrimination", "Ayırt edicilik", "right")}
              {header("prbis", "r pbis", "right")}
              <th className="px-3 py-2 text-left font-medium">Durum</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.questionNo}
                onClick={() =>
                  onSelect(selected === row.questionNo ? null : row.questionNo)
                }
                className={`border-t border-gray-100 cursor-pointer transition-colors ${
                  selected === row.questionNo ? "bg-orange-50" : "hover:bg-gray-50"
                }`}
              >
                <td className="px-3 py-2 font-medium text-gray-800">
                  M{row.questionNo}
                </td>

                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="w-9 text-gray-700">{fmt(row.difficulty)}</span>
                    <span className="h-1.5 w-16 rounded-full bg-blue-100 overflow-hidden">
                      <span
                        className="block h-full rounded-full"
                        style={{
                          width: `${row.difficulty * 100}%`,
                          background: CHART.series,
                        }}
                      />
                    </span>
                  </div>
                </td>

                <td className="px-3 py-2 text-right text-gray-700">
                  {fmt(row.discrimination)}
                </td>
                <td className="px-3 py-2 text-right text-gray-700">
                  {fmt(row.prbis)}
                </td>

                <td className="px-3 py-2">
                  {/* İkon + metin: renk tek başına anlam taşımıyor */}
                  <span
                    className="inline-flex items-center gap-1.5 text-xs"
                    style={{
                      color: row.needsAttention ? CHART.accent : "#6b7280",
                    }}
                  >
                    <span aria-hidden>{ICONS[row.flag]}</span>
                    {row.label}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
