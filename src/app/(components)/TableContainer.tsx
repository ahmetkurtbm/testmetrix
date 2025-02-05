"use client";

import React from "react";

interface TableContainerProps {
  data: string[][]; // İki boyutlu dizi tipini tanımlıyoruz.
}

const TableContainer: React.FC<TableContainerProps> = ({ data }) => {
  console.log(data.length);

  return (
    <>
      {data !== null && data !== undefined && data.length !== 0 ? (
        <div className="overflow-x-auto max-w-full max-h-96 overflow-y-auto">
          {/* Yüksekliği sınırlayıp kaydırma ekliyoruz */}
          <table className="min-w-full table-auto border-collapse">
            <thead>
              <tr>
                {data[0]?.map((_, index) =>
                  index !== 0 ? (
                    <th
                      key={index}
                      className="px-2 py-1 border-b font-semibold text-left text-xs"
                    >
                      Madde{index}
                    </th>
                  ) : (
                    <th
                      key={index}
                      className="px-2 py-1 border-b font-semibold text-left text-xs"
                    >
                      Veri Tablosu
                    </th>
                  )
                )}
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
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>Lütfen Excel Dosyası Yükleyiniz...</p>
      )}
    </>
  );
};

export default TableContainer;
