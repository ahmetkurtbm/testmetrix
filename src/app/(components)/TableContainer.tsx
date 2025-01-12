"use client";

import React from "react";

interface TableContainerProps {
  data: string[][]; // İki boyutlu dizi tipini tanımlıyoruz.
}

const TableContainer: React.FC<TableContainerProps> = ({ data }) => {
  return (
    <div className="overflow-x-auto max-w-full max-h-96 overflow-y-auto">
      {" "}
      {/* Yüksekliği sınırlayıp kaydırma ekliyoruz */}
      <table className="min-w-full table-auto border-collapse">
        <thead>
          <tr>
            {data[0]?.map((_, index) => (
              <th
                key={index}
                className="px-2 py-1 border-b font-semibold text-left text-xs"
              >
                Column {index + 1}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.slice(1).map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className="px-2 py-1 border-b text-left text-xs"
                >
                  {cell}
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
