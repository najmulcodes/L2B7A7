import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { callBackend } from "@/lib/server/backend";
import { ACCESS_COOKIE, REFRESH_COOKIE, ROLE_COOKIE, clearAuthCookies, setAuthCookies } from "@/lib/server/cookies";
import type { Role } from "@/types/api";

/**
 * Attempts one refresh-token call and returns the new access token, or null
 * if the refresh itself failed (refresh token expired/invalid/reused after
 * rotation) — in which case the caller must force a full re-login.
 *
 * On success this also rotates the httpOnly cookies on `res` so the new
 * tokens persist for the browser's next request.
 */
async function trySilentRefresh(res: NextResponse): Promise<string | null> {
  const refreshToken = cookies().get(REFRESH_COOKIE)?.value;
  if (!refreshToken) return null;

  const result = await callBackend<{ accessToken: string; refreshToken: string }>("/auth/refresh-token", {
    method: "POST",
    body: { refreshToken },
  });

  if (!result.ok || !result.body.data) return null;

  const role = (cookies().get(ROLE_COOKIE)?.value as Role) ?? "CANDIDATE";
  setAuthCookies(res, result.body.data, role);
  return result.body.data.accessToken;
}

/**
 * Forwards one request to `backendPath` (e.g. "/assessments/123") with the
 * given method/body/searchParams. Attaches the caller's access token from
 * the httpOnly cookie; on a 401 from the backend, performs exactly one
 * silent refresh + retry before giving up and forcing logout — matching the
 * "automatic silent refresh" behavior the backend integration calls for.
 */
export async function proxyRequest(
  backendPath: string,
  opts: { method: string; body?: unknown; searchParams?: URLSearchParams },
): Promise<NextResponse> {
  const res = new NextResponse();
  let accessToken = cookies().get(ACCESS_COOKIE)?.value;

  const attempt = (token: string | undefined) =>
    callBackend(backendPath, { method: opts.method, body: opts.body, searchParams: opts.searchParams, accessToken: token });

  let result = await attempt(accessToken);

  if (result.status === 401) {
    const refreshed = await trySilentRefresh(res);
    if (refreshed) {
      accessToken = refreshed;
      result = await attempt(accessToken);
    } else {
      const failRes = NextResponse.json(
        { success: false, message: "Session expired. Please log in again.", errors: [] },
        { status: 401 },
      );
      clearAuthCookies(failRes);
      return failRes;
    }
  }

  const finalRes = NextResponse.json(result.body, { status: result.status });
  // Carry over any cookie mutations (rotated tokens) made during the refresh above.
  res.cookies.getAll().forEach((c) => finalRes.cookies.set(c));
  return finalRes;
}
