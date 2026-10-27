"use client";

import { FileSpreadsheet, Lock, Play } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  analyzeExam,
  answerKeyError,
  parseExamMatrix,
  type ExamAnalysis,
  type ExamData,
} from "@/features/analysis";
import { SAMPLE_EXAM_MATRIX } from "@/features/analysis/sample-exam";
import { readExcelMatrix } from "@/features/exams/read-excel";
import { ExamReport } from "@/features/reports/ExamReport";

/**
 * Girişsiz deneme.
 *
 * Analiz modülleri saf olduğu için (React yok, ağ yok, veritabanı yok) tüm
 * hesap tarayıcıda çalışabiliyor: seçilen dosya sunucuya hiç gitmiyor.
 * Kullanılan `parseExamMatrix` ve `analyzeExam`, giriş yapıldığında sunucuda
 * çalışanların birebir aynısı; rapor da kayıtlı sınav ekranıyla aynı bileşen.
 */
type Result = { data: ExamData; analysis: ExamAnalysis; title: string; meta: string };

export function DemoAnalyzer() {
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const show = (data: ExamData, title: string) => {
    setResult({
      data,
      analysis: analyzeExam(data),
      title,
      meta: `${data.studentNames.length} öğrenci · ${data.answerKey.length} madde · kaydedilmedi`,
    });
  };

  const runSample = () => {
    setError(null);
    show(parseExamMatrix(SAMPLE_EXAM_MATRIX), "Örnek sınav");
  };

  const runFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setBusy(true);
    setError(null);
    try {
      const data = parseExamMatrix(await readExcelMatrix(file));
      if (data.answerKey.length === 0 || data.studentNames.length === 0) {
        setError("Dosya okunamadı. İlk satır cevap anahtarı, sonraki satırlar öğrenciler olmalı.");
        return;
      }
      const keyError = answerKeyError(data.answerKey);
      if (keyError) {
        setError(keyError);
        return;
      }
      show(data, file.name.replace(/\.xlsx?$/i, ""));
    } catch {
      setError("Dosya okunamadı. Geçerli bir .xlsx dosyası seçin.");
    } finally {
      setBusy(false);
      event.target.value = "";
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-gray-200 bg-surface p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button onClick={runSample} className="bg-blue-600 text-white hover:bg-blue-700">
            <Play aria-hidden="true" />
            Örnek veriyle çalıştır
          </Button>

          <label className="flex flex-1 cursor-pointer items-center gap-3 rounded-md border border-dashed border-gray-300 px-4 py-2.5 text-sm text-gray-600 transition-colors hover:border-blue-500 hover:text-gray-900">
            <FileSpreadsheet aria-hidden="true" className="h-4 w-4 shrink-0" />
            <span>{busy ? "Okunuyor…" : "Kendi Excel dosyanızı seçin (.xlsx)"}</span>
            <input type="file" accept=".xlsx,.xls" onChange={runFile} disabled={busy} className="sr-only" />
          </label>
        </div>

        <p className="mt-3 flex items-center gap-1.5 text-xs text-gray-500">
          <Lock aria-hidden="true" className="h-3.5 w-3.5" />
          Seçtiğiniz dosya sunucuya gönderilmez; hesaplama ve raporlar tamamen tarayıcınızda üretilir.
        </p>

        {error && (
          <p role="alert" className="mt-3 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>

      {result && (
        <ExamReport
          analysis={result.analysis}
          studentNames={result.data.studentNames}
          answerKey={result.data.answerKey}
          responses={result.data.responses}
          title={result.title}
          meta={result.meta}
        />
      )}
    </div>
  );
}
