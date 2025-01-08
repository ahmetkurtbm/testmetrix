"use client";
import { useState } from "react";
import * as XLSX from "xlsx";
import ExcelUpdate from "../excelUpdate/page";
import ExcelReports from "../excelReports/page";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Header from "@/app/(components)/header";

const ExcelUploadPage = () => {
  const [jsonData, setJsonData] = useState<Record<string, any>>({}); // JSON verisi için state
  const [arrayData, setArrayData] = useState<any[]>([]); // Array verisi için state
  const [showExcel, setShowExcel] = useState(false);
  const [reportExcel, setReportExcel] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [fileName, setFileName] = useState("");

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      alert("Lütfen bir dosya seçin.");
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const data = e.target?.result;

      if (!data) {
        alert("Dosya okunamadı.");
        return;
      }

      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const array = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
      });

      const json: Record<string, any> = {}; // Verinin türünü belirtiyoruz

      array.forEach((row: any) => {
        if (row[0]) {
          const key = row[0];
          const values = row.slice(1);
          json[key] = values.length === 1 ? values[0] : values;
        }
      });

      setFileName(file.name); // Set the file name
      setJsonData(json);
      setArrayData(array);
    };

    reader.readAsBinaryString(file);
  };

  const handleExcelView = () => {
    setShowExcel(!showExcel);
  };

  const handleExcelReport = () => {
    setReportExcel(!reportExcel);
  };

  const handleSave = async () => {
    try {
      const response = await fetch("http://localhost:5000/excel-upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          folderName: folderName || "defaultFolder",
          fileName: fileName || "defaultFile",
          arrayData: arrayData || [],
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Excel Upload Successful");
      } else {
        console.error("Upload failed:", data.error);
      }
    } catch (error) {
      console.error("Error uploading Excel:", error);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center p-6 bg-gray-100 min-h-screen">
        <Card className="w-full max-w-xl shadow-md">
          <CardHeader>
            <h1 className="text-2xl font-bold text-center">Excel Yükle</h1>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <label
                htmlFor="fileUpload"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Excel Dosyası Yükle
              </label>
              <Input
                id="fileUpload"
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
                className="w-full"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="folderName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Klasör Adı
              </label>
              <Input
                id="folderName"
                type="text"
                placeholder="Klasör Adı"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Yüklenen Dosya: {fileName}
              </label>
            </div>
          </CardContent>
          <CardFooter>
            <div className="flex justify-between space-x-4">
              <Button
                variant="default"
                onClick={handleExcelView}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                Görüntüle
              </Button>
              <Button
                variant="default"
                onClick={handleExcelReport}
                className="bg-green-600 text-white hover:bg-green-700"
              >
                Raporlar
              </Button>
              <Button
                variant="default"
                onClick={handleSave}
                className="bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Yükle
              </Button>
            </div>
          </CardFooter>
        </Card>

        {showExcel && arrayData.length > 0 && <ExcelUpdate data={arrayData} />}
        {reportExcel && arrayData.length > 0 && (
          <ExcelReports data={arrayData} />
        )}
      </div>
    </>
  );
};

export default ExcelUploadPage;
