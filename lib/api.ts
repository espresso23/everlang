import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuth, isAdmin } from "./auth";
import { withApiLogging } from "./logger";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export type Viewer = {
  id: string;
  email: string;
  name: string;
  admin: boolean;
};
export function api(
  path: string,
  handler: (r: NextRequest, u: Viewer) => Promise<unknown>,
  admin = false,
) {
  return withApiLogging(path, async (r) => {
    try {
      if (!["GET", "HEAD"].includes(r.method)) {
        const origin = r.headers.get("origin");
        const expected = new URL(process.env.BETTER_AUTH_URL || r.url).origin;
        if (origin && origin !== expected)
          throw new HttpError(403, "Nguồn yêu cầu không hợp lệ.");
        if (!r.headers.get("content-type")?.includes("application/json"))
          throw new HttpError(415, "Yêu cầu JSON.");
      }
      const session = await getAuth().api.getSession({ headers: r.headers });
      if (!session) throw new HttpError(401, "Hãy đăng nhập để tiếp tục.");
      if (!session.user.emailVerified)
        throw new HttpError(403,"Hãy xác minh email để sử dụng tài khoản.");
      const viewer = { ...session.user, admin: isAdmin(session.user.email) };
      if (admin && !viewer.admin)
        throw new HttpError(403, "Chỉ quản trị viên được phép thực hiện.");
      const result = await handler(r, viewer);
      return result instanceof Response
        ? result
        : NextResponse.json(result, {
            headers: { "Cache-Control": "no-store" },
          });
    } catch (e) {
      if (e instanceof HttpError)
        return NextResponse.json({ error: e.message }, { status: e.status });
      if (e instanceof z.ZodError || e instanceof SyntaxError)
        return NextResponse.json(
          { error: "Dữ liệu không hợp lệ." },
          { status: 400 },
        );
      throw e;
    }
  });
}
