import "server-only";

import { auth } from "@/auth";
import { NotFoundError, UnauthorizedError } from "@/lib/api";
import { prisma } from "@/lib/prisma";

/**
 * Oturumdaki kullanıcının id'si (GateHub `sub`). Oturum yoksa 401.
 *
 * Bilerek `features/exams/data.ts`'ten ayrı tutuluyor: veri erişim katmanının
 * kimlik doğrulama çatısına bağımlı olmaması, hem katman ayrımını netleştiriyor
 * hem de sahiplik kontrollerinin Next.js istek bağlamı olmadan test edilmesini
 * mümkün kılıyor.
 */
export async function requireUserId(): Promise<string> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new UnauthorizedError();
  return userId;
}

/**
 * Yönetici yetkisi. Rol veritabanından okunur — token'dan değil, çünkü token
 * altı saat geçerli ve bu sürede düşürülen bir yetki token'da eski haliyle
 * kalırdı.
 *
 * Yetkisizde bilerek 404: eski `/users` uç noktası giriş yapmış HERKESE tüm
 * kullanıcıların ad, e-posta, telefon ve üniversite bilgisini veriyordu; rol
 * kontrolü yalnızca arayüzde, linki gizleyerek yapılıyordu.
 */
export async function requireAdminId(): Promise<string> {
  const userId = await requireUserId();
  const user = await prisma.appUser.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (user?.role !== "ADMIN") throw new NotFoundError();
  return userId;
}

/** Sayfa tarafında kullanmak için: yönetici mi, hata fırlatmadan söyler. */
export async function isAdmin(): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) return false;
  const user = await prisma.appUser.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  return user?.role === "ADMIN";
}
