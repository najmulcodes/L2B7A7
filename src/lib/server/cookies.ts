import type { NextResponse } from "next/server";
import type { Role } from "@/types/api";

// Access token: short-lived (backend default 15m). httpOnly — never readable
// by client JS. Sent automatically by the browser on same-origin requests to
// our own /api/* route handlers.
export const ACCESS_COOKIE = "cr_at";
// Refresh token: long-lived (backend default 30d), rotated on every use.
// httpOnly as well — the whole point of proxying through Next.js route
// handlers is that this value is NEVER exposed to any client-side script.
export const REFRESH_COOKIE = "cr_rt";
// NOT httpOnly and NOT a credential — just the user's role, so that
// src/middleware.ts can do a cheap, non-authoritative redirect for UX
// before the real page loads and calls GET /users/me. The backend remains
// the sole source of truth for authorization; this cookie only ever
// improves the flash-of-wrong-dashboard UX, and is re-derived from a real
// server response every time it is set.
export const ROLE_COOKIE = "cr_role";

const isProd = process.env.NODE_ENV === "production";

export function setAuthCookies(
  res: NextResponse,
  tokens: { accessToken: string; refreshToken: string },
  role: Role,
) {
  res.cookies.set(ACCESS_COOKIE, tokens.accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 14, // slightly under the backend's 15m access token life
  });
  res.cookies.set(REFRESH_COOKIE, tokens.refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  res.cookies.set(ROLE_COOKIE, role, {
    httpOnly: false,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function clearAuthCookies(res: NextResponse) {
  res.cookies.set(ACCESS_COOKIE, "", { path: "/", maxAge: 0 });
  res.cookies.set(REFRESH_COOKIE, "", { path: "/", maxAge: 0 });
  res.cookies.set(ROLE_COOKIE, "", { path: "/", maxAge: 0 });
}
