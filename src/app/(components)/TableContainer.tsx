"use client";

import React from "react";

interface TableContainerProps {
  data: string[][];
}

const TableContainer: React.FC<TableContainerProps> = ({ data }) => {
  return (
    <div>
      {data !== null && data !== undefined && data.length !== 0 ? (
        <div className="overflow-x-auto max-w-full max-h-96 overflow-y-auto">
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
        <p>Lütfen Veri Dosyası Yükleyiniz...</p>
      )}
    </div>
  );
};

export default TableContainer;
