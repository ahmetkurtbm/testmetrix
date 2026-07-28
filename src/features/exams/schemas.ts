import { z } from "zod";

/**
 * İstek gövdesi doğrulama şemaları.
 *
 * Eski backend'de hiçbir doğrulama yoktu: `role` doğrudan gövdeden okunup
 * kaydediliyordu (herkes kendini yönetici yapabiliyordu), alan uzunlukları
 * sınırsızdı, ve `User.findOne({ email })` çağrısına `{"$gt": ""}` gibi bir
 * nesne geçirilerek NoSQL operatör enjeksiyonu yapılabiliyordu.
 *
 * Buradaki şemalar tip daraltmayı zorunlu kılar: `z.string()` bir nesneyi
 * kabul etmez.
 */

const trimmedName = z
  .string()
  .trim()
  .min(1, "Ad boş olamaz")
  .max(120, "Ad en fazla 120 karakter olabilir");

export const createFolderSchema = z.object({
  name: trimmedName,
});

export const renameFolderSchema = z.object({
  name: trimmedName,
});

export const reorderFoldersSchema = z.object({
  folderIds: z.array(z.string().min(1)).max(500),
});

// Yükleme boyutu sınırları. Eski sürümde sınır yoktu ve 16MB'lık tek bir JSON
// belgesi yazılmaya çalışılıyordu.
const MAX_STUDENTS = 2000;
const MAX_QUESTIONS = 300;

export const createExamSchema = z.object({
  folderId: z.string().min(1),
  name: trimmedName,
  /**
   * Ham Excel matrisi. Normalizasyon bilerek SUNUCUDA yapılır
   * (`parseExamMatrix`); istemciden gelen "temizlenmiş" veriye güvenilmez.
   */
  matrix: z
    .array(z.array(z.unknown()).max(MAX_QUESTIONS + 1))
    .min(2, "Dosyada cevap anahtarı ve en az bir öğrenci satırı olmalı")
    .max(MAX_STUDENTS + 1),
});

export const updateProfileSchema = z.object({
  university: z.string().trim().max(160).nullish(),
  phone: z.string().trim().max(32).nullish(),
  kvkkAccepted: z.boolean().optional(),
  // `role` bilerek YOK: sunucu tarafında atanır, istemciden hiç okunmaz.
});
