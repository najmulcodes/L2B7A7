// Server-only. Talks to the real CodeRank backend. Never imported from
// client components — only from route handlers under src/app/api/**.

// Strip a trailing slash so "http://host/api/v1/" + "/auth/login" doesn't
// become a double slash ("//auth/login"), which some routers 404 on.
const RAW_BACKEND_API_URL = process.env.BACKEND_API_URL ?? "http://localhost:5000/api/v1";
const BACKEND_API_URL = RAW_BACKEND_API_URL.replace(/\/+$/, "");

if (!/\/api\/v\d+$/.test(BACKEND_API_URL)) {
  // Soft warning only — the backend's own version prefix could change, so
  // this doesn't block anything. But the single most common setup mistake
  // is pointing BACKEND_API_URL at the bare host (e.g. "http://localhost:5000")
  // instead of including the mounted API prefix (e.g. "http://localhost:5000/api/v1"),
  // which silently 404s on every single request with a confusing
  // "Route not found: POST /auth/login" (missing the /api/v1 the backend
  // actually expects).
  //
  // Deliberately NOT gated behind NODE_ENV — this only ever writes to the
  // server's own log (Vercel Function Logs, a local terminal, etc.), never
  // to anything a client can see, so there's no reason to suppress it in
  // production specifically. A misconfigured env var in a Vercel project's
  // settings is exactly the case where the server console is the ONLY
  // place this would ever surface, and that's the environment most likely
  // to have a typo'd or missing env var in the first place.
  // eslint-disable-next-line no-console
  console.warn(
    `[coderank] BACKEND_API_URL is "${BACKEND_API_URL}" — this doesn't look like it includes the backend's ` +
      `mounted API prefix (e.g. "/api/v1"). If every request 404s with "Route not found: <method> /<path>" ` +
      `(no /api/v1 in that message), this is almost certainly why. Check this environment's BACKEND_API_URL.`,
  );
}

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

  // Dev-only breadcrumb: append the exact URL we hit so a misconfigured
  // BACKEND_API_URL is obvious from the error message itself, not just the
  // server console. Never done in production (don't leak internal URLs).
  if (process.env.NODE_ENV !== "production" && !res.ok) {
    body = { ...body, message: `${body.message} [requested ${init.method ?? "GET"} ${url.toString()}]` };
  }

  return { status: res.status, ok: res.ok, body };
}
