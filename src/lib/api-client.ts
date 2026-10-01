import type { PaginationMeta } from "@/types/api";

export class ApiClientError extends Error {
  status: number;
  errors: unknown[];

  constructor(message: string, status: number, errors: unknown[] = []) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.errors = errors;
  }

  /** Field-level validation messages from a 400, keyed by field path. */
  fieldErrors(): Record<string, string> {
    const out: Record<string, string> = {};
    for (const e of this.errors) {
      if (e && typeof e === "object" && "path" in e && "message" in e) {
        const path = String((e as { path: unknown }).path);
        const message = String((e as { message: unknown }).message);
        if (path) out[path] = message;
      }
    }
    return out;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE" | "PUT";
  body?: unknown;
  query?: Record<string, string | number | undefined>;
}

/**
 * Every authenticated (and public-through-backend) call goes through our own
 * same-origin /api/proxy/* route — never directly to the backend — so the
 * httpOnly auth cookies are attached automatically by the browser and silent
 * refresh-on-401 is handled server-side (see src/lib/server/proxyRequest.ts).
 */
async function request<T>(path: string, opts: RequestOptions = {}): Promise<{ data: T; meta?: PaginationMeta }> {
  const url = new URL(`/api/proxy${path}`, window.location.origin);
  if (opts.query) {
    for (const [key, value] of Object.entries(opts.query)) {
      if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
    }
  }

  const res = await fetch(url.toString(), {
    method: opts.method ?? "GET",
    headers: opts.body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    credentials: "same-origin",
  });

  const json = await res.json().catch(() => ({ success: false, message: "Invalid server response", errors: [] }));

  if (!res.ok || !json.success) {
    if (res.status === 401 && typeof window !== "undefined") {
      // The proxy already tried a silent refresh and it failed too — the
      // session is truly gone. Force a full re-login.
      window.dispatchEvent(new CustomEvent("coderank:session-expired"));
    }
    throw new ApiClientError(json.message ?? "Request failed", res.status, json.errors ?? []);
  }

  return { data: json.data as T, meta: json.meta };
}

export const api = {
  get: <T>(path: string, query?: RequestOptions["query"]) => request<T>(path, { method: "GET", query }),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: "POST", body }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: "PATCH", body }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
