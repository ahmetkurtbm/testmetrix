/**
 * Otomatik yönetici ataması.
 *
 * `ADMIN_EMAILS` listesindeki bir e-posta kayıt olduğunda ya da giriş
 * yaptığında ADMIN rolü alır. Kayıt tamamen herkese açık olduğu için bu,
 * "ilk kullanıcı otomatik admin olsun" gibi kırılgan bir kurala değil, sabit
 * bir listeye dayanıyor — GateHub'daki `adminUserIds` deseninin aynısı.
 *
 * Yalnızca hesap İLK OLUŞTURULURKEN uygulanır (bkz. auth.ts, prisma.ts).
 * Sonradan panelden değiştirilen roller asla otomatik ezilmez.
 */
const adminEmails = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return adminEmails.includes(email.toLowerCase());
}
