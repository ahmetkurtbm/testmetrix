import "server-only";
import { createHash, randomBytes } from "node:crypto";

/**
 * Şifre sıfırlama token'ları.
 *
 * Ham token yalnızca e-postaya gider ve hiçbir yerde saklanmaz; veritabanına
 * SHA-256 hash'i yazılır. Böylece veritabanı sızsa bile token'lar geri
 * üretilemez (tıpkı parolaların hash'lenmesi gibi, ama burada tek yönlü hash
 * bcrypt kadar yavaş olmasa da yeterli — token zaten yüksek entropili ve
 * kaba kuvvetle denenecek kadar kısa sürede geçerliliğini yitiriyor).
 */
const TOKEN_TTL_MS = 30 * 60 * 1000; // 30 dakika

export function generateResetToken(): { token: string; tokenHash: string; expiresAt: Date } {
  const token = randomBytes(32).toString("base64url");
  return {
    token,
    tokenHash: hashResetToken(token),
    expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
  };
}

export function hashResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
