"use client";

import { BarChart3, FileSpreadsheet, Save } from "lucide-react";
import { EmptyState, PageContainer, PageHeader, Section } from "@/components/app/page";
import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { produce } from "immer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ComboboxDemo } from "@/components/ui/comboboxForFolder";
import { ToastContainer, toast } from "react-toastify";
import { apiGet, apiPut } from "@/lib/api-client";
import { ANSWER_OPTIONS, type AnswerOption } from "@/features/analysis";
import type { ExamDetail } from "@/features/exams/types";

const OPTION_LABELS: Record<AnswerOption, string> = {
  A: "A",
  B: "B",
  C: "C",
  D: "D",
  E: "E",
  BOS: "Boş",
};

const ExcelUpdate = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const examId = searchParams.get("exam");

  const [detail, setDetail] = useState<ExamDetail | null>(null);
  const [name, setName] = useState("");
  const [folderId, setFolderId] = useState<string | undefined>();
  const [answerKey, setAnswerKey] = useState<AnswerOption[]>([]);
  const [responses, setResponses] = useState<AnswerOption[][]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!examId) return;
    apiGet<ExamDetail>(`/api/exams/${examId}`)
      .then((data) => {
        setDetail(data);
        setName(data.exam.name);
        setFolderId(data.exam.folderId);
        setAnswerKey(data.answerKey);
        setResponses(data.responses);
      })
      .catch((error) =>
        toast.error(
          error instanceof Error ? error.message : "Sınav yüklenemedi.",
          { theme: "dark" }
        )
      );
  }, [examId]);

  const handleAnswerChange = useCallback(
    (rowIndex: number, questionIndex: number, value: AnswerOption) => {
      setResponses((prev) =>
        produce(prev, (draft) => {
          draft[rowIndex][questionIndex] = value;
        })
      );
    },
    []
  );

  const handleKeyChange = useCallback(
    (questionIndex: number, value: AnswerOption) => {
      setAnswerKey((prev) =>
        produce(prev, (draft) => {
          draft[questionIndex] = value;
        })
      );
    },
    []
  );

  const handleSave = async () => {
    if (!examId || !detail) return;

    setSaving(true);
    try {
      // Sunucu ham matris bekliyor ve normalizasyonu kendisi yapıyor;
      // burada sadece aynı biçime geri çeviriyoruz.
      const matrix: unknown[][] = [
        ["Cevap Anahtarı", ...answerKey],
        ...detail.studentNames.map((studentName, index) => [
          studentName,
          ...responses[index],
        ]),
      ];

      await apiPut(`/api/exams/${examId}`, { name, folderId, matrix });
      toast.success("Değişiklikler kaydedildi.", { theme: "dark" });
      router.push(`/excel-reports?exam=${examId}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Kaydedilemedi.",
        { theme: "dark" }
      );
    } finally {
      setSaving(false);
    }
  };

  if (!examId) {
    return (
      <PageContainer>
        <EmptyState icon={FileSpreadsheet} title="Sınav seçilmedi" description="Düzenlemek için Klasörler sayfasından bir sınav seçin." />
      </PageContainer>
    );
  }

  if (!detail) {
    return (
      <PageContainer>
        <div className="h-40 animate-pulse rounded-xl border border-gray-200 bg-surface" />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Sınavı düzenle"
        title={detail.exam.name}
        description={`${detail.exam.studentCount} öğrenci · ${detail.exam.questionCount} madde · ${new Date(detail.exam.createdAt).toLocaleDateString("tr")}`}
        actions={
          <>
            <Button variant="outline" onClick={() => router.push(`/excel-reports?exam=${examId}`)}>
              <BarChart3 aria-hidden="true" />
              Rapora dön
            </Button>
            <Button onClick={handleSave} disabled={saving} className="bg-blue-600 text-white hover:bg-blue-700">
              <Save aria-hidden="true" />
              {saving ? "Kaydediliyor…" : "Değişiklikleri kaydet"}
            </Button>
          </>
        }
      />

      <Section title="Sınav bilgileri">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="folder" className="text-sm font-semibold text-gray-900">
              Klasör
            </label>
            <ComboboxDemo folderId={folderId} setFolderId={setFolderId} />
          </div>
          <div className="space-y-2">
            <label htmlFor="examName" className="text-sm font-semibold text-gray-900">
              Sınav adı
            </label>
            <Input id="examName" value={name} onChange={(e) => setName(e.target.value)} className="h-11" />
          </div>
        </div>
      </Section>

      <Section
        title="Cevaplar"
        description="Cevap anahtarıyla eşleşen yanıtlar mavi işaretlidir. Anahtar da bu tablodan düzenlenebilir."
        flush
      >
        <div className="max-h-[70vh] overflow-auto">
          <table className="w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr>
                <th className="sticky left-0 top-0 z-20 border-b border-gray-200 bg-gray-50 px-4 py-3 text-left font-semibold text-gray-700">
                  Öğrenci
                </th>
                {answerKey.map((_, index) => (
                  <th key={index} className="sticky top-0 z-10 border-b border-gray-200 bg-gray-50 px-2 py-3 text-center font-semibold text-gray-700">
                    M{index + 1}
                  </th>
                ))}
              </tr>
              <tr>
                <th className="sticky left-0 top-[45px] z-20 border-b border-gray-200 bg-blue-50 px-4 py-2 text-left font-semibold whitespace-nowrap text-blue-700">
                  Cevap anahtarı
                </th>
                {answerKey.map((option, index) => (
                  <td key={index} className="sticky top-[45px] z-10 border-b border-gray-200 bg-blue-50 px-1.5 py-2">
                    <AnswerSelect value={option} onChange={(value) => handleKeyChange(index, value)} label={`M${index + 1} cevap anahtarı`} strong />
                  </td>
                ))}
              </tr>
            </thead>
            <tbody>
              {responses.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-50">
                  <td className="sticky left-0 z-10 border-b border-gray-200 bg-surface px-4 py-2 font-medium whitespace-nowrap text-gray-900">
                    {detail.studentNames[rowIndex]}
                  </td>
                  {row.map((cell, questionIndex) => (
                    <td key={questionIndex} className="border-b border-gray-200 px-1.5 py-2">
                      <AnswerSelect
                        value={cell}
                        onChange={(value) => handleAnswerChange(rowIndex, questionIndex, value)}
                        label={`${detail.studentNames[rowIndex]}, M${questionIndex + 1}`}
                        correct={cell === answerKey[questionIndex]}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <ToastContainer position="bottom-right" />
    </PageContainer>
  );
};

function AnswerSelect({
  value,
  onChange,
  label,
  correct = false,
  strong = false,
}: {
  value: AnswerOption;
  onChange: (value: AnswerOption) => void;
  label: string;
  correct?: boolean;
  strong?: boolean;
}) {
  return (
    <Select value={value} onValueChange={(next) => onChange(next as AnswerOption)}>
      <SelectTrigger
        aria-label={label}
        className={`mx-auto h-9 w-16 justify-center gap-1 px-2 text-sm font-medium ${
          strong
            ? "border-blue-300 bg-surface text-blue-700"
            : correct
              ? "border-blue-300 bg-blue-50 text-blue-700"
              : "border-gray-200 bg-surface text-gray-700"
        }`}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ANSWER_OPTIONS.map((option) => (
          <SelectItem key={option} value={option} className="text-sm">
            {OPTION_LABELS[option]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default ExcelUpdate;
