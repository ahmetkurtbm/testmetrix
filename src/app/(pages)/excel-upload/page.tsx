"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import TableContainer from "@/app/(components)/TableContainer";
import { ComboboxDemo } from "@/components/ui/comboboxForFolder";
import { ToastContainer, toast } from "react-toastify";
import { apiGet, apiPost } from "@/lib/api-client";
import { readExcelMatrix } from "@/features/exams/read-excel";
import type { FolderSummary } from "@/features/exams/types";

const ExcelUploadPage = () => {
  const router = useRouter();

  const [isFolder, setIsFolder] = useState<boolean | null>(null);
  const [arrayData, setArrayData] = useState<unknown[][]>([]);
  const [fileName, setFileName] = useState("");
  const [folderId, setFolderId] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);

  // Oturum kontrolü yok: middleware bu sayfaya oturumsuz erişimi zaten kesiyor.
  useEffect(() => {
    apiGet<FolderSummary[]>("/api/folders")
      .then((folders) => setIsFolder(folders.length > 0))
      .catch(() => setIsFolder(false));
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const rows = await readExcelMatrix(file);
      if (rows.length < 2) {
        toast.error("Dosyada cevap anahtarı ve en az bir öğrenci satırı olmalı.", {
          position: "bottom-right",
          theme: "dark",
        });
        return;
      }
      setArrayData(rows);
      setFileName(file.name.replace(/\.xlsx?$/i, ""));
    } catch {
      toast.error("Dosya okunamadı. Geçerli bir .xlsx dosyası seçin.", {
        position: "bottom-right",
        theme: "dark",
      });
    }
  };

  const downloadSampleFile = async () => {
    try {
      const response = await fetch("/sample.xlsx");
      const buffer = await response.arrayBuffer();
      saveAs(
        new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
        "Ornek_Dosya.xlsx"
      );
    } catch (error) {
      console.error("Örnek dosya indirilemedi:", error);
    }
  };

  const handleSave = async () => {
    if (arrayData.length === 0 || !folderId) {
      toast.error("Veri ve yükleneceği klasörü doğru seçtiğinden emin ol!", {
        position: "bottom-right",
        theme: "dark",
      });
      return;
    }

    setSaving(true);
    try {
      const { id } = await apiPost<{ id: string }>("/api/exams", {
        folderId,
        name: fileName || "Adsız sınav",
        matrix: arrayData,
      });
      toast.success("Veri yükleme işlemi başarılı!", {
        position: "bottom-right",
        theme: "dark",
      });
      router.push(`/excel-reports?exam=${id}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Veri yükleme işlemi başarısız.",
        { position: "bottom-right", theme: "dark" }
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      <img
        className="absolute inset-0 w-full h-full object-cover"
        src="/bg-anaekran.jpg"
        alt="Background"
      />

      <div className="relative z-10 min-h-screen p-4 flex items-center justify-center">
        <div className="flex flex-col lg:flex-row gap-4 max-w-6xl w-full">
          {/* Sol Kısım */}
          <div className="w-full lg:w-1/2 flex flex-col items-center justify-center gap-5">
            <div className="animate-scale-in">
              <img
                src="/excel.svg"
                alt="Excel Logo"
                className="w-32 h-32 lg:w-44 lg:h-44"
              />
            </div>
            <Button
              onClick={downloadSampleFile}
              className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-5 rounded-lg shadow-md hover:shadow-lg transition-all w-52"
            >
              📥 Örnek Dosya İndir
            </Button>
          </div>

          {/* Sağ Kısım */}
          <div className="w-full lg:w-1/2 flex items-center justify-center">
            {isFolder === false ? (
              <div className="w-full max-w-md bg-white/95 p-5 rounded-2xl shadow-md text-center">
                <p className="text-base font-semibold text-gray-700">
                  📁 Şu anda klasör bulunmamaktadır
                </p>
                <p className="text-sm text-gray-500 mt-1.5">
                  Lütfen önce bir klasör ekleyiniz.
                </p>
              </div>
            ) : (
              <Card className="w-full max-w-lg shadow-lg bg-white/95">
                <CardHeader className="space-y-1 pb-3">
                  <h1 className="text-lg font-bold text-center text-gray-800">
                    Excel Dosyası Yükle
                  </h1>
                  <p className="text-xs text-center text-gray-600">
                    Lütfen analiz etmek istediğiniz dosyayı seçin
                  </p>
                </CardHeader>

                <CardContent className="space-y-3.5">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      1. Klasör Seçin
                    </label>
                    <ComboboxDemo folderId={folderId} setFolderId={setFolderId} />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">
                      2. Dosya Yükleyin
                    </label>
                    <Input
                      id="fileUpload"
                      type="file"
                      accept=".xlsx, .xls"
                      onChange={handleFileUpload}
                      className="w-full text-sm border-2 border-dashed border-gray-300 rounded-lg p-2.5 hover:border-blue-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">
                      3. Sınav Adı
                    </label>
                    <Input
                      value={fileName}
                      onChange={(e) => setFileName(e.target.value)}
                      placeholder="Örn. 8. Sınıf Matematik 1. Dönem"
                      className="text-sm"
                    />
                  </div>

                  {arrayData.length > 0 && (
                    <div className="bg-blue-50 p-2 rounded-lg">
                      <p className="text-xs text-blue-800">
                        📎 {arrayData.length - 1} öğrenci,{" "}
                        {(arrayData[0]?.length ?? 1) - 1} madde okundu
                      </p>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="pt-1">
                  <div className="flex flex-col sm:flex-row w-full gap-2.5">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full sm:w-1/2 text-sm"
                          disabled={arrayData.length === 0}
                        >
                          👁️ Önizle
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px] w-[95vw] sm:w-full">
                        <DialogHeader>
                          <DialogTitle className="text-base">Veri Önizleme</DialogTitle>
                          <DialogDescription className="text-xs">
                            Yüklediğiniz verinin önizlemesi
                          </DialogDescription>
                        </DialogHeader>
                        <TableContainer data={arrayData} />
                      </DialogContent>
                    </Dialog>
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      className="w-full sm:w-1/2 bg-blue-600 hover:bg-blue-700 text-white text-sm"
                    >
                      {saving ? "Yükleniyor..." : "💾 Yükle"}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            )}
          </div>
        </div>
      </div>

      <ToastContainer position="bottom-right" theme="dark" />
    </div>
  );
};

export default ExcelUploadPage;
