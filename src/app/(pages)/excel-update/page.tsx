"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { produce } from "immer";
import { ToastContainer, toast } from "react-toastify";
import { Input } from "@/components/ui/input";
import { ComboboxDemo } from "@/components/ui/comboboxForFolder";
import { apiGet, apiPut } from "@/lib/api-client";
import { analyzeExam, ANSWER_OPTIONS, type AnswerOption } from "@/features/analysis";
import { interpretReliability } from "@/features/reports/quality";
import { fmt } from "@/lib/format";
import type { ExamDetail } from "@/features/exams/types";
import {
  Card,
  GhostButton,
  PageHeader,
  PageShell,
  PrimaryButton,
  SectionTitle,
  StatTile,
} from "@/features/ui/primitives";

const LABELS: Record<AnswerOption, string> = {
  A: "A",
  B: "B",
  C: "C",
  D: "D",
  E: "E",
  BOS: "Boş",
};

export default function ExcelUpdate() {
  const router = useRouter();
  const examId = useSearchParams().get("exam");

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
        toast.error(error instanceof Error ? error.message : "Sınav yüklenemedi.", {
          theme: "dark",
        })
      );
  }, [examId]);

  /**
   * Canlı yeniden hesaplama.
   *
   * Analiz saf olduğu için her düzenlemede anında yeniden çalışıyor: cevap
   * anahtarındaki bir düzeltmenin güvenirliği nasıl değiştirdiği kaydetmeden
   * görülüyor. Eskiden değişikliğin etkisini görmek için kaydedip rapor
   * ekranına gitmek gerekiyordu.
   */
  const live = useMemo(() => {
    if (!detail || answerKey.length === 0) return null;
    return analyzeExam({
      answerKey,
      studentNames: detail.studentNames,
      responses,
    });
  }, [detail, answerKey, responses]);

  const dirty = useMemo(() => {
    if (!detail) return false;
    return (
      name !== detail.exam.name ||
      folderId !== detail.exam.folderId ||
      answerKey.join() !== detail.answerKey.join() ||
      responses.map((r) => r.join()).join("|") !==
        detail.responses.map((r) => r.join()).join("|")
    );
  }, [detail, name, folderId, answerKey, responses]);

  const setAnswer = useCallback(
    (row: number, question: number, value: AnswerOption) =>
      setResponses((prev) =>
        produce(prev, (draft) => {
          draft[row][question] = value;
        })
      ),
    []
  );

  const handleSave = async () => {
    if (!examId || !detail) return;
    setSaving(true);
    try {
      const matrix: unknown[][] = [
        ["Cevap Anahtarı", ...answerKey],
        ...detail.studentNames.map((student, index) => [student, ...responses[index]]),
      ];
      await apiPut(`/api/exams/${examId}`, { name, folderId, matrix });
      toast.success("Kaydedildi.", { theme: "dark" });
      router.push(`/excel-reports?exam=${examId}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Kaydedilemedi.", {
        theme: "dark",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!examId) {
    return (
      <PageShell>
        <p className="text-sm text-[var(--viz-text-secondary)]">Sınav seçilmedi.</p>
      </PageShell>
    );
  }

  if (!detail || !live) {
    return (
      <PageShell>
        <p className="text-sm text-[var(--viz-text-secondary)]">Yükleniyor...</p>
      </PageShell>
    );
  }

  const original = detail.analysis.reliability.kr20;
  const current = live.reliability.kr20;
  const changed =
    original !== null && current !== null && Math.abs(original - current) > 0.005;

  const select = (
    value: AnswerOption,
    onChange: (v: AnswerOption) => void,
    highlight?: boolean
  ) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as AnswerOption)}
      className={`w-16 rounded-md border px-1.5 py-1 text-sm bg-[var(--viz-surface-raised)] text-[var(--viz-text)] ${
        highlight
          ? "border-[var(--viz-series)]"
          : "border-black/10 dark:border-white/15"
      }`}
    >
      {ANSWER_OPTIONS.map((option) => (
        <option key={option} value={option}>
          {LABELS[option]}
        </option>
      ))}
    </select>
  );

  return (
    <PageShell>
      <PageHeader
        title={detail.exam.name}
        meta={`${detail.exam.studentCount} öğrenci · ${detail.exam.questionCount} madde`}
        actions={
          <>
            <GhostButton href={`/excel-reports?exam=${examId}`}>Rapora dön</GhostButton>
            <PrimaryButton onClick={handleSave} disabled={saving || !dirty}>
              {saving ? "Kaydediliyor..." : dirty ? "Kaydet" : "Değişiklik yok"}
            </PrimaryButton>
          </>
        }
      />

      {/* Canlı özet — düzenledikçe güncelleniyor */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <StatTile label="Ortalama" value={fmt(live.descriptive.mean, 1)} />
        <StatTile label="Std. sapma" value={fmt(live.descriptive.stdDeviation, 1)} />
        <StatTile
          label="KR-20"
          value={fmt(current)}
          hint={
            changed
              ? `kaydedilmiş: ${fmt(original)}`
              : interpretReliability(current).label
          }
        />
        <StatTile label="Başarı" value={`%${fmt(live.descriptive.successRate, 0)}`} />
      </div>

      <Card>
        <SectionTitle title="Sınav bilgileri" />
        <div className="grid gap-4 sm:grid-cols-2 max-w-2xl">
          <div>
            <label className="text-xs text-[var(--viz-text-secondary)]">Sınav adı</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-[var(--viz-text-secondary)]">Klasör</label>
            <div className="mt-1">
              <ComboboxDemo folderId={folderId} setFolderId={setFolderId} />
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <SectionTitle
          title="Cevaplar"
          hint="Doğru işaretlenen hücreler vurgulanır. Cevap anahtarı da düzenlenebilir."
        />

        <div className="overflow-auto max-h-[60vh] rounded-lg border border-black/5 dark:border-white/10">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-[var(--viz-surface)] z-10">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-[var(--viz-text-secondary)] whitespace-nowrap">
                  Öğrenci
                </th>
                {answerKey.map((_, index) => (
                  <th
                    key={index}
                    className="px-2 py-2 text-left font-medium text-[var(--viz-text-secondary)]"
                  >
                    M{index + 1}
                  </th>
                ))}
              </tr>
              <tr className="border-b border-black/10 dark:border-white/15">
                <th className="px-3 py-2 text-left text-xs font-medium text-[var(--viz-series)] whitespace-nowrap">
                  Cevap anahtarı
                </th>
                {answerKey.map((option, index) => (
                  <td key={index} className="px-2 py-2">
                    {select(
                      option,
                      (value) =>
                        setAnswerKey((prev) =>
                          produce(prev, (draft) => {
                            draft[index] = value;
                          })
                        ),
                      true
                    )}
                  </td>
                ))}
              </tr>
            </thead>
            <tbody>
              {responses.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="border-t border-black/5 dark:border-white/10"
                >
                  <td className="px-3 py-2 text-[var(--viz-text)] whitespace-nowrap">
                    {detail.studentNames[rowIndex]}
                    <span className="ml-2 text-xs text-[var(--viz-text-muted)]">
                      {live.students.scores[rowIndex]}/{answerKey.length}
                    </span>
                  </td>
                  {row.map((cell, questionIndex) => (
                    <td key={questionIndex} className="px-2 py-2">
                      {select(
                        cell,
                        (value) => setAnswer(rowIndex, questionIndex, value),
                        cell === answerKey[questionIndex]
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <ToastContainer position="bottom-right" theme="dark" />
    </PageShell>
  );
}
