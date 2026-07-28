import NextAuth from "next-auth";
import { authConfig, isEmailAllowed } from "@/auth.config";
import { prisma } from "@/lib/prisma";

/**
 * Tam Auth.js kurulumu (Node runtime).
 *
 * Kimlik GateHub'dan (OIDC) gelir; testmetrix parola tutmaz, şifre sıfırlama
 * yapmaz, e-posta doğrulamaz — hepsi GateHub'ın işi. Burada tutulan tek şey
 * `app_user` aynası: klasör ve sınavların foreign key ile bağlanabilmesi için.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,

    async signIn({ user }) {
      // 1) Erişim listesi — listede olmayan hesap içeri alınmaz.
      if (!isEmailAllowed(user.email)) return false;

      // 2) Yerel kullanıcı aynası. `id` GateHub'ın `sub` değeri.
      if (!user.id || !user.email) return false;

      await prisma.appUser.upsert({
        where: { id: user.id },
        create: {
          id: user.id,
          email: user.email,
          name: user.name ?? user.email,
          image: user.image ?? null,
        },
        // `role` bilerek güncellenmiyor: sunucu tarafında atanan bir değer,
        // her girişte varsayılana dönmemeli.
        update: {
          email: user.email,
          name: user.name ?? user.email,
          image: user.image ?? null,
        },
      });

      return true;
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
