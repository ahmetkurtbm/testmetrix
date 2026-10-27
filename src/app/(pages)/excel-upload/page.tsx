"use client";

import { CheckCircle2, Download, Eye, FileSpreadsheet, FolderOpen, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";
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
import { EmptyState, PageContainer, PageHeader, Section } from "@/components/app/page";
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

  const studentCount = Math.max(0, arrayData.length - 1);
  const questionCount = Math.max(0, (arrayData[0]?.length ?? 1) - 1);

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Yeni sınav"
        title="Sınav yükle"
        description="Excel dosyanızı seçin; analiz kayıttan hemen sonra hazır olur."
      />

      {isFolder === false ? (
        <EmptyState
          icon={FolderOpen}
          title="Önce bir klasör oluşturun"
          description="Sınavlar klasörlerde saklanır. Klasörler sayfasından bir klasör ekleyip buraya dönün."
          action={
            <Button onClick={() => router.push("/folders")}>
              <FolderOpen aria-hidden="true" />
              Klasörlere git
            </Button>
          }
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <Section title="Sınav bilgileri">
            <ol className="space-y-6">
              <li>
                <StepLabel number={1} htmlFor="folder">Klasör</StepLabel>
                <ComboboxDemo folderId={folderId} setFolderId={setFolderId} />
              </li>

              <li>
                <StepLabel number={2} htmlFor="fileUpload">Excel dosyası</StepLabel>
                <label
                  htmlFor="fileUpload"
                  className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-8 text-center transition-colors hover:border-blue-500"
                >
                  <FileSpreadsheet aria-hidden="true" className="h-8 w-8 text-blue-600" />
                  <span className="text-sm font-medium text-gray-900">
                    {arrayData.length > 0 ? "Başka bir dosya seçin" : "Dosya seçmek için tıklayın"}
                  </span>
                  <span className="text-xs text-gray-500">.xlsx veya .xls</span>
                  <input id="fileUpload" type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="sr-only" />
                </label>
                {arrayData.length > 0 && (
                  <p className="mt-3 flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700">
                    <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
                    {studentCount} öğrenci, {questionCount} madde okundu
                  </p>
                )}
              </li>

              <li>
                <StepLabel number={3} htmlFor="examName">Sınav adı</StepLabel>
                <Input
                  id="examName"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="Örn. 8. Sınıf Matematik 1. Dönem"
                  className="h-11"
                />
              </li>
            </ol>

            <div className="mt-8 flex flex-col gap-2 border-t border-gray-200 pt-5 sm:flex-row sm:justify-end">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" disabled={arrayData.length === 0}>
                    <Eye aria-hidden="true" />
                    Önizle
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] sm:max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Veri önizleme</DialogTitle>
                    <DialogDescription>Dosyadan okunan ilk satırlar</DialogDescription>
                  </DialogHeader>
                  <TableContainer data={arrayData} />
                </DialogContent>
              </Dialog>
              <Button onClick={handleSave} disabled={saving} className="bg-blue-600 text-white hover:bg-blue-700">
                <Upload aria-hidden="true" />
                {saving ? "Yükleniyor…" : "Yükle ve analiz et"}
              </Button>
            </div>
          </Section>

          <Section title="Dosya biçimi" description="İlk satır cevap anahtarı, sonraki her satır bir öğrenci.">
            <div className="overflow-hidden rounded-lg border border-gray-200 text-xs">
              <table className="w-full tabular-nums">
                <tbody>
                  {[
                    ["Cevap_Anahtarı", "A", "C", "B", "D"],
                    ["Ayşe Yılmaz", "A", "C", "D", "D"],
                    ["Mehmet Kaya", "B", "C", "B", ""],
                  ].map((row, i) => (
                    <tr key={i} className={i === 0 ? "bg-blue-50 font-semibold text-blue-700" : "border-t border-gray-200 text-gray-700"}>
                      {row.map((cell, j) => (
                        <td key={j} className={`px-2 py-1.5 ${j === 0 ? "text-left" : "text-center"}`}>
                          {cell || "–"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              <li>Şıklar A–E; boş bırakılan cevap için hücreyi boş bırakın ya da “-” yazın.</li>
              <li>Cevap anahtarında boş soru varsa dosya reddedilir.</li>
            </ul>
            <Button variant="outline" onClick={downloadSampleFile} className="mt-5 w-full">
              <Download aria-hidden="true" />
              Örnek dosyayı indir
            </Button>
          </Section>
        </div>
      )}

      <ToastContainer position="bottom-right" />
    </PageContainer>
  );
};

function StepLabel({ number, htmlFor, children }: { number: number; htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-2 flex items-center gap-2.5 text-sm font-semibold text-gray-900">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs text-white">{number}</span>
      {children}
    </label>
  );
}

export default ExcelUploadPage;
