"use client";

import { useMemo, useState } from "react";
import type { ExamAnalysis } from "@/features/analysis";
import { fmt } from "./svg-utils";

type SortKey = "rank" | "score" | "zScore";

/** Öğrenci sonuçları. Eşit puanlar eşit sıra alır (competition ranking). */
export function StudentTable({
  analysis,
  studentNames,
}: {
  analysis: ExamAnalysis;
  studentNames: string[];
}) {
  const [sort, setSort] = useState<{ key: SortKey; asc: boolean }>({
    key: "rank",
    asc: true,
  });
  const [showAll, setShowAll] = useState(false);

  const rows = useMemo(() => {
    const { students, descriptive } = analysis;
    const list = studentNames.map((name, index) => ({
      name,
      score: students.scores[index],
      wrong: descriptive.questionCount - students.scores[index],
      points: students.points[index],
      successRate: students.successRates[index] * 100,
      zScore: students.zScores[index],
      tScore: students.tScores[index],
      rank: students.ranks[index],
    }));

    return list.sort((a, b) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      if (av === null) return 1;
      if (bv === null) return -1;
      return sort.asc ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
  }, [analysis, studentNames, sort]);

  const visible = showAll ? rows : rows.slice(0, 10);

  const header = (key: SortKey, label: string) => (
    <th
      className="px-3 py-2 text-right font-medium cursor-pointer select-none hover:text-[var(--viz-text)]"
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
        Öğrenci sonuçları
      </h3>
      <p className="mb-3 text-xs text-[var(--viz-text-secondary)]">
        Eşit puan alan öğrenciler eşit sıra alır.
      </p>

      <div className="overflow-x-auto rounded-lg border border-black/5 dark:border-white/10">
        <table className="min-w-full text-sm" style={{ fontVariantNumeric: "tabular-nums" }}>
          <thead className="bg-[var(--viz-surface)] text-[var(--viz-text-secondary)]">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Öğrenci</th>
              {header("score", "Doğru")}
              <th className="px-3 py-2 text-right font-medium">Yanlış</th>
              <th className="px-3 py-2 text-right font-medium">Puan</th>
              {header("zScore", "Z")}
              <th className="px-3 py-2 text-right font-medium">T</th>
              {header("rank", "Sıra")}
            </tr>
          </thead>
          <tbody>
            {visible.map((row, index) => (
              <tr
                key={`${row.name}-${index}`}
                className="border-t border-black/5 dark:border-white/10 hover:bg-[var(--viz-surface)]"
              >
                <td className="px-3 py-2 text-[var(--viz-text)]">{row.name}</td>
                <td className="px-3 py-2 text-right text-[var(--viz-text)]">
                  {row.score}
                </td>
                <td className="px-3 py-2 text-right text-[var(--viz-text-secondary)]">
                  {row.wrong}
                </td>
                <td className="px-3 py-2 text-right text-[var(--viz-text)]">
                  {fmt(row.points, 1)}
                </td>
                <td className="px-3 py-2 text-right text-[var(--viz-text)]">
                  {fmt(row.zScore)}
                </td>
                <td className="px-3 py-2 text-right text-[var(--viz-text)]">
                  {fmt(row.tScore, 1)}
                </td>
                <td className="px-3 py-2 text-right text-[var(--viz-text)]">
                  {row.rank}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows.length > 10 && (
        <button
          onClick={() => setShowAll((prev) => !prev)}
          className="mt-2 text-xs text-[var(--viz-text-secondary)] hover:text-[var(--viz-text)] underline"
        >
          {showAll
            ? "İlk 10'u göster"
            : `Tümünü göster (${rows.length} öğrenci)`}
        </button>
      )}
    </div>
  );
}
