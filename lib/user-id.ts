import { NextRequest } from "next/server";

export function getUserId(request: NextRequest) {
  const candidate = request.headers.get("x-user-id") ?? "";
  if (!/^[a-f0-9-]{36}$/i.test(candidate)) return null;
  return candidate;
}
