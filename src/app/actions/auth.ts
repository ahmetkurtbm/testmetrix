"use server";

import { signIn, signOut } from "@/auth";

/**
 * Google girişi ve çıkış server action'ları.
 *
 * E-posta/şifre girişi burada değil: o istemci tarafında `next-auth/react`'ın
 * `signIn("credentials", …)` fonksiyonuyla yapılıyor (bkz. LoginForm.tsx),
 * çünkü sonucun `error` alanını forma göstermek için `redirect: false` ile
 * çağrılması ve JS tarafında ele alınması gerekiyor.
 */

export async function signInWithGoogle() {
  await signIn("google", { redirectTo: "/folders" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/login" });
}
