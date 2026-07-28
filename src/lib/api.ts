import "server-only";

import { NextResponse } from "next/server";
import { ZodError } from "zod";

/**
 * API katmanı için ortak hata tipleri ve yanıt sarmalayıcısı.
 *
 * Eski Express backend'i hataları `res.status(500).json({ error: error.message })`
 * ile döndürüyordu; bu, ham Mongo hatalarını (index adları, koleksiyon adları,
 * duplicate key detayları) istemciye sızdırıyordu. Burada istemciye yalnızca
 * jenerik mesaj gider, ayrıntı sunucu loguna yazılır.
 */

export class UnauthorizedError extends Error {
  constructor(message = "Oturum gerekli") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class NotFoundError extends Error {
  constructor(message = "Bulunamadı") {
    super(message);
    this.name = "NotFoundError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Bu işlem için yetkiniz yok") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export class ValidationError extends Error {
  constructor(message = "Geçersiz istek") {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * Route handler sarmalayıcısı. Bilinen hataları uygun HTTP koduna çevirir,
 * beklenmeyenleri loglayıp jenerik 500 döndürür.
 */
export async function handle<T>(fn: () => Promise<T>): Promise<NextResponse> {
  try {
    return NextResponse.json(await fn());
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    // Sahiplik kontrolü başarısız olduğunda bilerek 404 dönüyoruz, 403 değil:
    // 403, "bu kayıt var ama senin değil" bilgisini sızdırır.
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Geçersiz istek", details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    console.error("Beklenmeyen API hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
