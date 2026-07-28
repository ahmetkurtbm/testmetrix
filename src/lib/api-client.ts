/**
 * İstemci tarafı API yardımcıları.
 *
 * Eski kodda her sayfa şu kalıbı tekrarlıyordu:
 *
 *   const token = await getCookie();          // sunucuya ekstra round-trip
 *   if (!token) return;
 *   const res = await fetch(`${BACKEND_URL}/x`, {
 *     headers: { Authorization: token, "Content-Type": "application/json" },
 *     credentials: "include",
 *   });
 *   if (!res.ok) { console.error(...); }
 *
 * Artık gerek yok: oturum httpOnly çerezde ve API aynı origin'de, yani tarayıcı
 * çerezi kendiliğinden gönderiyor. Token elle taşınmıyor, CORS yok.
 */

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ApiError(body?.error ?? "İstek başarısız oldu", response.status);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export function apiGet<T>(path: string) {
  return request<T>(path);
}

export function apiPost<T>(path: string, body: unknown) {
  return request<T>(path, { method: "POST", body: JSON.stringify(body) });
}

export function apiPatch<T>(path: string, body: unknown) {
  return request<T>(path, { method: "PATCH", body: JSON.stringify(body) });
}

export function apiPut<T>(path: string, body: unknown) {
  return request<T>(path, { method: "PUT", body: JSON.stringify(body) });
}

export function apiDelete<T>(path: string) {
  return request<T>(path, { method: "DELETE" });
}
