import { z } from "zod";

/**
 * Kimlik doğrulama istekleri için doğrulama şemaları.
 *
 * `z.string()` bir NoSQL/JSON enjeksiyon nesnesini kabul etmez — eski Express
 * backend'inde `{"email": {"$gt": ""}}` gibi bir gövdeyle sorgu manipüle
 * edilebiliyordu; zod bu sınıfın tamamını girişte eler.
 */

const email = z.string().trim().toLowerCase().email("Geçerli bir e-posta girin.");

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Ad en az 2 karakter olmalı.").max(120),
  email,
  // Güç kontrolü burada değil `validatePasswordStrength` ile ayrı yapılıyor:
  // zod tek bir hata mesajı seçer, biz hangi kuralın ihlal edildiğini
  // kullanıcıya söylemek istiyoruz.
  password: z.string().min(1, "Parola gerekli."),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Parola gerekli."),
});

export const requestResetSchema = z.object({
  email,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(1, "Parola gerekli."),
});
