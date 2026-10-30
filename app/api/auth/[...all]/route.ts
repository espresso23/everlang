import { getAuth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { log, withApiLogging } from "@/lib/logger";
import type { NextRequest } from "next/server";
export const runtime = "nodejs";
async function handleAuth(request: NextRequest) {
  const handlers = toNextJsHandler(getAuth());
  const response = await (request.method === "GET" ? handlers.GET(request) : handlers.POST(request));
  if (request.nextUrl.pathname === "/api/auth/callback/google") {
    const destination = response.headers.get("location");
    const code = destination ? new URL(destination, request.url).searchParams.get("error") : null;
    const known = new Set(["invalid_client", "invalid_code", "account_not_linked", "access_denied",
      "state_mismatch", "unable_to_get_user_info", "unable_to_create_user", "signup_disabled"]);
    log(code || response.status >= 400 ? "warn" : "info", "auth.google.callback", {
      outcome: code || response.status >= 400 ? "failed" : "redirected",
      errorCode: code ? known.has(code) ? code : "oauth_error" : undefined,
      statusCode: response.status,
    });
  }
  return response;
}
export const GET = withApiLogging("/api/auth/[...all]", handleAuth);
export const POST = withApiLogging("/api/auth/[...all]", handleAuth);
