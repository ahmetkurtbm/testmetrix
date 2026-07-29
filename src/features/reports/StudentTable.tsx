"use client";

import { useMemo, useState } from "react";
import type { ExamAnalysis } from "@/features/analysis";
import { fmt } from "@/lib/format";

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
      zScore: students.zScores[index],
      tScore: students.tScores[index],
      rank: students.ranks[index],
    }));

    return list.sort((a, b) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      if (av === null) return 1;
      if (bv === null) return -1;
      return sort.asc
        ? (av as number) - (bv as number)
        : (bv as number) - (av as number);
    });
  }, [analysis, studentNames, sort]);

  const visible = showAll ? rows : rows.slice(0, 10);

  const header = (key: SortKey, label: string) => (
    <th
      className="px-3 py-2 text-right font-medium cursor-pointer select-none hover:text-gray-900"
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
      <h2 className="text-base font-semibold text-gray-800">Öğrenci sonuçları</h2>
      <p className="mt-0.5 mb-3 text-xs text-gray-500">
        Eşit puan alan öğrenciler eşit sıra alır.
      </p>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table
          className="min-w-full text-sm"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          <thead className="bg-gray-50 text-gray-600">
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
                className="border-t border-gray-100 hover:bg-gray-50"
              >
                <td className="px-3 py-2 text-gray-800">{row.name}</td>
                <td className="px-3 py-2 text-right text-gray-700">{row.score}</td>
                <td className="px-3 py-2 text-right text-gray-500">{row.wrong}</td>
                <td className="px-3 py-2 text-right text-gray-700">
                  {fmt(row.points, 1)}
                </td>
                <td className="px-3 py-2 text-right text-gray-700">
                  {fmt(row.zScore)}
                </td>
                <td className="px-3 py-2 text-right text-gray-700">
                  {fmt(row.tScore, 1)}
                </td>
                <td className="px-3 py-2 text-right text-gray-700">{row.rank}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows.length > 10 && (
        <button
          onClick={() => setShowAll((prev) => !prev)}
          className="mt-2 text-xs text-blue-600 hover:underline"
        >
          {showAll ? "İlk 10'u göster" : `Tümünü göster (${rows.length} öğrenci)`}
        </button>
      )}
    </div>
  );
}
