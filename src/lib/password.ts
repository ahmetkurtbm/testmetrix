import "server-only";
import bcrypt from "bcryptjs";

/**
 * Parola hashleme ve doğrulama.
 *
 * bcrypt cost 12: GateHub'ın kullandığı ve modern donanımda ~250ms süren,
 * kaba kuvvete karşı yeterli maliyet.
 */
const BCRYPT_COST = 12;

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_COST);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Parola güç kontrolü.
 *
 * GateHub'ın kuralıydı (min 12 + büyük/küçük harf + rakam); burada da aynısı
 * korunuyor — kendi kimlik sistemimiz artık bu sorumluluğu üstleniyor.
 */
export function validatePasswordStrength(password: string): string | null {
  if (password.length < 12) return "Parola en az 12 karakter olmalı.";
  if (!/[a-z]/.test(password)) return "Parola en az bir küçük harf içermeli.";
  if (!/[A-Z]/.test(password)) return "Parola en az bir büyük harf içermeli.";
  if (!/\d/.test(password)) return "Parola en az bir rakam içermeli.";
  if (password.length > 128) return "Parola en fazla 128 karakter olabilir.";
  return null;
}
