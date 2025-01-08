// pages/excel-update.tsx
import Header from "@/app/(components)/header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

interface ExcelUpdateProps {
  data: string[][];
}

const ExcelUpdate = ({ data }: ExcelUpdateProps) => {
  const options = ["A", "B", "C", "D", "E"];

  const [selectedValues, setSelectedValues] = useState(
    data.slice(1).map((row) => row.slice(1))
  );

  const handleSelectChange = (
    rowIndex: number,
    colIndex: number,
    newValue: string
  ) => {
    const newSelectedValues = [...selectedValues];
    newSelectedValues[rowIndex][colIndex] = newValue;
    setSelectedValues(newSelectedValues);
  };

  return (
    <div style={{ padding: "20px" }} className="w-3/5 h-3/5">
      <Header />

      <h1 className="text-2xl font-semibold mb-4">Excel Verisi Güncelleme</h1>
      <table className="w-full border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            {data[0]?.map((header, index) => (
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
          {data.slice(1).map((row, rowIndex) => (
            <tr key={rowIndex} className="border-t">
              {row.map((cell, cellIndex) => {
                if (cellIndex === 0) {
                  // İlk sütun için sadece hücreyi gösteriyoruz
                  return (
                    <td key={cellIndex} className="p-4 text-gray-600">
                      {cell}
                    </td>
                  );
                } else {
                  // Diğer sütunlar için select box
                  return (
                    <td key={cellIndex} className="p-4">
                      <Select
                        value={selectedValues[rowIndex][cellIndex - 1] || ""}
                        onValueChange={(newValue) =>
                          handleSelectChange(rowIndex, cellIndex - 1, newValue)
                        }
                      >
                        <SelectTrigger className="w-full p-2 border border-gray-300 rounded-md">
                          <SelectValue placeholder="Seçiniz" />
                        </SelectTrigger>
                        <SelectContent>
                          {options.map((option, index) => (
                            <SelectItem key={index} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                  );
                }
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExcelUpdate;
