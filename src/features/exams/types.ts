import type { AnswerOption, ExamAnalysis } from "@/features/analysis";

/**
 * API yanıt tipleri — sayfalar ile route handler'lar arasındaki sözleşme.
 *
 * Eski kodda her sayfa kendi `interface File { file_data: string[][] }` tanımını
 * yazıyordu ve alan adları (`_id`, `folder_name`, `file_name`) yerden yere
 * değişiyordu. Tek yerde tanımlı olunca yeniden adlandırma derleme hatası verir.
 */

export type FolderSummary = {
  id: string;
  name: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  _count: { exams: number };
};

export type ExamSummary = {
  id: string;
  name: string;
  folderId: string;
  questionCount: number;
  studentCount: number;
  createdAt: string;
  /** Önbellekten gelen özet; hesaplanamayan değerler `null`. */
  stat: {
    mean: number;
    kr20: number | null;
    successRate: number | null;
  } | null;
};

export type ExamDetail = {
  exam: {
    id: string;
    name: string;
    folderId: string;
    questionCount: number;
    studentCount: number;
    createdAt: string;
  };
  studentNames: string[];
  answerKey: AnswerOption[];
  /** n × k ham yanıt matrisi (düzenleme ekranı için). */
  responses: AnswerOption[][];
  analysis: ExamAnalysis;
};

export type Profile = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  university: string | null;
  phone: string | null;
  role: "ADMIN" | "TEACHER" | "STUDENT";
  kvkkAcceptedAt: string | null;
};
