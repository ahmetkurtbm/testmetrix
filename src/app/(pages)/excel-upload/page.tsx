"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { saveAs } from "file-saver";
import { ToastContainer, toast } from "react-toastify";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import TableContainer from "@/app/(components)/TableContainer";
import { ComboboxDemo } from "@/components/ui/comboboxForFolder";
import { apiGet, apiPost } from "@/lib/api-client";
import { readExcelMatrix } from "@/features/exams/read-excel";
import { analyzeExam, parseExamMatrix } from "@/features/analysis";
import { classifyItems, interpretReliability } from "@/features/reports/quality";
import { fmt } from "@/lib/format";
import type { FolderSummary } from "@/features/exams/types";
import {
  Card,
  EmptyState,
  GhostButton,
  PageHeader,
  PageShell,
  PrimaryButton,
  SectionTitle,
  StatTile,
} from "@/features/ui/primitives";

export default function ExcelUploadPage() {
  const router = useRouter();

  const [folders, setFolders] = useState<FolderSummary[] | null>(null);
  const [matrix, setMatrix] = useState<unknown[][]>([]);
  const [fileName, setFileName] = useState("");
  const [folderId, setFolderId] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    apiGet<FolderSummary[]>("/api/folders")
      .then(setFolders)
      .catch(() => setFolders([]));
  }, []);

  /**
   * Kaydetmeden önce ön analiz.
   *
   * Analiz modülleri saf olduğu için aynı hesap tarayıcıda da çalışabiliyor:
   * kullanıcı dosyanın doğru okunup okunmadığını kaydetmeden görüyor. Yanlış
   * sütun düzeni ya da bozuk cevap anahtarı burada fark ediliyor.
   */
  const preview = useMemo(() => {
    if (matrix.length < 2) return null;
    const data = parseExamMatrix(matrix);
    if (data.answerKey.length === 0 || data.studentNames.length === 0) return null;
    const analysis = analyzeExam(data);
    return { data, analysis, items: classifyItems(analysis) };
  }, [matrix]);

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
    } catch {
      toast.error("Dosya okunamadı. Geçerli bir .xlsx dosyası seçin.", {
        theme: "dark",
      });
    }
  };

  const handleSave = async () => {
    if (!preview || !folderId) return;
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
      toast.error(error instanceof Error ? error.message : "Yükleme başarısız.", {
        theme: "dark",
      });
    } finally {
      setSaving(false);
    }
  };

  const downloadSample = async () => {
    const response = await fetch("/sample.xlsx");
    saveAs(
      new Blob([await response.arrayBuffer()], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      "Ornek_Dosya.xlsx"
    );
  };

  if (folders !== null && folders.length === 0) {
    return (
      <PageShell>
        <PageHeader title="Sınav yükle" />
        <Card>
          <EmptyState
            icon="📁"
            title="Önce bir klasör oluşturun"
            body="Sınavlar klasörlerin içinde saklanır."
            action={{ href: "/folders", label: "Klasörlere git" }}
          />
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader
        title="Sınav yükle"
        meta="İlk satır cevap anahtarı, sonraki satırlar öğrenciler olmalı."
        actions={<GhostButton onClick={downloadSample}>Örnek dosya indir</GhostButton>}
      />

      <Card>
        <SectionTitle title="Dosya ve klasör" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs">1. Klasör seçin</Label>
            <ComboboxDemo folderId={folderId} setFolderId={setFolderId} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">2. Excel dosyası</Label>
            <Input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFile}
              className="text-sm"
            />
          </div>
        </div>

        {matrix.length > 0 && (
          <div className="mt-4 space-y-1.5">
            <Label className="text-xs">3. Sınav adı</Label>
            <Input
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Örn. 8. Sınıf Matematik 1. Dönem"
              className="text-sm max-w-md"
            />
          </div>
        )}
      </Card>

      {matrix.length > 0 && !preview && (
        <Card>
          <p className="text-sm text-[var(--viz-accent)]">
            Dosya okundu ama geçerli bir cevap anahtarı veya öğrenci satırı
            bulunamadı. İlk satırın cevap anahtarı, ilk sütunun öğrenci adı
            olduğundan emin olun.
          </p>
        </Card>
      )}

      {preview && (
        <>
          <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
            <StatTile
              label="Öğrenci"
              value={String(preview.data.studentNames.length)}
            />
            <StatTile label="Madde" value={String(preview.data.answerKey.length)} />
            <StatTile
              label="Ortalama"
              value={fmt(preview.analysis.descriptive.mean, 1)}
            />
            <StatTile
              label="KR-20"
              value={fmt(preview.analysis.reliability.kr20)}
              hint={interpretReliability(preview.analysis.reliability.kr20).label}
            />
          </div>

          <Card>
            <SectionTitle
              title="Kaydetmeden önce kontrol"
              hint="Bu değerler tarayıcınızda hesaplandı; dosya henüz kaydedilmedi."
            />

            <div className="space-y-2 text-sm">
              <p className="text-[var(--viz-text-secondary)]">
                Cevap anahtarı:{" "}
                <span
                  className="text-[var(--viz-text)] font-medium"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {preview.data.answerKey.join(" ")}
                </span>
              </p>

              {preview.items.filter((i) => i.needsAttention).length > 0 && (
                <p className="text-[var(--viz-text-secondary)]">
                  <span style={{ color: "var(--viz-accent)" }}>
                    {preview.items.filter((i) => i.needsAttention).length} madde
                  </span>{" "}
                  gözden geçirilmeli — ayrıntı rapor ekranında.
                </p>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <PrimaryButton onClick={handleSave} disabled={saving || !folderId}>
                {saving ? "Yükleniyor..." : "Kaydet ve raporu aç"}
              </PrimaryButton>
              <GhostButton onClick={() => setShowPreview((p) => !p)}>
                {showPreview ? "Tabloyu gizle" : "Ham veriyi göster"}
              </GhostButton>
            </div>

            {!folderId && (
              <p className="mt-2 text-xs text-[var(--viz-accent)]">
                Kaydetmek için önce bir klasör seçin.
              </p>
            )}

            {showPreview && (
              <div className="mt-4">
                <TableContainer data={matrix} />
              </div>
            )}
          </Card>
        </>
      )}

      <ToastContainer position="bottom-right" theme="dark" />
    </PageShell>
  );
}
