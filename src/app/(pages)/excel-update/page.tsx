"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface ExcelUpdateProps {
  headers: string[];
  rows: string[][];
}

interface File {
  id: number;
  folder_name: string;
  file_name: string;
  created_at: string;
  file_data: Array<[string, string[]]>;
}

const ExcelUpdate = () => {
  const params = useSearchParams();
  const [data, setData] = useState<ExcelUpdateProps | null>(null);
  const [selectedValues, setSelectedValues] = useState<string[][]>([]);

  useEffect(() => {
    const getExcel = async () => {
      const fileId = params.get("file-id");

      if (fileId) {
        try {
          const response = await fetch("http://localhost:5000/excel", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ fileId }),
          });

          if (response.ok) {
            const fetchedData: File[] = await response.json();

            const headers = fetchedData[0].file_data.map((item) => item[0]);
            const rows = fetchedData[0].file_data.map((item) => item[1]);

            console.log(rows);

            // Veriyi set ediyoruz
            setData({
              headers,
              rows,
            });

            // SelectedValues dizisini file_data'dan gelen verilere göre başlatıyoruz
            setSelectedValues(
              rows.map((row) => row.slice(1)) // Başlangıçtaki 1. sütunu atarak seçilen değerleri alıyoruz
            );
          } else {
            console.error("Failed to fetch data:", await response.json());
          }
        } catch (error) {
          console.error("Error fetching Excel data:", error);
        }
      }
    };

    getExcel();
  }, [params]);

  const handleSelectChange = (
    rowIndex: number,
    colIndex: number,
    newValue: string
  ) => {
    const newSelectedValues = [...selectedValues];
    newSelectedValues[rowIndex][colIndex] = newValue;
    setSelectedValues(newSelectedValues);
  };

  if (!data) {
    return <div>Loading...</div>;
  }

  const { headers, rows } = data;

  return (
    <div
      style={{ padding: "20px" }}
      className="overflow-x-auto max-w-full max-h-96 overflow-y-auto"
    >
      <h1 className="text-2xl font-semibold mb-4">Excel Verisi Güncelleme</h1>
      <table className="border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            {headers.map((header, index) => (
              <th
                key={index}
                className="p-4 text-left font-medium text-gray-700"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-t">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="p-4">
                  {cellIndex === 0 ? (
                    <span className="text-gray-600">{cell}</span>
                  ) : (
                    <Select
                      value={
                        selectedValues[rowIndex]?.[cellIndex - 1] || cell || ""
                      }
                      onValueChange={(newValue) =>
                        handleSelectChange(rowIndex, cellIndex - 1, newValue)
                      }
                    >
                      <SelectTrigger className="w-full p-2 border border-gray-300 rounded-md">
                        <SelectValue placeholder="Seçiniz" />
                      </SelectTrigger>
                      <SelectContent>
                        {["A", "B", "C", "D", "E"].map((option, index) => (
                          <SelectItem key={index} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExcelUpdate;
