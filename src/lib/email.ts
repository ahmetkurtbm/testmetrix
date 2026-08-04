import "server-only";
import { Resend } from "resend";

/**
 * Şifre sıfırlama e-postası.
 *
 * Eski projenin backend'inde bu iş Nodemailer + kod içine gömülü bir Gmail
 * uygulama şifresiyle yapılıyordu — o şifre GitHub'a sızmıştı. Resend API
 * anahtarla çalışır, koda hiçbir gizli değer gömülmez.
 *
 * `RESEND_API_KEY` yoksa (yerel geliştirmede unutulmuş olabilir) hata
 * fırlatmak yerine konsola yazıp devam ediyoruz — sıfırlama akışını manuel
 * test ederken linki terminalden kopyalayabilmek için.
 */
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM = process.env.RESEND_FROM_EMAIL ?? "TestMetrix <onboarding@resend.dev>";

export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetUrl: string
): Promise<void> {
  if (!resend) {
    console.warn(
      `[email] RESEND_API_KEY tanımlı değil. Sıfırlama bağlantısı (${email}):`,
      resetUrl
    );
    return;
  }

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "TestMetrix — Şifre Sıfırlama",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Merhaba ${escapeHtml(name)},</h2>
        <p>TestMetrix hesabınız için bir şifre sıfırlama isteği aldık. Aşağıdaki
        bağlantıya tıklayarak yeni bir şifre belirleyebilirsiniz. Bağlantı
        30 dakika geçerlidir.</p>
        <p style="margin: 24px 0;">
          <a href="${resetUrl}" style="background:#2563eb;color:#fff;padding:10px 20px;
             border-radius:6px;text-decoration:none;display:inline-block;">
            Şifremi Sıfırla
          </a>
        </p>
        <p style="color:#6b7280;font-size:13px;">
          Bu isteği siz yapmadıysanız bu e-postayı yok sayabilirsiniz;
          şifreniz değişmeyecektir.
        </p>
      </div>
    `,
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
