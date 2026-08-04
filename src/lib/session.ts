import "server-only";

import { auth } from "@/auth";
import { NotFoundError, UnauthorizedError } from "@/lib/api";
import { prisma } from "@/lib/prisma";

/**
 * Oturumdaki kullanıcının id'si (`app_user.id`). Oturum yoksa 401.
 *
 * Bilerek `features/exams/data.ts`'ten ayrı tutuluyor: veri erişim katmanının
 * kimlik doğrulama çatısına bağımlı olmaması, hem katman ayrımını netleştiriyor
 * hem de sahiplik kontrollerinin Next.js istek bağlamı olmadan test edilmesini
 * mümkün kılıyor.
 */
export async function requireUserId(): Promise<string> {
  const user = await getSessionUser();
  if (!user) throw new UnauthorizedError();
  return user.id;
}

/**
 * Oturumdaki kullanıcı — yoksa `null`.
 *
 * "Giriş yapılmış mı?" sorusunun TEK cevabı burası. Daha önce bu soru üç ayrı
 * yerde üç farklı şekilde soruluyordu (`auth?.user`, `session?.user`,
 * `session?.user?.id`) ve karşılıklı yönlendirme yapan iki taraf farklı cevap
 * verdiği için `/login` ⇄ `/folders` sonsuz döngüsü oluşuyordu.
 */
export async function getSessionUser() {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) return null;
  return {
    id,
    email: session.user.email ?? null,
    name: session.user.name ?? null,
  };
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
