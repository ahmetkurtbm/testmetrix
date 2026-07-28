import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe Auth.js yapılandırması.
 *
 * `middleware.ts` edge runtime'da çalışır ve Prisma'yı oraya sokamayız; bu yüzden
 * yapılandırma ikiye bölünmüştür: veritabanına dokunmayan kısım burada,
 * `app_user` upsert'ü yapan `signIn` callback'i `src/auth.ts`'te.
 */

const issuer = process.env.GATEHUB_ISSUER ?? "http://localhost:3000/api/auth";

const allowedEmails = (process.env.ALLOWED_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

/**
 * Erişim listesi kontrolü.
 *
 * Liste boşsa **kimse giremez** (fail closed). Ortam değişkeni unutulduğunda
 * uygulamanın herkese açılması, kilitlenmesinden çok daha kötü bir hata olurdu.
 */
export function isEmailAllowed(email?: string | null): boolean {
  if (!email) return false;
  return allowedEmails.includes(email.toLowerCase());
}

export const authConfig = {
  // Gizli anahtar yalnızca ortam değişkeninden gelir. Koda gömülü bir yedek
  // değer (`?? "...-development-secret"`) bilerek eklenmedi: env eksik kaldığında
  // sessizce tahmin edilebilir bir anahtara düşmek, gürültüyle patlamaktan kötüdür.
  secret: process.env.AUTH_SECRET,
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  providers: [
    {
      id: "gatehub",
      name: "GateHub",
      type: "oidc",
      issuer,
      clientId: process.env.GATEHUB_CLIENT_ID,
      clientSecret: process.env.GATEHUB_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "openid profile email offline_access",
          prompt: "select_account",
        },
      },
      checks: ["pkce", "state"],
      profile(profile) {
        return {
          id: profile.sub as string,
          name: (profile.name ?? profile.email ?? "TestMetrix kullanıcısı") as string,
          email: profile.email as string,
          image: (profile.picture ?? null) as string | null,
        };
      },
    },
  ],
  callbacks: {
    // middleware bunu kullanır: oturum yoksa /login'e yönlendirilir.
    authorized({ auth }) {
      return Boolean(auth?.user);
    },
    // NOT: `jwt` callback'i burada DEĞİL, `src/auth.ts`'te tanımlı — çünkü
    // veritabanına dokunuyor (yerel kullanıcı aynasını e-postadan bulup
    // `token.sub`'a yazıyor) ve Prisma edge runtime'da çalışamaz. Oturum bir
    // kez kurulduktan sonra `token.sub` JWT'de taşındığı için middleware'in
    // veritabanına ihtiyacı olmuyor.
    session({ session, token }) {
      if (session.user && token.sub) session.user.id = token.sub;
      return session;
    },
  },
} satisfies NextAuthConfig;
