"use client";

import React from "react";

interface TableContainerProps {
  /**
   * Ham Excel matrisi. Hücreler `unknown`: Excel'den sayı, tarih ya da boş
   * hücre gelebiliyor. Eskiden `string[][]` deklare edilmişti ama gerçekte
   * sayısal hücreler de geçiyordu — tip yanlıştı, sadece `any` zinciri
   * sayesinde derleniyordu.
   */
  data: unknown[][];
}

/** Hücreyi güvenle metne çevirir; React `unknown` render edemez. */
function toText(cell: unknown): string {
  if (cell === null || cell === undefined) return "";
  if (typeof cell === "object") return "";
  return String(cell);
}

const TableContainer: React.FC<TableContainerProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return <p>Lütfen veri dosyası yükleyiniz...</p>;
  }

  return (
    <div className="overflow-x-auto max-w-full max-h-96 overflow-y-auto">
      <table className="min-w-full table-auto border-collapse">
        <thead>
          <tr>
            {data[0]?.map((_, index) => (
              <th
                key={index}
                className="px-2 py-1 border-b font-semibold text-left text-xs whitespace-nowrap"
              >
                {index === 0 ? "Veri Tablosu" : `Madde ${index}`}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className="px-2 py-1 border-b text-left text-xs"
                >
                  {toText(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableContainer;
