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

  const [hasFolder, setHasFolder] = useState<boolean | null>(null);
  const [matrix, setMatrix] = useState<unknown[][]>([]);
  const [fileName, setFileName] = useState("");
  const [folderId, setFolderId] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);

  // Oturum kontrolü YOK: middleware bu sayfaya oturumsuz erişimi zaten kesiyor.
  // Eskiden burada `/user-authentication` çağrısı ve `router.push("/login")`
  // vardı — koruma render'dan sonra çalıştığı için içerik bir an görünüyordu.
  useEffect(() => {
    apiGet<FolderSummary[]>("/api/folders")
      .then((folders) => setHasFolder(folders.length > 0))
      .catch(() => setHasFolder(false));
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const rows = await readExcelMatrix(file);
      if (rows.length < 2) {
        toast.error("Dosyada cevap anahtarı ve en az bir öğrenci satırı olmalı.", {
          theme: "dark",
        });
        return;
      }
      setMatrix(rows);
      setFileName(file.name.replace(/\.xlsx?$/i, ""));
    } catch (error) {
      console.error("Excel okunamadı:", error);
      toast.error("Dosya okunamadı. Geçerli bir .xlsx dosyası seçin.", {
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
    if (matrix.length === 0 || !folderId) {
      toast.error("Klasör seçin ve bir dosya yükleyin.", { theme: "dark" });
      return;
    }

    setSaving(true);
    try {
      const { id } = await apiPost<{ id: string }>("/api/exams", {
        folderId,
        name: fileName || "Adsız sınav",
        matrix,
      });
      toast.success("Yükleme başarılı.", { theme: "dark" });
      router.push(`/excel-reports?exam=${id}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Yükleme başarısız.",
        { theme: "dark" }
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
        alt=""
      />

      <div className="relative z-10 min-h-screen p-4 flex items-center justify-center">
        <div className="flex flex-col lg:flex-row gap-4 max-w-7xl w-full">
          <div className="w-full lg:w-1/2 flex flex-col items-center justify-center gap-6">
            <img src="/excel.svg" alt="" className="w-40 h-40 lg:w-56 lg:h-56" />
            <Button
              onClick={downloadSampleFile}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg shadow-md w-56"
            >
              📥 Örnek Dosya İndir
            </Button>
          </div>

          <div className="w-full lg:w-1/2 flex items-center justify-center">
            {hasFolder === false ? (
              <div className="bg-white/95 p-6 rounded-2xl shadow-md text-center w-full max-w-md">
                <p className="text-lg font-semibold text-gray-700">
                  📁 Henüz klasör yok
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Dosya yüklemeden önce Klasörler sayfasından bir klasör ekleyin.
                </p>
              </div>
            ) : (
              <Card className="w-full max-w-xl shadow-lg bg-white/95">
                <CardHeader className="space-y-1 pb-4">
                  <h1 className="text-xl font-bold text-center text-gray-800">
                    Excel Dosyası Yükle
                  </h1>
                  <p className="text-sm text-center text-gray-600">
                    Analiz etmek istediğiniz dosyayı seçin
                  </p>
                </CardHeader>

                <CardContent className="space-y-4">
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
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileUpload}
                      className="w-full border-2 border-dashed border-gray-300 rounded-lg p-3 hover:border-blue-500 transition-colors"
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
                    />
                  </div>

                  {matrix.length > 0 && (
                    <div className="bg-blue-50 p-2.5 rounded-lg">
                      <p className="text-sm text-blue-800">
                        📎 {matrix.length - 1} öğrenci, {(matrix[0]?.length ?? 1) - 1}{" "}
                        madde okundu
                      </p>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="pt-2">
                  <div className="flex flex-col sm:flex-row w-full gap-3">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full sm:w-1/2"
                          disabled={matrix.length === 0}
                        >
                          👁️ Önizle
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px] w-[95vw]">
                        <DialogHeader>
                          <DialogTitle>Veri Önizleme</DialogTitle>
                          <DialogDescription>
                            Yüklediğiniz verinin önizlemesi
                          </DialogDescription>
                        </DialogHeader>
                        <TableContainer data={matrix} />
                      </DialogContent>
                    </Dialog>
                    <Button
                      onClick={handleSave}
                      disabled={saving || matrix.length === 0 || !folderId}
                      className="w-full sm:w-1/2 bg-blue-600 hover:bg-blue-700 text-white"
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
