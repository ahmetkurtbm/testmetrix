"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Concert_One } from "next/font/google";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface ExcelUpdateProps {
  folder_name: string;
  file_name: string;
  created_at: string;
  headers: string[];
  rows: string[][];
}

interface File {
  id: number;
  folder_name: string;
  file_name: string;
  created_at: string;
  file_data: string[][];
}

const ExcelUpdate = () => {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND;

  const params = useSearchParams();
  const [data, setData] = useState<ExcelUpdateProps | null>(null);
  const [selectedValues, setSelectedValues] = useState<string[][]>([]);
  const [fileName, setFileName] = useState<string>();
  const [folderName, setFolderName] = useState<string>();

  const [tempData, setTempData] = useState<string[][]>([]);

  useEffect(() => {
    const getExcel = async () => {
      const fileId = params.get("file-id");

      if (fileId) {
        try {
          const response = await fetch(`${BACKEND_URL}/excel`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ fileId }),
          });

          if (response.ok) {
            const fetchedData: File[] = await response.json();

            const file_name = fetchedData[0].file_name;
            const folder_name = fetchedData[0].folder_name;
            const created_at = fetchedData[0].created_at;

            const headers = fetchedData[0].file_data.map((item) => item[0]);
            const rows = fetchedData[0].file_data.map((subArray) =>
              subArray.slice(1)
            );

            setTempData(fetchedData[0].file_data);

            // Veriyi set ediyoruz
            setData({
              file_name,
              folder_name,
              created_at,
              headers,
              rows,
            });

            setFileName(file_name);
            setFolderName(folder_name);

            // SelectedValues dizisini file_data'dan gelen verilere göre başlatıyoruz
            setSelectedValues(
              rows.map((row: any) => row.slice(1)) // Başlangıçtaki 1. sütunu atarak seçilen değerleri alıyoruz
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

  const handleUpdate = async () => {
    const fileId = params.get("file-id");

    try {
      const response = await fetch(`${BACKEND_URL}/excel-update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: fileId,
          folderName: folderName || "defaultFolder",
          fileName: fileName || "defaultFile",
          arrayData: selectedValues || [],
        }),
      });

      if (response.ok) {
        console.log("Excel Update Successful");
      } else {
        console.error("Update failed:", Error);
      }
    } catch (error) {
      console.error("Error Updating Excel:", error);
    }
  };

  if (!data) {
    return <div>Loading...</div>;
  }

  const { headers, rows } = data;

  return (
    <div style={{ padding: "16px" }} className="gap-4 flex-col">
      <div className="w-full flex  justify-between bg-slate-300 p-3">
        <div>
          <h1 className="text-2xl font-semibold mb-4">{data.file_name}</h1>
          <h4 className="text-sm font-semibold mb-4 text-gray-400">
            {data.created_at}
          </h4>
        </div>

        <div className="flex gap-3">
          <div>
            <Label>Klasor Ismi</Label>
            <Input
              defaultValue={data.folder_name}
              onChange={(e) => setFolderName(e.target.value)}
            />
          </div>

          <div>
            <Label>Dosya Ismi</Label>
            <Input
              defaultValue={data.file_name}
              onChange={(e) => setFileName(e.target.value)}
            />
          </div>

          <Button onClick={handleUpdate}>Değişikleri Kaydet</Button>
        </div>
      </div>

      <div
        style={{ padding: "20px" }}
        className="overflow-x-auto max-w-full max-h-[36rem] overflow-y-auto bg-slate-300"
      >
        <table className="border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              {tempData[0].map((row, index) => (
                <th
                  key={index}
                  className="p-4 text-left font-medium text-gray-700"
                >
                  {index === 0 ? (
                    <p></p>
                  ) : (
                    <p className="flex-row">Soru{index}</p>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tempData.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-t">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="p-4">
                    {cellIndex === 0 ? (
                      <span className="text-gray-600">{cell}</span>
                    ) : (
                      <Select
                        value={
                          selectedValues[rowIndex]?.[cellIndex - 1] ||
                          cell ||
                          ""
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
      <br />
    </div>
  );
};

export default ExcelUpdate;
