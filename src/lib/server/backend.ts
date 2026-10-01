// Server-only. Talks to the real CodeRank backend. Never imported from
// client components — only from route handlers under src/app/api/**.

const BACKEND_API_URL = process.env.BACKEND_API_URL ?? "http://localhost:5000/api/v1";

export interface BackendResult<T = unknown> {
  status: number;
  ok: boolean;
  body: {
    success: boolean;
    message: string;
    data?: T;
    meta?: { page: number; limit: number; total: number; totalPages: number };
    errors?: unknown[];
  };
}

/**
 * Low-level call to the backend. `path` must start with "/" and is relative
 * to BACKEND_API_URL (e.g. "/auth/login", "/assessments/123/publish").
 */
export async function callBackend<T = unknown>(
  path: string,
  init: {
    method?: string;
    body?: unknown;
    accessToken?: string;
    searchParams?: URLSearchParams;
  } = {},
): Promise<BackendResult<T>> {
  const url = new URL(BACKEND_API_URL + path);
  if (init.searchParams) {
    init.searchParams.forEach((value, key) => url.searchParams.set(key, value));
  }

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (init.accessToken) headers.Authorization = `Bearer ${init.accessToken}`;

  const res = await fetch(url.toString(), {
    method: init.method ?? "GET",
    headers,
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
  });

  let body: BackendResult<T>["body"];
  try {
    body = await res.json();
  } catch {
    body = { success: false, message: `Backend returned a non-JSON response (${res.status})`, errors: [] };
  }

  return { status: res.status, ok: res.ok, body };
}
