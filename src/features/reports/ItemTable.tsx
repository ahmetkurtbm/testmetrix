"use client";

import { useMemo, useState } from "react";
import type { ExamAnalysis } from "@/features/analysis";
import { fmt } from "./svg-utils";
import type { ItemQuality } from "./quality";

/**
 * Madde tablosu — her grafiğin tablo eşdeğeri.
 *
 * Kılavuz kuralı: hiçbir değer yalnızca renkle ya da yalnızca tooltip ile
 * erişilebilir olmamalı. Haritadaki her nokta burada sayı olarak da var.
 *
 * Kalite rozeti renk + **ikon + metin** taşıyor; renk tek başına anlam
 * taşımıyor.
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
      rbis: analysis.items.rbis[item.questionNo - 1],
      prbis: analysis.items.prbis[item.questionNo - 1],
      correctCount: analysis.items.correctCount[item.questionNo - 1],
    }));

    return withStats.sort((a, b) => {
      // null her zaman sona: "hesaplanamadı" en küçük değer değil.
      const av = a[sort.key];
      const bv = b[sort.key];
      if (av === null) return 1;
      if (bv === null) return -1;
      return sort.asc ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
  }, [items, analysis, sort]);

  const header = (key: SortKey, label: string) => (
    <th
      className="px-3 py-2 text-left font-medium cursor-pointer select-none hover:text-[var(--viz-text)]"
      onClick={() =>
        setSort((prev) => ({ key, asc: prev.key === key ? !prev.asc : true }))
      }
      aria-sort={sort.key === key ? (sort.asc ? "ascending" : "descending") : "none"}
    >
      {label}
      {sort.key === key && (
        <span className="ml-1 text-[var(--viz-text-muted)]">
          {sort.asc ? "↑" : "↓"}
        </span>
      )}
    </th>
  );

  return (
    <div>
      <h3 className="mb-1 text-sm font-medium text-[var(--viz-text)]">
        Madde istatistikleri
      </h3>
      <p className="mb-3 text-xs text-[var(--viz-text-secondary)]">
        Başlığa tıklayarak sıralayabilirsiniz. “—” hesaplanamayan değer demektir.
      </p>

      <div className="overflow-x-auto rounded-lg border border-black/5 dark:border-white/10">
        <table className="min-w-full text-sm" style={{ fontVariantNumeric: "tabular-nums" }}>
          <thead className="bg-[var(--viz-surface)] text-[var(--viz-text-secondary)]">
            <tr>
              {header("questionNo", "Madde")}
              {header("difficulty", "Güçlük (p)")}
              {header("discrimination", "Ayırt edicilik")}
              {header("prbis", "r pbis")}
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
                className={`border-t border-black/5 dark:border-white/10 cursor-pointer transition-colors ${
                  selected === row.questionNo
                    ? "bg-[var(--viz-accent-soft)]"
                    : "hover:bg-[var(--viz-surface)]"
                }`}
              >
                <td className="px-3 py-2 font-medium text-[var(--viz-text)]">
                  M{row.questionNo}
                </td>

                {/* Satır içi ölçek: sayının yanında oransal çubuk */}
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="w-10 text-[var(--viz-text)]">
                      {fmt(row.difficulty)}
                    </span>
                    <span className="h-1.5 w-20 rounded-full bg-[var(--viz-series-soft)] overflow-hidden">
                      <span
                        className="block h-full rounded-full"
                        style={{
                          width: `${row.difficulty * 100}%`,
                          background: "var(--viz-series)",
                        }}
                      />
                    </span>
                  </div>
                </td>

                <td className="px-3 py-2 text-[var(--viz-text)]">
                  {fmt(row.discrimination)}
                </td>
                <td className="px-3 py-2 text-[var(--viz-text)]">{fmt(row.prbis)}</td>

                <td className="px-3 py-2">
                  {/* İkon + metin: renk tek başına anlam taşımıyor */}
                  <span
                    className="inline-flex items-center gap-1.5 text-xs"
                    style={{
                      color: row.needsAttention
                        ? "var(--viz-accent)"
                        : "var(--viz-text-secondary)",
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
