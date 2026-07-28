"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { analyzeExam, parseExamMatrix, type ExamAnalysis } from "@/features/analysis";
import { SAMPLE_EXAM_MATRIX } from "@/features/analysis/sample-exam";
import { readExcelMatrix } from "@/features/exams/read-excel";

/**
 * Girişsiz deneme.
 *
 * Analiz modülleri saf olduğu için (React yok, ağ yok, veritabanı yok) tüm
 * hesap tarayıcıda çalışabiliyor: seçilen dosya sunucuya hiç gitmiyor.
 * Kullanılan `parseExamMatrix` ve `analyzeExam`, giriş yapıldığında sunucuda
 * çalışanların birebir aynısı — yani buradaki sonuçlar temsilî değil, gerçek.
 */
const fmt = (value: number | null, digits = 2) =>
  value === null || !Number.isFinite(value) ? "—" : value.toFixed(digits);

export function DemoAnalyzer() {
  const [analysis, setAnalysis] = useState<ExamAnalysis | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const runSample = () => {
    setError(null);
    setAnalysis(analyzeExam(parseExamMatrix(SAMPLE_EXAM_MATRIX)));
    setSource("Örnek sınav (12 öğrenci, 10 madde)");
  };

  const runFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setBusy(true);
    setError(null);
    try {
      const matrix = await readExcelMatrix(file);
      const data = parseExamMatrix(matrix);
      if (data.answerKey.length === 0 || data.studentNames.length === 0) {
        setError(
          "Dosya okunamadı. İlk satır cevap anahtarı, sonraki satırlar öğrenciler olmalı."
        );
        return;
      }
      setAnalysis(analyzeExam(data));
      setSource(
        `${file.name} — ${data.studentNames.length} öğrenci, ${data.answerKey.length} madde`
      );
    } catch {
      setError("Dosya okunamadı. Geçerli bir .xlsx dosyası seçin.");
    } finally {
      setBusy(false);
      event.target.value = "";
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={runSample}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Örnek veriyle çalıştır
        </Button>

        <label className="flex-1">
          <span className="sr-only">Kendi dosyanı dene</span>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={runFile}
            disabled={busy}
            className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-gray-200 file:px-4 file:py-2 file:text-sm file:font-medium hover:file:bg-gray-300 cursor-pointer"
          />
        </label>
      </div>

      <p className="text-xs text-gray-500">
        🔒 Seçtiğiniz dosya sunucuya gönderilmez; hesaplama tamamen tarayıcınızda
        yapılır.
      </p>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {analysis && (
        <div className="space-y-5 border-t pt-5">
          <p className="text-sm font-medium text-gray-700">{source}</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Ortalama", value: fmt(analysis.descriptive.mean) },
              { label: "Std. Sapma", value: fmt(analysis.descriptive.stdDeviation) },
              { label: "KR-20", value: fmt(analysis.reliability.kr20) },
              { label: "Başarı %", value: fmt(analysis.descriptive.successRate) },
            ].map((item) => (
              <div key={item.label} className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500">{item.label}</div>
                <div className="text-lg font-semibold text-gray-900">
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-600">
                  <th className="py-2 pr-4 font-medium">Madde</th>
                  <th className="py-2 pr-4 font-medium">Güçlük (p)</th>
                  <th className="py-2 pr-4 font-medium">Ayırt Edicilik</th>
                  <th className="py-2 pr-4 font-medium">r<sub>pbis</sub></th>
                  <th className="py-2 font-medium">Yorum</th>
                </tr>
              </thead>
              <tbody>
                {analysis.items.difficulty.map((difficulty, index) => (
                  <tr key={index} className="border-b last:border-0">
                    <td className="py-2 pr-4 font-medium">M{index + 1}</td>
                    <td className="py-2 pr-4">{fmt(difficulty)}</td>
                    <td className="py-2 pr-4">
                      {fmt(analysis.items.discrimination[index])}
                    </td>
                    <td className="py-2 pr-4">{fmt(analysis.items.prbis[index])}</td>
                    <td className="py-2 text-gray-600">
                      {comment(difficulty, analysis.items.discrimination[index])}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/** Madde için kısa yorum. Klasik test kuramında yaygın eşikler. */
function comment(difficulty: number, discrimination: number): string {
  if (discrimination < 0.2) return "Ayırt ediciliği düşük — gözden geçirin";
  if (difficulty > 0.9) return "Çok kolay";
  if (difficulty < 0.3) return "Çok zor";
  if (discrimination >= 0.4) return "İyi madde";
  return "Kabul edilebilir";
}
