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
        const response = await fetch(`${BACKEND_URL}/excel-upload`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            folder_id: folderId,
            file_name: fileName || "defaultFile",
            file_data: arrayData || [],
          }),
        });

        const data = await response.json();

        if (response.ok) {
          successUpload();
          console.log("Excel Upload Successful");
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else {
          errorUpload();
          console.error("Upload failed:", data.error);
        }
      } else {
        errorUpload();
      }
    } catch (error) {
      errorUpload();
      console.error("Error uploading Excel:", error);
    }
  };

  return (
    <div className="min-h-screen relative">
      <img
        className="absolute inset-0 w-full h-full object-cover opacity-100"
        src="bg-anaekran.jpg"
        alt="Background"
      />

      <div className="relative z-10 min-h-screen p-4 flex items-center justify-center">
        <div className="flex flex-col lg:flex-row gap-4 max-w-7xl w-full">
          {/* Sol Kısım */}
          <div className="w-full lg:w-1/2 flex flex-col items-center justify-center gap-6">
            <div className="animate-scale-in">
              <img
                src="excel.svg"
                alt="Excel Logo"
                className="w-40 h-40 lg:w-56 lg:h-56"
              />
            </div>
            <Button
              onClick={downloadSampleFile}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg shadow-md hover:shadow-lg transition-all w-56"
            >
              📥 Örnek Dosya İndir
            </Button>
          </div>

          {/* Sağ Kısım */}
          <div className="w-full lg:w-1/2 flex items-center justify-center">
            {isFolder ? (
              <Card className="w-full max-w-xl shadow-lg bg-white/95">
                <CardHeader className="space-y-1 pb-4">
                  <h1 className="text-xl font-bold text-center text-gray-800">
                    Excel Dosyası Yükle
                  </h1>
                  <p className="text-sm text-center text-gray-600">
                    Lütfen analiz etmek istediğiniz dosyayı seçin
                  </p>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Klasör Seçimi */}
                  <div className="space-y-2.5">
                    {" "}
                    {/* Changed from space-y-1.5 to space-y-2.5 */}
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {" "}
                      {/* Added mb-1 */}
                      1. Klasör Seçin
                    </label>
                    <ComboboxDemo
                      folderId={folderId}
                      setFolderId={setFolderId}
                    />
                  </div>

                  {/* Dosya Yükleme */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">
                      2. Dosya Yükleyin
                    </label>
                    <Input
                      id="fileUpload"
                      type="file"
                      accept=".xlsx, .xls"
                      onChange={handleFileUpload}
                      className="w-full border-2 border-dashed border-gray-300 rounded-lg p-3 hover:border-blue-500 transition-colors"
                    />
                  </div>

                  {/* Yüklenen Dosya Bilgisi */}
                  {fileName && (
                    <div className="bg-blue-50 p-2.5 rounded-lg mt-2">
                      <p className="text-sm text-blue-800">
                        📎 Yüklenen Dosya: {fileName}
                      </p>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="pt-2">
                  <div className="flex flex-col sm:flex-row w-full gap-3">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full sm:w-1/2">
                          👁️ Önizle
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px] w-[95vw] sm:w-full">
                        <DialogHeader>
                          <DialogTitle>Veri Önizleme</DialogTitle>
                          <DialogDescription>
                            Yüklediğiniz verinin önizlemesi
                          </DialogDescription>
                        </DialogHeader>
                        <TableContainer data={arrayData} />
                      </DialogContent>
                    </Dialog>
                    <Button
                      onClick={handleSave}
                      className="w-full sm:w-1/2 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      💾 Yükle
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ) : (
              <div className="w-full p-4 flex items-center justify-center">
                <div className="bg-white/95 p-6 rounded-2xl shadow-md text-center w-full max-w-md">
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
        </div>
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
