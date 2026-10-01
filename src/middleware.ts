import { NextResponse, type NextRequest } from "next/server";

// This is a UX convenience layer only. It reads a non-httpOnly "role" cookie
// (see src/lib/server/cookies.ts) that is NOT a credential and cannot be
// used to access anything — every real authorization decision is re-checked
// by the backend on every request (see authorize.middleware.ts in the
// backend repo). Its only job here is to avoid flashing the wrong
// dashboard before the client-side AuthProvider resolves.

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

  if ((pathname === "/login" || pathname === "/register" || pathname === "/") && hasSession && role && ROLE_HOME[role]) {
    const url = req.nextUrl.clone();
    url.pathname = ROLE_HOME[role];
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/candidate/:path*", "/company/:path*", "/admin/:path*", "/login", "/register", "/"],
};
