import { NextResponse } from "next/server";
import { callBackend } from "@/lib/server/backend";
import { setAuthCookies } from "@/lib/server/cookies";
import type { User } from "@/types/api";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  const result = await callBackend<{ user: User; accessToken: string; refreshToken: string }>("/auth/login", {
    method: "POST",
    body,
  });

  if (!result.ok || !result.body.data) {
    return NextResponse.json(
      { success: false, message: result.body.message, errors: result.body.errors ?? [] },
      { status: result.status },
    );
  }

  const { user, accessToken, refreshToken } = result.body.data;
  const res = NextResponse.json({ success: true, message: result.body.message, data: { user } });
  setAuthCookies(res, { accessToken, refreshToken }, user.role);
  return res;
}
