import { ApiClientError } from "@/lib/api-client";
import type { Role, User } from "@/types/api";

// These three go to our OWN /api/auth/* route handlers (which set httpOnly
// cookies), not through /api/proxy — see src/app/api/auth/*/route.ts.
async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "same-origin",
  });
  const json = await res.json().catch(() => ({ success: false, message: "Invalid server response", errors: [] }));
  if (!res.ok || !json.success) {
    throw new ApiClientError(json.message ?? "Request failed", res.status, json.errors ?? []);
  }
  return json.data as T;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: "CANDIDATE" | "COMPANY";
  companyName?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export const authApi = {
  register: (input: RegisterInput) => post<{ user: User }>("/api/auth/register", input),
  login: (input: LoginInput) => post<{ user: User }>("/api/auth/login", input),
  google: (input: { idToken: string; role?: Role; companyName?: string }) =>
    post<{ user: User }>("/api/auth/google", input),
  logout: () => post<null>("/api/auth/logout", {}),
};
