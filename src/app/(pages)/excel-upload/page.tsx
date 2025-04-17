"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import TableContainer from "@/app/(components)/TableContainer";
import { ComboboxDemo } from "@/components/ui/comboboxForFolder";
import { ToastContainer, toast } from "react-toastify";

const ExcelUploadPage = () => {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND;
  const router = useRouter();
  const [isFolder, setIsFolder] = useState(false);

  const successUpload = () =>
    toast.success("Veri Yükleme İşlemi Başarılı!", {
      position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });

  const errorUpload = () =>
    toast.error(
      "Veri Yükleme İşlemi Başarısız, Veri ve Yüklenecek Konumunu Doğru Seçtiğinden Emin Ol!",
      {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      }
    );

  // Token Kontrolü
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/user-authentication`, {
          method: "GET",
          credentials: "include", // Çerezleri otomatik ekler
        });

        if (!response.ok) {
          router.push("/login");
        } else {
          handleGetFolders();
        }
      } catch (error) {
        console.error("Kimlik doğrulama hatası:", error);
        router.push("/login");
      }
    };
    checkAuth();
    const handleGetFolders = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/folders`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        const data = await response.json();
        if (response.ok) {
          if (data.length !== 0) {
            setIsFolder(true);
          }
        } else {
          console.error("Update failed:", data.error);
        }
      } catch (error) {
        console.error("Error fetching folders:", error);
      }
    };
  }, []);

  const [jsonData, setJsonData] = useState<Record<string, any>>({});
  const [arrayData, setArrayData] = useState<any[]>([]);
  const [showExcel, setShowExcel] = useState(false);
  const [reportExcel, setReportExcel] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [folderId, setFolderId] = useState();

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

      const json: Record<string, any> = {};

      array.forEach((row: any) => {
        if (row[0]) {
          const key = row[0];
          const values = row.slice(1);
          json[key] = values.length === 1 ? values[0] : values;
        }
      });

      setFileName(file.name);
      setJsonData(json);
      setArrayData(array);
    };

    // değiştirilecek
    reader.readAsBinaryString(file);
  };

  const downloadSampleFile = async () => {
    try {
      const response = await fetch("/sample.xlsx");
      const buffer = await response.arrayBuffer();

      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      saveAs(blob, "Ornek_Dosya.xlsx");
    } catch (error) {
      console.error("Dosya indirilemedi:", error);
    }
  };

  const handleSave = async () => {
    try {
      if (arrayData.length !== 0 && folderId !== undefined) {
        const chunkSize = 100; // her seferde 100 satır gönder
        for (let i = 0; i < arrayData.length; i += chunkSize) {
          const chunk = arrayData.slice(i, i + chunkSize);

          const response = await fetch(`${BACKEND_URL}/excel-upload`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              folder_id: folderId,
              file_name: fileName || "defaultFile",
              file_data: chunk,
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            errorUpload();
            console.error("Chunk upload failed:", data.error);
            return;
          }
        }

        successUpload();
        console.log("Excel Upload Successful");
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        errorUpload();
      }
    } catch (error) {
      errorUpload();
      console.error("Error uploading Excel:", error);
    }
  };

  return (
    <div className="h-5/6">
      <div className="flex h-full">
        {/* Sol Kısım - Excel Logosunun Animasyonlu Alanı */}
        <div className="w-1/2 flex items-center justify-center">
          <img
            className="absolute inset-0 w-full h-full object-cover opacity-100 z-[-1]"
            src="bg-anaekran2.jpg"
          />
          <div className="animate-scale-in">
            <img src="excel.svg" alt="Excel Logo" className="w-320 h-320" />
          </div>
        </div>
        {/* Sağ Kısım - Form Alanı */}
        {isFolder ? (
          <div className="w-1/2 flex flex-col items-center justify-center p-6 ">
            <Card className="w-full max-w-xl shadow-md">
              <CardHeader>
                <h1 className="text-2xl font-bold text-center rounded-md bg-gray-400 p-1">
                  Veri Yükle
                </h1>
              </CardHeader>
              <CardContent>
                <div className="flex w-full gap-1">
                  <div className="mb-4 w-full">
                    <label
                      htmlFor="fileUpload"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Veri Dosyası Yükle
                    </label>
                    <Input
                      id="fileUpload"
                      type="file"
                      accept=".xlsx, .xls"
                      onChange={handleFileUpload}
                      className="w-full"
                    />
                  </div>
                  <div className="mb-4 w-full">
                    <label
                      htmlFor="fileUpload"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      İstenilen Veri Tipi
                    </label>
                    <Button className="w-full" onClick={downloadSampleFile}>
                      Örnek Dosya
                    </Button>
                  </div>
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="folderName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Klasör Seç
                  </label>
                  <ComboboxDemo
                    folderId={folderId}
                    setFolderId={setFolderId}
                  ></ComboboxDemo>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Yüklenen Dosya: {fileName}
                  </label>
                </div>
              </CardContent>
              <CardFooter>
                <div className="flex justify-between space-x-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="default"
                        className="bg-blue-600 text-white hover:bg-blue-700"
                      >
                        Görüntüle
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Tablo Görüntüle</DialogTitle>
                        <DialogDescription>
                          Tablona Bakabilirsin
                        </DialogDescription>
                      </DialogHeader>
                      <TableContainer data={arrayData} />
                    </DialogContent>
                  </Dialog>
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
          </div>
        ) : (
          <div className="flex items-center justify-center h-screen">
            <div className="bg-gray-100 p-6 rounded-2xl shadow-md text-center max-w-md">
              <p className="text-lg font-semibold text-gray-700">
                📁 Şu Anda Klasör Bulunmamaktadır
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Lütfen önce bir klasör ekleyiniz.
              </p>
            </div>
          </div>
        )}
      </div>
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
};

export default ExcelUploadPage;
