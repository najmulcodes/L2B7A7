import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { callBackend } from "@/lib/server/backend";
import { ACCESS_COOKIE, clearAuthCookies } from "@/lib/server/cookies";

export async function POST() {
  const accessToken = cookies().get(ACCESS_COOKIE)?.value;

  // Best-effort: still clear local cookies even if the backend call fails
  // (e.g. token already expired) — the user's intent is to be logged out.
  if (accessToken) {
    await callBackend("/auth/logout", { method: "POST", accessToken }).catch(() => null);
  }

  const res = NextResponse.json({ success: true, message: "Logged out successfully", data: null });
  clearAuthCookies(res);
  return res;
}
