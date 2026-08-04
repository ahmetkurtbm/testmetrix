import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/auth.config";
import { isAdminEmail } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 dakika

/**
 * Tam Auth.js kurulumu (Node runtime).
 *
 * İki giriş yolu var: e-posta/şifre (Credentials) ve Google. İkisi de aynı
 * `app_user` satırında buluşuyor — kimlik e-posta üzerinden eşleşiyor.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    ...authConfig.providers,
    Credentials({
      credentials: {
        email: { label: "E-posta" },
        password: { label: "Parola", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "")
          .trim()
          .toLowerCase();
        const password = String(credentials?.password ?? "");
        if (!email || !password) return null;

        const user = await prisma.appUser.findUnique({ where: { email } });
        // Google-only kullanıcı (passwordHash yok) parolayla giriş deneyemez.
        if (!user?.passwordHash) return null;

        // Kaba kuvvet koruması: GateHub'ın sağladığı hız sınırlamasının
        // yerini alıyor. Kilitliyse parolayı hiç kontrol etmeden reddet —
        // doğru parola bile girilse kilit süresi dolmadan içeri alınmaz.
        if (user.lockedUntil && user.lockedUntil > new Date()) return null;

        const valid = await verifyPassword(password, user.passwordHash);

        if (!valid) {
          const attempts = user.failedLoginAttempts + 1;
          await prisma.appUser.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts: attempts,
              lockedUntil:
                attempts >= MAX_FAILED_ATTEMPTS
                  ? new Date(Date.now() + LOCKOUT_MS)
                  : null,
            },
          });
          return null;
        }

        if (user.failedLoginAttempts > 0 || user.lockedUntil) {
          await prisma.appUser.update({
            where: { id: user.id },
            data: { failedLoginAttempts: 0, lockedUntil: null },
          });
        }

        return { id: user.id, email: user.email, name: user.name, image: user.image };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,

    /** Google ile ilk girişte yerel hesabı oluşturur. */
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        await prisma.appUser.upsert({
          where: { email: user.email },
          create: {
            email: user.email,
            name: user.name ?? user.email,
            image: user.image ?? null,
            role: isAdminEmail(user.email) ? "ADMIN" : "TEACHER",
          },
          // `role` bilerek güncellenmiyor: sunucu tarafında atanan bir değer,
          // her girişte varsayılana dönmemeli. Var olan kullanıcının adı/
          // fotoğrafı Google'daki güncel haliyle senkron tutuluyor.
          update: {
            name: user.name ?? undefined,
            image: user.image ?? undefined,
          },
        });
      }
      return true;
    },

    /**
     * Oturum kimliğini yerel `app_user.id`'ye bağlar.
     *
     * OAuth sağlayıcının döndürdüğü `user.id` kendi sistemininkidir (Google
     * subject id), bizim satırımızın id'si değil — bu yüzden e-postadan
     * yeniden arıyoruz. Credentials girişinde zaten doğru id geliyor ama
     * tutarlılık için aynı yoldan geçiriyoruz.
     */
    async jwt({ token, user }) {
      if (user?.email) {
        const appUser = await prisma.appUser.findUnique({
          where: { email: user.email },
          select: { id: true },
        });
        if (appUser) token.sub = appUser.id;
      }
      return token;
    },
  },
});

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
