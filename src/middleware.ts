import { NextResponse, type NextRequest } from "next/server";

// This is a UX convenience layer only. It reads a non-httpOnly "role" cookie
// (see src/lib/server/cookies.ts) that is NOT a credential and cannot be
// used to access anything — every real authorization decision is re-checked
// by the backend on every request (see authorize.middleware.ts in the
// backend repo). Its only job here is to avoid flashing the wrong
// dashboard before the client-side AuthProvider resolves.
//
// Deliberately does NOT redirect "/", "/login", or "/register" away based
// on cookie presence (it used to). Cookie presence only means "there was a
// session at some point" — it says nothing about whether that token is
// still valid. A stale/expired cookie (e.g. left over from earlier manual
// testing) caused a confusing bounce: "/" → middleware redirects to
// /admin/dashboard because a cookie exists → that page's real auth check
// round-trips to the backend → backend correctly rejects the dead token →
// the app clears cookies and sends you to /login. The visible result was
// "/ instantly redirects to /login" with no way to tell why. The
// still-logged-in-so-skip-the-form convenience for /login and /register is
// now handled client-side instead (see those pages), using the REAL
// backend-validated session from AuthProvider rather than raw cookie
// presence — which self-corrects instead of bouncing.
const ROLE_HOME: Record<string, string> = {
  CANDIDATE: "/candidate/dashboard",
  COMPANY: "/company/dashboard",
  ADMIN: "/admin/dashboard",
};

const PROTECTED_PREFIXES: Array<{ prefix: string; role: string }> = [
  { prefix: "/candidate", role: "CANDIDATE" },
  { prefix: "/company", role: "COMPANY" },
  { prefix: "/admin", role: "ADMIN" },
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const role = req.cookies.get("cr_role")?.value;
  const hasSession = Boolean(req.cookies.get("cr_at")?.value || req.cookies.get("cr_rt")?.value);

  const match = PROTECTED_PREFIXES.find((p) => pathname.startsWith(p.prefix));

  if (match) {
    if (!hasSession) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    if (role && role !== match.role && ROLE_HOME[role]) {
      const url = req.nextUrl.clone();
      url.pathname = ROLE_HOME[role];
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/candidate/:path*", "/company/:path*", "/admin/:path*"],
};
