"use client";

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
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Sınav seçilmedi.</p>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="space-y-6 max-w-[1400px] mx-auto">
        <div className="bg-white/80 backdrop-blur-sm shadow-sm rounded-xl p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="space-y-1">
              <h1 className="text-xl font-semibold text-gray-800">
                {detail.exam.name}
              </h1>
              <p className="text-sm text-gray-500">
                {detail.exam.studentCount} öğrenci · {detail.exam.questionCount}{" "}
                madde · {new Date(detail.exam.createdAt).toLocaleString("tr")}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <ComboboxDemo folderId={folderId} setFolderId={setFolderId} />
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-gray-200"
                placeholder="Sınav adı"
              />
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium whitespace-nowrap"
              >
                {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm shadow-sm rounded-xl overflow-hidden">
          <div className="overflow-x-auto max-h-[calc(100vh-16rem)]">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-4 text-left font-semibold text-gray-700 text-sm sticky top-0 bg-gray-50/95 backdrop-blur-sm">
                    Öğrenci
                  </th>
                  {answerKey.map((_, index) => (
                    <th
                      key={index}
                      className="p-4 text-left font-semibold text-gray-700 text-sm sticky top-0 bg-gray-50/95 backdrop-blur-sm whitespace-nowrap"
                    >
                      M{index + 1}
                    </th>
                  ))}
                </tr>
                {/* Cevap anahtarı da düzenlenebilir: eskiden salt okunur başlıktı,
                    anahtarda hata varsa dosyayı yeniden yüklemek gerekiyordu. */}
                <tr className="bg-amber-50 border-b border-amber-200">
                  <th className="p-3 text-left text-sm font-semibold text-amber-900 whitespace-nowrap">
                    Cevap Anahtarı
                  </th>
                  {answerKey.map((option, index) => (
                    <td key={index} className="p-3">
                      <Select
                        value={option}
                        onValueChange={(value) =>
                          handleKeyChange(index, value as AnswerOption)
                        }
                      >
                        <SelectTrigger className="w-24 p-2 text-sm bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ANSWER_OPTIONS.map((value) => (
                            <SelectItem key={value} value={value} className="text-sm">
                              {OPTION_LABELS[value]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                  ))}
                </tr>
              </thead>
              <tbody>
                {responses.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="border-b border-gray-100 hover:bg-gray-50/50"
                  >
                    <td className="p-4">
                      <span className="text-sm text-gray-700 font-medium whitespace-nowrap">
                        {detail.studentNames[rowIndex]}
                      </span>
                    </td>
                    {row.map((cell, questionIndex) => (
                      <td key={questionIndex} className="p-4">
                        <Select
                          value={cell}
                          onValueChange={(value) =>
                            handleAnswerChange(
                              rowIndex,
                              questionIndex,
                              value as AnswerOption
                            )
                          }
                        >
                          <SelectTrigger
                            className={`w-24 p-2 text-sm ${
                              cell === answerKey[questionIndex]
                                ? "border-green-300 bg-green-50"
                                : "border-gray-200"
                            }`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ANSWER_OPTIONS.map((value) => (
                              <SelectItem
                                key={value}
                                value={value}
                                className="text-sm"
                              >
                                {OPTION_LABELS[value]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ToastContainer position="bottom-right" theme="dark" />
    </div>
  );
};

export default ExcelUpdate;
