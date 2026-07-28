import "server-only";

import { auth } from "@/auth";
import { UnauthorizedError } from "@/lib/api";

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
