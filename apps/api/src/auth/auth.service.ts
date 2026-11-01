import { rateLimit } from "@everlang/backend/rate-limit";
import {
  ormDataSource,
  createQueryRunner,
  rollback,
} from "@everlang/backend/orm";
import { Entities } from "@everlang/backend/entities";

import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { Request, Response } from "express";
import {
  randomUUID,
  createHmac,
  timingSafeEqual,
  createHash,
} from "node:crypto";
import { sendAuthEmail } from "@everlang/backend/auth-mail";

import { HttpError, type Viewer } from "@everlang/backend/http";
import {
  hashPassword,
  verifyPassword,
  randomToken,
  tokenHash,
} from "@everlang/backend/auth-crypto";

const isAdmin = (email: string) =>
  (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .includes(email.toLowerCase());
const origin = () => process.env.PUBLIC_ORIGIN || "http://localhost:3000";
const secure = () => new URL(origin()).protocol === "https:";
const refreshName = () =>
  secure() ? "__Secure-everlang_refresh" : "everlang_refresh";
const issuer = () => process.env.JWT_ISSUER || "everlang";
const audience = () => process.env.JWT_AUDIENCE || "everlang-web";
type UserRow = {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  email_verified: boolean;
};
const publicUser = (r: UserRow) => ({
  id: r.id,
  email: r.email,
  name: r.name,
  image: r.image ?? null,
  emailVerified: r.email_verified,
  admin: isAdmin(r.email),
});

@Injectable()
export class AuthService {
  private readonly jwt = new JwtService();
  private readonly privateKey = Buffer.from(
    process.env.JWT_PRIVATE_KEY_B64 || "",
    "base64",
  ).toString();
  private readonly publicKey = Buffer.from(
    process.env.JWT_PUBLIC_KEY_B64 || "",
    "base64",
  ).toString();
  constructor() {
    if (!this.privateKey || !this.publicKey || !process.env.CSRF_SECRET)
      throw new Error("JWT key pair and CSRF_SECRET must be configured");
  }
  csrf(req: Request, res: Response) {
    const nonce = req.cookies?.everlang_csrf || randomToken();
    res.cookie("everlang_csrf", nonce, {
      httpOnly: true,
      secure: secure(),
      sameSite: "lax",
      path: "/api/auth",
      maxAge: 86400000,
    });
    return {
      csrfToken: createHmac("sha256", process.env.CSRF_SECRET!)
        .update(nonce)
        .digest("hex"),
    };
  }
  async protect(req: Request, action = "auth") {
    if (req.get("origin") !== origin())
      throw new HttpError(403, "Nguồn yêu cầu không hợp lệ.", "INVALID_ORIGIN");
    const nonce = req.cookies?.everlang_csrf;
    const actual = req.get("x-csrf-token") || "";
    const expected = nonce
      ? createHmac("sha256", process.env.CSRF_SECRET!)
          .update(nonce)
          .digest("hex")
      : "";
    if (
      !expected ||
      actual.length !== expected.length ||
      !timingSafeEqual(Buffer.from(actual), Buffer.from(expected))
    )
      throw new HttpError(
        403,
        "Mã bảo vệ yêu cầu không hợp lệ.",
        "CSRF_INVALID",
      );
    if (!(await rateLimit(req.ip || "unknown", action, 30)))
      throw new HttpError(
        429,
        "Bạn gửi quá nhanh. Hãy thử lại sau.",
        "RATE_LIMITED",
      );
  }
  private cookie(res: Response, token?: string, expires?: Date) {
    const options = {
      httpOnly: true,
      secure: secure(),
      sameSite: "lax" as const,
      path: "/api/auth",
    };
    if (token) res.cookie(refreshName(), token, { ...options, expires });
    else res.clearCookie(refreshName(), options);
  }
  private async access(user: UserRow, sid: string) {
    return {
      accessToken: await this.jwt.signAsync(
        {
          sub: user.id,
          sid,
          jti: randomUUID(),
          roles: isAdmin(user.email) ? ["learner", "admin"] : ["learner"],
          emailVerified: user.email_verified,
        },
        {
          privateKey: this.privateKey,
          algorithm: "RS256",
          issuer: issuer(),
          audience: audience(),
          expiresIn: 900,
        },
      ),
      expiresIn: 900,
      user: publicUser(user),
    };
  }
  async startSession(userId: string, res: Response) {
    const user = (
      await ormDataSource
        .createQueryBuilder()
        .select(["*"])
        .from(Entities.users, "row")
        .where("id=:p1")
        .setParameters({ p1: userId })
        .getRawMany<UserRow>()
    )[0];
    if (!user?.email_verified)
      throw new HttpError(
        403,
        "Hãy xác minh email trước khi đăng nhập.",
        "EMAIL_NOT_VERIFIED",
      );
    const sid = randomUUID(),
      token = randomToken(),
      expires = new Date(Date.now() + 30 * 86400000);
    const c = await createQueryRunner();
    try {
      await c.startTransaction();
      await c.manager
        .createQueryBuilder()
        .insert()
        .into(Entities.auth_refresh_sessions, ["id", "user_id", "expires_at"])
        .values({
          id: () => ":p1",
          user_id: () => ":p2",
          expires_at: () => ":p3",
        })
        .updateEntity(false)
        .setParameters({ p1: sid, p2: userId, p3: expires })
        .execute()
        .then((result) => result.raw);
      await c.manager
        .createQueryBuilder()
        .insert()
        .into(Entities.auth_refresh_tokens, ["token_hash", "session_id"])
        .values({ token_hash: () => ":p1", session_id: () => ":p2" })
        .updateEntity(false)
        .setParameters({ p1: tokenHash(token), p2: sid })
        .execute()
        .then((result) => result.raw);
      await c.commitTransaction();
    } catch (e) {
      await rollback(c);
      throw e;
    } finally {
      await c.release();
    }
    this.cookie(res, token, expires);
    return this.access(user, sid);
  }
  async login(email: string, password: string, res: Response) {
    const row = (
      await ormDataSource
        .createQueryBuilder()
        .select("u.*")
        .addSelect("i.password", "password")
        .from(Entities.users, "u")
        .innerJoin(
          Entities.auth_identities.options.name,
          "i",
          "i.user_id=u.id AND i.provider_id='credential'",
        )
        .where("lower(u.email)=:p1")
        .setParameters({ p1: email.toLowerCase() })
        .getRawMany()
    )[0];
    if (!row || !(await verifyPassword(password, row.password || "")))
      throw new HttpError(
        401,
        "Email hoặc mật khẩu không đúng.",
        "INVALID_CREDENTIALS",
      );
    return this.startSession(row.id, res);
  }
  async refresh(req: Request, res: Response) {
    const raw = req.cookies?.[refreshName()];
    if (typeof raw !== "string" || raw.length > 200)
      throw new HttpError(401, "Hãy đăng nhập để tiếp tục.", "REFRESH_INVALID");
    const c = await createQueryRunner();
    try {
      await c.startTransaction();
      const row = (
        await c.manager
          .createQueryBuilder()
          .select("s.*")
          .addSelect("t.used_at", "used_at")
          .from(Entities.auth_refresh_tokens, "t")
          .innerJoin(
            Entities.auth_refresh_sessions.options.name,
            "s",
            "s.id=t.session_id",
          )
          .where("token_hash=:p1")
          .setLock("pessimistic_write", undefined, ["t", "s"])
          .setParameters({ p1: tokenHash(raw) })
          .getRawMany()
      )[0];
      if (
        !row ||
        row.revoked_at ||
        new Date(row.expires_at).getTime() <= Date.now()
      )
        throw new HttpError(
          401,
          "Phiên đăng nhập đã hết hạn.",
          "REFRESH_INVALID",
        );
      if (row.used_at) {
        await c.manager
          .createQueryBuilder()
          .update(Entities.auth_refresh_sessions)
          .set({ revoked_at: () => "now()" })
          .where("id=:p1")
          .setParameters({ p1: row.id })
          .execute()
          .then((result) => result.raw);
        await c.commitTransaction();
        this.cookie(res);
        throw new HttpError(
          401,
          "Phiên đăng nhập đã bị thu hồi. Hãy đăng nhập lại.",
          "REFRESH_REUSED",
        );
      }
      const next = randomToken();
      await c.manager
        .createQueryBuilder()
        .update(Entities.auth_refresh_tokens)
        .set({ used_at: () => "now()" })
        .where("token_hash=:p1")
        .setParameters({ p1: tokenHash(raw) })
        .execute()
        .then((result) => result.raw);
      await c.manager
        .createQueryBuilder()
        .insert()
        .into(Entities.auth_refresh_tokens, ["token_hash", "session_id"])
        .values({ token_hash: () => ":p1", session_id: () => ":p2" })
        .updateEntity(false)
        .setParameters({ p1: tokenHash(next), p2: row.id })
        .execute()
        .then((result) => result.raw);
      const user = (
        await c.manager
          .createQueryBuilder()
          .select(["*"])
          .from(Entities.users, "row")
          .where("id=:p1")
          .setParameters({ p1: row.user_id })
          .getRawMany()
      )[0];
      await c.commitTransaction();
      this.cookie(res, next, new Date(row.expires_at));
      return this.access(user, row.id);
    } catch (e) {
      await rollback(c).catch(() => {});
      if (e instanceof HttpError && e.status === 401) this.cookie(res);
      throw e;
    } finally {
      await c.release();
    }
  }
  async authenticate(req: Request): Promise<Viewer & { sid: string }> {
    const header = req.get("authorization") || "";
    if (!header.startsWith("Bearer "))
      throw new HttpError(
        401,
        "Hãy đăng nhập để tiếp tục.",
        "ACCESS_TOKEN_REQUIRED",
      );
    let claims: Record<string, unknown>;
    try {
      claims = await this.jwt.verifyAsync(header.slice(7), {
        publicKey: this.publicKey,
        algorithms: ["RS256"],
        issuer: issuer(),
        audience: audience(),
      });
    } catch (e) {
      throw new HttpError(
        401,
        "Phiên truy cập không hợp lệ hoặc đã hết hạn.",
        (e as Error).name === "TokenExpiredError"
          ? "ACCESS_TOKEN_EXPIRED"
          : "ACCESS_TOKEN_INVALID",
      );
    }
    if (typeof claims.sub !== "string" || typeof claims.sid !== "string")
      throw new HttpError(
        401,
        "Phiên truy cập không hợp lệ.",
        "ACCESS_TOKEN_INVALID",
      );
    const row = (
      await ormDataSource
        .createQueryBuilder()
        .select(["u.*"])
        .from(Entities.users, "u")
        .innerJoin(
          Entities.auth_refresh_sessions.options.name,
          "s",
          "s.user_id=u.id",
        )
        .where(
          "s.id=:p1 AND u.id=:p2 AND s.revoked_at IS NULL AND s.expires_at>now()",
        )
        .setParameters({ p1: claims.sid, p2: claims.sub })
        .getRawMany<UserRow>()
    )[0];
    if (!row)
      throw new HttpError(
        401,
        "Phiên đăng nhập đã bị thu hồi.",
        "SESSION_REVOKED",
      );
    return { ...publicUser(row), sid: claims.sid };
  }
  async logout(req: Request, res: Response, all = false) {
    const user = await this.authenticate(req);
    await (all
      ? ormDataSource
          .createQueryBuilder()
          .update(Entities.auth_refresh_sessions)
          .set({ revoked_at: () => "now()" })
          .where("user_id=:p1 AND revoked_at IS NULL")
          .setParameters({ p1: all ? user.id : user.sid })
          .execute()
          .then((result) => result.raw)
      : ormDataSource
          .createQueryBuilder()
          .update(Entities.auth_refresh_sessions)
          .set({ revoked_at: () => "now()" })
          .where("id=:p1")
          .setParameters({ p1: all ? user.id : user.sid })
          .execute()
          .then((result) => result.raw));
    this.cookie(res);
    return { success: true };
  }
  private async oneTime(userId: string, purpose: "verify" | "reset") {
    const token = randomToken();
    await ormDataSource
      .createQueryBuilder()
      .insert()
      .into(Entities.auth_one_time_tokens, [
        "token_hash",
        "user_id",
        "purpose",
        "expires_at",
      ])
      .values({
        token_hash: () => ":p1",
        user_id: () => ":p2",
        purpose: () => ":p3",
        expires_at: () => "now()+interval '1 hour'",
      })
      .updateEntity(false)
      .setParameters({ p1: tokenHash(token), p2: userId, p3: purpose })
      .execute()
      .then((result) => result.raw);
    return token;
  }
  async signup(name: string, email: string, password: string) {
    const id = randomUUID(),
      hash = await hashPassword(password);
    const c = await createQueryRunner();
    try {
      await c.startTransaction();
      await c.manager
        .createQueryBuilder()
        .insert()
        .into(Entities.users, ["id", "name", "email", "email_verified"])
        .values({
          id: () => ":p1",
          name: () => ":p2",
          email: () => ":p3",
          email_verified: () => "false",
        })
        .updateEntity(false)
        .setParameters({ p1: id, p2: name, p3: email.toLowerCase() })
        .execute()
        .then((result) => result.raw);
      await c.manager
        .createQueryBuilder()
        .insert()
        .into(Entities.auth_identities, [
          "id",
          "account_id",
          "provider_id",
          "user_id",
          "password",
        ])
        .values({
          id: () => ":p1",
          account_id: () => ":p2",
          provider_id: () => "'credential'",
          user_id: () => ":p2",
          password: () => ":p3",
        })
        .updateEntity(false)
        .setParameters({ p1: randomUUID(), p2: id, p3: hash })
        .execute()
        .then((result) => result.raw);
      await c.commitTransaction();
    } catch (e) {
      await rollback(c);
      if ((e as { code?: string }).code === "23505")
        throw new HttpError(409, "Email đã được sử dụng.", "EMAIL_EXISTS");
      throw e;
    } finally {
      await c.release();
    }
    const token = await this.oneTime(id, "verify");
    await sendAuthEmail(
      email,
      "Xác minh email EverLang",
      `${origin()}/api/auth/verify-email?token=${token}`,
    );
    return { success: true, emailVerificationRequired: true };
  }
  async verifyEmail(token: string, res: Response) {
    const c = await createQueryRunner();
    let id: string;
    try {
      await c.startTransaction();
      const row = (
        await c.manager
          .createQueryBuilder()
          .delete()
          .from(Entities.auth_one_time_tokens)
          .where("token_hash=:p1 AND purpose='verify' AND expires_at>now()")
          .returning("user_id")
          .setParameters({ p1: tokenHash(token) })
          .execute()
          .then((result) => result.raw)
      )[0];
      if (!row)
        throw new HttpError(
          400,
          "Liên kết xác minh không hợp lệ hoặc đã hết hạn.",
          "TOKEN_EXPIRED",
        );
      id = row.user_id;
      await c.manager
        .createQueryBuilder()
        .update(Entities.users)
        .set({ email_verified: () => "true", updated_at: () => "now()" })
        .where("id=:p1")
        .setParameters({ p1: id })
        .execute()
        .then((result) => result.raw);
      await c.commitTransaction();
    } catch (e) {
      await rollback(c);
      throw e;
    } finally {
      await c.release();
    }
    await this.startSession(id!, res);
  }
  async requestReset(email: string) {
    const user = (
      await ormDataSource
        .createQueryBuilder()
        .select(["id"])
        .from(Entities.users, "row")
        .where("lower(email)=:p1")
        .setParameters({ p1: email.toLowerCase() })
        .getRawMany()
    )[0];
    if (user) {
      const token = await this.oneTime(user.id, "reset");
      await sendAuthEmail(
        email,
        "Đặt lại mật khẩu EverLang",
        `${origin()}/sign-in?token=${token}`,
      );
    }
    return { success: true };
  }
  async resetPassword(token: string, password: string) {
    const hash = await hashPassword(password),
      c = await createQueryRunner();
    try {
      await c.startTransaction();
      const row = (
        await c.manager
          .createQueryBuilder()
          .delete()
          .from(Entities.auth_one_time_tokens)
          .where("token_hash=:p1 AND purpose='reset' AND expires_at>now()")
          .returning("user_id")
          .setParameters({ p1: tokenHash(token) })
          .execute()
          .then((result) => result.raw)
      )[0];
      if (!row)
        throw new HttpError(
          400,
          "Liên kết đặt mật khẩu không hợp lệ hoặc đã hết hạn.",
          "TOKEN_EXPIRED",
        );
      await c.manager
        .createQueryBuilder()
        .delete()
        .from(Entities.auth_identities)
        .where("user_id=:p1 AND provider_id='credential'")
        .setParameters({ p1: row.user_id })
        .execute()
        .then((result) => result.raw);
      await c.manager
        .createQueryBuilder()
        .insert()
        .into(Entities.auth_identities, [
          "id",
          "account_id",
          "provider_id",
          "user_id",
          "password",
        ])
        .values({
          id: () => ":p1",
          account_id: () => ":p2",
          provider_id: () => "'credential'",
          user_id: () => ":p2",
          password: () => ":p3",
        })
        .updateEntity(false)
        .setParameters({ p1: randomUUID(), p2: row.user_id, p3: hash })
        .execute()
        .then((result) => result.raw);
      await c.manager
        .createQueryBuilder()
        .update(Entities.auth_refresh_sessions)
        .set({ revoked_at: () => "now()" })
        .where("user_id=:p1")
        .setParameters({ p1: row.user_id })
        .execute()
        .then((result) => result.raw);
      await c.manager
        .createQueryBuilder()
        .delete()
        .from(Entities.auth_one_time_tokens)
        .where("user_id=:p1 AND purpose='reset'")
        .setParameters({ p1: row.user_id })
        .execute()
        .then((result) => result.raw);
      await c.commitTransaction();
      return { success: true };
    } catch (e) {
      await rollback(c);
      throw e;
    } finally {
      await c.release();
    }
  }
  async changePassword(req: Request, current: string, next: string) {
    const user = await this.authenticate(req);
    const row = (
      await ormDataSource
        .createQueryBuilder()
        .select(["password"])
        .from(Entities.auth_identities, "row")
        .where("user_id=:p1 AND provider_id='credential'")
        .setParameters({ p1: user.id })
        .getRawMany()
    )[0];
    if (!row || !(await verifyPassword(current, row.password)))
      throw new HttpError(
        400,
        "Mật khẩu hiện tại không đúng.",
        "INVALID_CREDENTIALS",
      );
    const hash = await hashPassword(next),
      c = await createQueryRunner();
    try {
      await c.startTransaction();
      await c.manager
        .createQueryBuilder()
        .update(Entities.auth_identities)
        .set({ password: () => ":p2", updated_at: () => "now()" })
        .where("user_id=:p1 AND provider_id='credential'")
        .setParameters({ p1: user.id, p2: hash })
        .execute()
        .then((result) => result.raw);
      await c.manager
        .createQueryBuilder()
        .update(Entities.auth_refresh_sessions)
        .set({ revoked_at: () => "now()" })
        .where("user_id=:p1")
        .setParameters({ p1: user.id })
        .execute()
        .then((result) => result.raw);
      await c.commitTransaction();
    } catch (e) {
      await rollback(c);
      throw e;
    } finally {
      await c.release();
    }
    return { success: true };
  }
  async googleStart(
    req: Request,
    res: Response,
    link: boolean,
    callback: string,
  ) {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET)
      throw new HttpError(
        503,
        "Google chưa được cấu hình.",
        "PROVIDER_DISABLED",
      );
    const user = link ? await this.authenticate(req) : null;
    const state = randomToken(),
      nonce = randomToken(),
      verifier = randomToken();
    res.cookie("everlang_oauth", tokenHash(state), {
      httpOnly: true,
      secure: secure(),
      sameSite: "lax",
      path: "/api/auth/callback/google",
      maxAge: 600000,
    });
    const destination =
      callback.startsWith("/") &&
      !callback.startsWith("//") &&
      !callback.includes("\\")
        ? callback
        : "/";
    await ormDataSource
      .createQueryBuilder()
      .insert()
      .into(Entities.auth_one_time_tokens, [
        "token_hash",
        "user_id",
        "purpose",
        "payload",
        "expires_at",
      ])
      .values({
        token_hash: () => ":p1",
        user_id: () => ":p2",
        purpose: () => ":p3",
        payload: () => ":p4",
        expires_at: () => "now()+interval '10 minutes'",
      })
      .updateEntity(false)
      .setParameters({
        p1: tokenHash(state),
        p2: user?.id ?? null,
        p3: link ? "google-link" : "google-login",
        p4: JSON.stringify({
          nonce,
          verifier,
          callback: destination,
          sid: user?.sid,
        }),
      })
      .execute()
      .then((result) => result.raw);
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: `${origin()}/api/auth/callback/google`,
      response_type: "code",
      scope: "openid email profile",
      state,
      nonce,
      code_challenge: createHash("sha256").update(verifier).digest("base64url"),
      code_challenge_method: "S256",
    });
    return { url: `https://accounts.google.com/o/oauth2/v2/auth?${params}` };
  }
  async googleCallback(
    req: Request,
    code: string,
    state: string,
    res: Response,
  ) {
    if (req.cookies?.everlang_oauth !== tokenHash(state))
      throw new HttpError(
        400,
        "Phiên Google không đúng trình duyệt.",
        "STATE_MISMATCH",
      );
    res.clearCookie("everlang_oauth", {
      httpOnly: true,
      secure: secure(),
      sameSite: "lax",
      path: "/api/auth/callback/google",
    });
    const saved = (
      await ormDataSource
        .createQueryBuilder()
        .delete()
        .from(Entities.auth_one_time_tokens)
        .where(
          "token_hash=:p1 AND purpose IN ('google-login','google-link') AND expires_at>now()",
        )
        .returning("*")
        .setParameters({ p1: tokenHash(state) })
        .execute()
        .then((result) => result.raw)
    )[0];
    if (!saved)
      throw new HttpError(
        400,
        "Phiên đăng nhập Google không hợp lệ.",
        "STATE_MISMATCH",
      );
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${origin()}/api/auth/callback/google`,
        grant_type: "authorization_code",
        code_verifier: saved.payload.verifier,
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok)
      throw new HttpError(
        502,
        "Google chưa hoàn tất đăng nhập. Hãy thử lại.",
        "GOOGLE_EXCHANGE_FAILED",
      );
    const tokens = (await response.json()) as { id_token?: string };
    if (!tokens.id_token)
      throw new HttpError(
        502,
        "Google không trả thông tin đăng nhập.",
        "GOOGLE_ID_TOKEN_MISSING",
      );
    const { createRemoteJWKSet, jwtVerify } = await import("jose");
    const jwks = createRemoteJWKSet(
      new URL("https://www.googleapis.com/oauth2/v3/certs"),
    );
    const { payload } = await jwtVerify(tokens.id_token, jwks, {
      issuer: ["https://accounts.google.com", "accounts.google.com"],
      audience: process.env.GOOGLE_CLIENT_ID,
      algorithms: ["RS256"],
    });
    if (
      payload.nonce !== saved.payload.nonce ||
      payload.email_verified !== true ||
      typeof payload.email !== "string" ||
      !payload.sub
    )
      throw new HttpError(
        403,
        "Không xác minh được tài khoản Google.",
        "GOOGLE_ID_INVALID",
      );
    const c = await createQueryRunner();
    let userId: string;
    try {
      await c.startTransaction();
      if (saved.purpose === "google-link") {
        const active = (
          await c.manager
            .createQueryBuilder()
            .select(["user_id"])
            .from(Entities.auth_refresh_sessions, "row")
            .where(
              "id=:p1 AND user_id=:p2 AND revoked_at IS NULL AND expires_at>now()",
            )
            .setParameters({ p1: saved.payload.sid, p2: saved.user_id })
            .getRawMany()
        )[0];
        if (!active)
          throw new HttpError(
            401,
            "Hãy đăng nhập lại để liên kết Google.",
            "SESSION_REVOKED",
          );
        userId = saved.user_id;
        await c.manager
          .createQueryBuilder()
          .insert()
          .into(Entities.auth_identities, [
            "id",
            "account_id",
            "provider_id",
            "user_id",
          ])
          .values({
            id: () => ":p1",
            account_id: () => ":p2",
            provider_id: () => "'google'",
            user_id: () => ":p3",
          })
          .updateEntity(false)
          .setParameters({ p1: randomUUID(), p2: payload.sub, p3: userId })
          .execute()
          .then((result) => result.raw);
      } else {
        const identity = (
          await c.manager
            .createQueryBuilder()
            .select(["user_id"])
            .from(Entities.auth_identities, "row")
            .where("provider_id='google' AND account_id=:p1")
            .setParameters({ p1: payload.sub })
            .getRawMany()
        )[0];
        if (identity) userId = identity.user_id;
        else {
          if (
            (
              await c.manager
                .createQueryBuilder()
                .select(["id"])
                .from(Entities.users, "row")
                .where("lower(email)=:p1")
                .setParameters({ p1: payload.email.toLowerCase() })
                .getRawMany()
            ).length
          )
            throw new HttpError(
              409,
              "Email đã tồn tại. Hãy đăng nhập rồi liên kết Google tại hồ sơ.",
              "ACCOUNT_NOT_LINKED",
            );
          userId = randomUUID();
          await c.manager
            .createQueryBuilder()
            .insert()
            .into(Entities.users, [
              "id",
              "name",
              "email",
              "email_verified",
              "image",
            ])
            .values({
              id: () => ":p1",
              name: () => ":p2",
              email: () => ":p3",
              email_verified: () => "true",
              image: () => ":p4",
            })
            .updateEntity(false)
            .setParameters({
              p1: userId,
              p2: String(payload.name || payload.email),
              p3: payload.email.toLowerCase(),
              p4: typeof payload.picture === "string" ? payload.picture : null,
            })
            .execute()
            .then((result) => result.raw);
          await c.manager
            .createQueryBuilder()
            .insert()
            .into(Entities.auth_identities, [
              "id",
              "account_id",
              "provider_id",
              "user_id",
            ])
            .values({
              id: () => ":p1",
              account_id: () => ":p2",
              provider_id: () => "'google'",
              user_id: () => ":p3",
            })
            .updateEntity(false)
            .setParameters({ p1: randomUUID(), p2: payload.sub, p3: userId })
            .execute()
            .then((result) => result.raw);
        }
      }
      await c.commitTransaction();
    } catch (e) {
      await rollback(c);
      if ((e as { code?: string }).code === "23505")
        throw new HttpError(
          409,
          "Google đã được liên kết.",
          "ACCOUNT_ALREADY_LINKED",
        );
      throw e;
    } finally {
      await c.release();
    }
    await this.startSession(userId!, res);
    return saved.payload.callback as string;
  }
}
