import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

/**
 * Edge-safe Auth.js yapılandırması.
 *
 * `middleware.ts` edge runtime'da çalışır ve Prisma/bcrypt oraya sokulamaz;
 * bu yüzden yapılandırma ikiye bölünmüş. Burada veritabanına dokunmayan kısım
 * var: Google provider (node-only bağımlılığı yok) ve `authorized`/`session`
 * callback'leri. E-posta/şifre (Credentials) provider'ı ve `jwt` callback'i
 * `src/auth.ts`'te — ikisi de Prisma/bcrypt kullanıyor.
 */

const googleConfigured = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
);

export function isGoogleConfigured(): boolean {
  return googleConfigured;
}

export const authConfig = {
  // Gizli anahtar yalnızca ortam değişkeninden gelir. Koda gömülü bir yedek
  // değer (`?? "...-development-secret"`) bilerek eklenmedi: env eksik kaldığında
  // sessizce tahmin edilebilir bir anahtara düşmek, gürültüyle patlamaktan kötüdür.
  secret: process.env.AUTH_SECRET,
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  providers: googleConfigured
    ? [
        Google({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
      ]
    : [],
  callbacks: {
    // middleware bunu kullanır: oturum yoksa /login'e yönlendirilir.
    authorized({ auth }) {
      return Boolean(auth?.user);
    },
    // NOT: `jwt` callback'i burada DEĞİL, `src/auth.ts`'te tanımlı — çünkü
    // veritabanına dokunuyor (yerel kullanıcı satırını e-postadan bulup
    // `token.sub`'a yazıyor) ve Prisma edge runtime'da çalışamaz.
    session({ session, token }) {
      if (session.user && token.sub) session.user.id = token.sub;
      return session;
    },
  },
} satisfies NextAuthConfig;
