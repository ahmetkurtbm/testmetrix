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

    /** Erişim listesi. Yerel kayıt işi `jwt` callback'inde. */
    signIn({ user }) {
      return isEmailAllowed(user.email);
    },

    /**
     * Yerel kullanıcı aynasını e-posta üzerinden eşleştirir ve oturum kimliğini
     * ona bağlar.
     *
     * Neden `id` değil de e-posta: GateHub'ın `sub` değeri buraya güvenilir
     * şekilde ulaşmıyor — Auth.js her girişte rastgele yeni bir UUID üretiyordu.
     * `id` ile eşleştiren eski sürüm bu yüzden ilk girişte satırı oluşturuyor,
     * sonraki her girişte aynı e-postayla ikinci satır açmaya çalışıp
     * `Unique constraint failed on the fields: (email)` hatasıyla düşüyordu.
     * Kullanıcı da "Access Denied" görüyordu.
     *
     * E-posta hem GateHub'da hem burada benzersiz ve doğrulanmış; sabit
     * kimlik olarak kullanılabilecek tek alan o. Satırın kendi `id`'si bir kez
     * atanıp sabit kalıyor, klasör ve sınavlar ona bağlanıyor.
     */
    async jwt({ token, user }) {
      if (user?.email) {
        const appUser = await prisma.appUser.upsert({
          where: { email: user.email },
          create: {
            email: user.email,
            name: user.name ?? user.email,
            image: user.image ?? null,
          },
          // `role` bilerek güncellenmiyor: sunucu tarafında atanan bir değer,
          // her girişte varsayılana dönmemeli.
          update: {
            name: user.name ?? user.email,
            image: user.image ?? null,
          },
          select: { id: true },
        });
        token.sub = appUser.id;
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
