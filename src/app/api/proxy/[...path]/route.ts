import type { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/server/proxyRequest";

// Generic same-origin proxy used by the browser's API client
// (src/lib/api-client.ts) for every authenticated backend call:
//   fetch("/api/proxy/assessments/123/publish", { method: "PATCH" })
// forwards to `${BACKEND_API_URL}/assessments/123/publish` with the
// Authorization header attached server-side from the httpOnly cookie.
// This keeps both the access and refresh tokens fully out of reach of any
// client-side JavaScript (see src/lib/server/cookies.ts).

async function handler(req: NextRequest, { params }: { params: { path: string[] } }) {
  const backendPath = "/" + params.path.join("/");
  const method = req.method;

  let body: unknown;
  if (method !== "GET" && method !== "HEAD" && method !== "DELETE") {
    body = await req.json().catch(() => undefined);
  } else if (method === "DELETE") {
    // DELETE requests in this API never carry a body, but tolerate one if sent.
    body = await req.json().catch(() => undefined);
  }

  return proxyRequest(backendPath, {
    method,
    body,
    searchParams: req.nextUrl.searchParams,
  });
}

export { handler as GET, handler as POST, handler as PATCH, handler as DELETE, handler as PUT };
