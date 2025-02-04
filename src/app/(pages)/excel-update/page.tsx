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
import { useEffect, useState } from "react";

interface File {
  id: number;
  folder_name: string;
  file_name: string;
  created_at: string;
  file_data: string[][];
}

const ExcelUpdate = () => {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND;

  const [data, setData] = useState<File | null>(null);
  const [selectedValues, setSelectedValues] = useState<string[][]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [folderName, setFolderName] = useState<string>("");

  useEffect(() => {
    const getExcel = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const fileId = searchParams.get("file-id");

      if (fileId) {
        try {
          const response = await fetch(`${BACKEND_URL}/excel`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileId }),
          });

          if (response.ok) {
            const fetchedData: File = (await response.json())[0];
            setData(fetchedData);
            setFileName(fetchedData.file_name);
            setFolderName(fetchedData.folder_name);
            setSelectedValues(fetchedData.file_data.map((row) => [...row]));
          } else {
            console.error("Failed to fetch data:", await response.json());
          }
        } catch (error) {
          console.error("Error fetching Excel data:", error);
        }
      }
    };

    getExcel();
  }, []);

  const handleSelectChange = (
    rowIndex: number,
    colIndex: number,
    newValue: string
  ) => {
    const newSelectedValues = selectedValues.map((row, rIndex) =>
      rIndex === rowIndex
        ? row.map((cell, cIndex) => (cIndex === colIndex ? newValue : cell))
        : row
    );
    setSelectedValues(newSelectedValues);
  };

  const handleUpdate = async () => {
    const searchParams = new URLSearchParams(window.location.search);
    const fileId = searchParams.get("file-id");

    if (fileId) {
      try {
        const response = await fetch(`${BACKEND_URL}/excel-update`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: fileId,
            folderName,
            fileName,
            arrayData: selectedValues,
          }),
        });

        if (response.ok) {
          console.log("Excel Update Successful");
        } else {
          console.error("Update failed:", await response.text());
        }
      } catch (error) {
        console.error("Error Updating Excel:", error);
      }
    }
  };

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="w-full flex justify-between bg-slate-300 p-3">
        <div>
          <h1 className="text-2xl font-semibold mb-4">{data?.file_name}</h1>
          <h4 className="text-sm font-semibold mb-4 text-gray-400">
            {data?.created_at}
          </h4>
        </div>
        <div className="flex gap-3">
          <div>
            <Label>Klasör İsmi</Label>
            <Input
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
            />
          </div>
          <div>
            <Label>Dosya İsmi</Label>
            <Input
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
            />
          </div>
          <Button onClick={handleUpdate}>Değişiklikleri Kaydet</Button>
        </div>
      </div>
      <div className="overflow-x-auto max-w-full max-h-[36rem] overflow-y-auto bg-slate-300 p-4">
        <table className="border-collapse border border-gray-200 w-full">
          <thead>
            <tr className="bg-gray-100">
              {data?.file_data[0]?.map((header, index) => (
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
            {selectedValues.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-t">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="p-4">
                    {cellIndex === 0 ? (
                      <span className="text-gray-600">{cell}</span>
                    ) : (
                      <Select
                        value={cell || ""}
                        onValueChange={(newValue) =>
                          handleSelectChange(rowIndex, cellIndex, newValue)
                        }
                      >
                        <SelectTrigger className="w-full p-2 border border-gray-300 rounded-md">
                          <SelectValue placeholder="Seçiniz" />
                        </SelectTrigger>
                        <SelectContent>
                          {["A", "B", "C", "D", "E", "Boş"].map(
                            (option, index) => (
                              <SelectItem key={index} value={option}>
                                {option}
                              </SelectItem>
                            )
                          )}
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
    </div>
  );
};

export default ExcelUpdate;
