"use client";

import { Pencil } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";

import { PageContainer } from "@/components/app/page";
import { Button } from "@/components/ui/button";
import type { ExamDetail } from "@/features/exams/types";
import { ExamReport, Panel } from "@/features/reports/ExamReport";
import { apiGet } from "@/lib/api-client";

/** Kayıtlı bir sınavın raporu; rapor gövdesi girişsiz denemeyle ortak (`ExamReport`). */
export default function ExcelReports() {
  const examId = useSearchParams().get("exam");

  const [detail, setDetail] = useState<ExamDetail | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!examId) {
      setLoadingData(false);
      return;
    }
    apiGet<ExamDetail>(`/api/exams/${examId}`)
      .then(setDetail)
      .catch((error) =>
        toast.error(error instanceof Error ? error.message : "Rapor yüklenemedi.", {
          position: "bottom-right",
        })
      )
      .finally(() => setLoadingData(false));
  }, [examId]);

  const shell = (children: React.ReactNode) => (
    <PageContainer>
      {children}
      <ToastContainer position="bottom-right" />
    </PageContainer>
  );

  if (loadingData) {
    return shell(
      <Panel>
        <p className="text-sm text-gray-600">Yükleniyor...</p>
      </Panel>
    );
  }

  if (!examId || !detail) {
    return shell(
      <Panel className="text-center">
        <p className="text-base font-semibold text-gray-700">Rapor görüntülemek için bir sınav seçin</p>
        <Link href="/folders" className="mt-3 inline-block text-sm text-blue-600 hover:underline">
          Klasörlere git
        </Link>
      </Panel>
    );
  }

  const { exam } = detail;

  return shell(
    <ExamReport
      analysis={detail.analysis}
      studentNames={detail.studentNames}
      answerKey={detail.answerKey}
      responses={detail.responses}
      title={exam.name}
      examDate={exam.createdAt}
      meta={`${exam.studentCount} öğrenci · ${exam.questionCount} madde · ${new Date(exam.createdAt).toLocaleDateString("tr")}`}
      actions={
        <Link href={`/excel-update?exam=${exam.id}`}>
          <Button variant="outline" className="text-sm">
            <Pencil aria-hidden="true" />
            Düzenle
          </Button>
        </Link>
      }
    />
  );
}
