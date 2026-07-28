"use server";

import { signIn, signOut } from "@/auth";

/**
 * Giriş ve çıkış server action'ları.
 *
 * Eski sürümde giriş, e-posta/şifreyi Express backend'ine POST edip dönen JWT'yi
 * bir cookie'ye yazmakla oluyordu. Artık parola testmetrix'e hiç uğramıyor:
 * kullanıcı GateHub'a yönlendiriliyor, oradan OIDC ile dönüyor.
 */

export async function signInWithGateHub() {
  await signIn("gatehub", { redirectTo: "/folders" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/login" });
}
