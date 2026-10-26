/**
 * `ADMIN_EMAILS` listesindeki e-posta, Google'ın doğruladığı girişte ADMIN olur
 * (bkz. auth.ts). Parolalı kayıtta e-posta sahipliği doğrulanmadığı için
 * listeye bakılmaz; aksi hâlde listedeki adresle ilk kaydolan admin olurdu.
 */
const adminEmails = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return adminEmails.includes(email.toLowerCase());
}
