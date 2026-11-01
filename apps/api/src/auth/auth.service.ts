import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request, Response } from 'express';
import { randomUUID, createHmac, timingSafeEqual, createHash } from 'node:crypto';
import nodemailer from 'nodemailer';
import { pool, query } from '@everlang/backend/sql';
import { rateLimit } from '@everlang/backend/redis';
import { HttpError, type Viewer } from '@everlang/backend/http';
import { hashPassword, verifyPassword, randomToken, tokenHash } from '@everlang/backend/auth-crypto';

const isAdmin = (email: string) => (process.env.ADMIN_EMAILS || '').split(',').map(s => s.trim().toLowerCase()).includes(email.toLowerCase());
const origin = () => process.env.PUBLIC_ORIGIN || 'http://localhost:3000';
const secure = () => new URL(origin()).protocol === 'https:';
const refreshName = () => secure() ? '__Secure-everlang_refresh' : 'everlang_refresh';
const issuer = () => process.env.JWT_ISSUER || 'everlang';
const audience = () => process.env.JWT_AUDIENCE || 'everlang-web';
type UserRow = {id:string;email:string;name:string;image?:string|null;email_verified:boolean};
const publicUser = (r: UserRow) => ({ id: r.id, email: r.email, name: r.name, image: r.image ?? null, emailVerified: r.email_verified, admin: isAdmin(r.email) });

@Injectable()
export class AuthService {
  private readonly jwt = new JwtService();
  private readonly privateKey = Buffer.from(process.env.JWT_PRIVATE_KEY_B64 || '', 'base64').toString();
  private readonly publicKey = Buffer.from(process.env.JWT_PUBLIC_KEY_B64 || '', 'base64').toString();
  constructor() {
    if (!this.privateKey || !this.publicKey || !process.env.CSRF_SECRET) throw new Error('JWT key pair and CSRF_SECRET must be configured');
  }
  csrf(req: Request, res: Response) {
    const nonce = req.cookies?.everlang_csrf || randomToken();
    res.cookie('everlang_csrf', nonce, { httpOnly: true, secure: secure(), sameSite: 'lax', path: '/api/auth', maxAge: 86400000 });
    return { csrfToken: createHmac('sha256', process.env.CSRF_SECRET!).update(nonce).digest('hex') };
  }
  async protect(req: Request, action = 'auth') {
    if (req.get('origin') !== origin()) throw new HttpError(403, 'Nguồn yêu cầu không hợp lệ.', 'INVALID_ORIGIN');
    const nonce = req.cookies?.everlang_csrf;
    const actual = req.get('x-csrf-token') || '';
    const expected = nonce ? createHmac('sha256', process.env.CSRF_SECRET!).update(nonce).digest('hex') : '';
    if (!expected || actual.length !== expected.length || !timingSafeEqual(Buffer.from(actual), Buffer.from(expected))) throw new HttpError(403, 'Mã bảo vệ yêu cầu không hợp lệ.', 'CSRF_INVALID');
    if (!(await rateLimit(req.ip || 'unknown', action, 30))) throw new HttpError(429, 'Bạn gửi quá nhanh. Hãy thử lại sau.', 'RATE_LIMITED');
  }
  private cookie(res: Response, token?: string, expires?: Date) {
    const options = { httpOnly: true, secure: secure(), sameSite: 'lax' as const, path: '/api/auth' };
    if (token) res.cookie(refreshName(), token, { ...options, expires });
    else res.clearCookie(refreshName(), options);
  }
  private async access(user: UserRow, sid: string) {
    return { accessToken: await this.jwt.signAsync({ sub: user.id, sid, jti: randomUUID(), roles: isAdmin(user.email) ? ['learner', 'admin'] : ['learner'], emailVerified: user.email_verified }, { privateKey: this.privateKey, algorithm: 'RS256', issuer: issuer(), audience: audience(), expiresIn: 900 }), expiresIn: 900, user: publicUser(user) };
  }
  async startSession(userId: string, res: Response) {
    const user = (await query<UserRow>('SELECT * FROM users WHERE id=$1', [userId]))[0];
    if (!user?.email_verified) throw new HttpError(403, 'Hãy xác minh email trước khi đăng nhập.', 'EMAIL_NOT_VERIFIED');
    const sid = randomUUID(), token = randomToken(), expires = new Date(Date.now() + 30 * 86400000);
    const c = await pool.connect();
    try {
      await c.query('BEGIN');
      await c.query('INSERT INTO auth_refresh_sessions(id,user_id,expires_at) VALUES($1,$2,$3)', [sid, userId, expires]);
      await c.query('INSERT INTO auth_refresh_tokens(token_hash,session_id) VALUES($1,$2)', [tokenHash(token), sid]);
      await c.query('COMMIT');
    } catch (e) { await c.query('ROLLBACK'); throw e; } finally { c.release(); }
    this.cookie(res, token, expires);
    return this.access(user, sid);
  }
  async login(email: string, password: string, res: Response) {
    const row = (await query("SELECT u.*,i.password FROM users u JOIN auth_identities i ON i.user_id=u.id AND i.provider_id='credential' WHERE lower(u.email)=$1", [email.toLowerCase()]))[0];
    if (!row || !(await verifyPassword(password, row.password || ''))) throw new HttpError(401, 'Email hoặc mật khẩu không đúng.', 'INVALID_CREDENTIALS');
    return this.startSession(row.id, res);
  }
  async refresh(req: Request, res: Response) {
    const raw = req.cookies?.[refreshName()];
    if (typeof raw !== 'string' || raw.length > 200) throw new HttpError(401, 'Hãy đăng nhập để tiếp tục.', 'REFRESH_INVALID');
    const c = await pool.connect();
    try {
      await c.query('BEGIN');
      const row = (await c.query('SELECT t.used_at,s.* FROM auth_refresh_tokens t JOIN auth_refresh_sessions s ON s.id=t.session_id WHERE token_hash=$1 FOR UPDATE OF t,s', [tokenHash(raw)])).rows[0];
      if (!row || row.revoked_at || new Date(row.expires_at).getTime() <= Date.now()) throw new HttpError(401, 'Phiên đăng nhập đã hết hạn.', 'REFRESH_INVALID');
      if (row.used_at) {
        await c.query('UPDATE auth_refresh_sessions SET revoked_at=now() WHERE id=$1', [row.id]);
        await c.query('COMMIT');
        this.cookie(res);
        throw new HttpError(401, 'Phiên đăng nhập đã bị thu hồi. Hãy đăng nhập lại.', 'REFRESH_REUSED');
      }
      const next = randomToken();
      await c.query('UPDATE auth_refresh_tokens SET used_at=now() WHERE token_hash=$1', [tokenHash(raw)]);
      await c.query('INSERT INTO auth_refresh_tokens(token_hash,session_id) VALUES($1,$2)', [tokenHash(next), row.id]);
      const user = (await c.query('SELECT * FROM users WHERE id=$1', [row.user_id])).rows[0];
      await c.query('COMMIT');
      this.cookie(res, next, new Date(row.expires_at));
      return this.access(user, row.id);
    } catch (e) { await c.query('ROLLBACK').catch(() => {}); if (e instanceof HttpError && e.status === 401) this.cookie(res); throw e; } finally { c.release(); }
  }
  async authenticate(req: Request): Promise<Viewer & { sid: string }> {
    const header = req.get('authorization') || '';
    if (!header.startsWith('Bearer ')) throw new HttpError(401, 'Hãy đăng nhập để tiếp tục.', 'ACCESS_TOKEN_REQUIRED');
    let claims: Record<string, unknown>;
    try { claims = await this.jwt.verifyAsync(header.slice(7), { publicKey: this.publicKey, algorithms: ['RS256'], issuer: issuer(), audience: audience() }); }
    catch (e) { throw new HttpError(401, 'Phiên truy cập không hợp lệ hoặc đã hết hạn.', (e as Error).name === 'TokenExpiredError' ? 'ACCESS_TOKEN_EXPIRED' : 'ACCESS_TOKEN_INVALID'); }
    if (typeof claims.sub !== 'string' || typeof claims.sid !== 'string') throw new HttpError(401, 'Phiên truy cập không hợp lệ.', 'ACCESS_TOKEN_INVALID');
    const row = (await query<UserRow>('SELECT u.* FROM users u JOIN auth_refresh_sessions s ON s.user_id=u.id WHERE s.id=$1 AND u.id=$2 AND s.revoked_at IS NULL AND s.expires_at>now()', [claims.sid, claims.sub]))[0];
    if (!row) throw new HttpError(401, 'Phiên đăng nhập đã bị thu hồi.', 'SESSION_REVOKED');
    return { ...publicUser(row), sid: claims.sid };
  }
  async logout(req: Request, res: Response, all = false) {
    const user = await this.authenticate(req);
    await query(all ? 'UPDATE auth_refresh_sessions SET revoked_at=now() WHERE user_id=$1 AND revoked_at IS NULL' : 'UPDATE auth_refresh_sessions SET revoked_at=now() WHERE id=$1', [all ? user.id : user.sid]);
    this.cookie(res); return { success: true };
  }
  private async mail(to: string, subject: string, url: string) {
    await nodemailer.createTransport({ host: process.env.SMTP_HOST || 'mailpit', port: Number(process.env.SMTP_PORT || 1025), secure: process.env.SMTP_SECURE === 'true', ...(process.env.SMTP_USER ? { auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } } : {}) }).sendMail({ from: process.env.MAIL_FROM || 'EverLang <hello@everlang.local>', to, subject, text: `${subject}\n\n${url}\n\nNếu không yêu cầu, bạn có thể bỏ qua email này.` });
  }
  private async oneTime(userId: string, purpose: 'verify' | 'reset') {
    const token = randomToken();
    await query('INSERT INTO auth_one_time_tokens(token_hash,user_id,purpose,expires_at) VALUES($1,$2,$3,now()+interval \'1 hour\')', [tokenHash(token), userId, purpose]);
    return token;
  }
  async signup(name: string, email: string, password: string) {
    const id = randomUUID(), hash = await hashPassword(password);
    const c = await pool.connect();
    try {
      await c.query('BEGIN');
      await c.query('INSERT INTO users(id,name,email,email_verified) VALUES($1,$2,$3,false)', [id, name, email.toLowerCase()]);
      await c.query("INSERT INTO auth_identities(id,account_id,provider_id,user_id,password) VALUES($1,$2,'credential',$2,$3)", [randomUUID(), id, hash]);
      await c.query('COMMIT');
    } catch (e) { await c.query('ROLLBACK'); if ((e as {code?:string}).code === '23505') throw new HttpError(409, 'Email đã được sử dụng.', 'EMAIL_EXISTS'); throw e; } finally { c.release(); }
    const token = await this.oneTime(id, 'verify');
    await this.mail(email, 'Xác minh email EverLang', `${origin()}/api/auth/verify-email?token=${token}`);
    return { success: true, emailVerificationRequired: true };
  }
  async verifyEmail(token: string, res: Response) {
    const c = await pool.connect(); let id: string;
    try {
      await c.query('BEGIN');
      const row = (await c.query("DELETE FROM auth_one_time_tokens WHERE token_hash=$1 AND purpose='verify' AND expires_at>now() RETURNING user_id", [tokenHash(token)])).rows[0];
      if (!row) throw new HttpError(400, 'Liên kết xác minh không hợp lệ hoặc đã hết hạn.', 'TOKEN_EXPIRED');
      id = row.user_id;
      await c.query('UPDATE users SET email_verified=true,updated_at=now() WHERE id=$1', [id]);
      await c.query('COMMIT');
    } catch (e) { await c.query('ROLLBACK'); throw e; } finally { c.release(); }
    await this.startSession(id!, res);
  }
  async requestReset(email: string) {
    const user = (await query('SELECT id FROM users WHERE lower(email)=$1', [email.toLowerCase()]))[0];
    if (user) {
      const token = await this.oneTime(user.id, 'reset');
      await this.mail(email, 'Đặt lại mật khẩu EverLang', `${origin()}/sign-in?token=${token}`);
    }
    return { success: true };
  }
  async resetPassword(token: string, password: string) {
    const hash = await hashPassword(password), c = await pool.connect();
    try {
      await c.query('BEGIN');
      const row = (await c.query("DELETE FROM auth_one_time_tokens WHERE token_hash=$1 AND purpose='reset' AND expires_at>now() RETURNING user_id", [tokenHash(token)])).rows[0];
      if (!row) throw new HttpError(400, 'Liên kết đặt mật khẩu không hợp lệ hoặc đã hết hạn.', 'TOKEN_EXPIRED');
      await c.query("DELETE FROM auth_identities WHERE user_id=$1 AND provider_id='credential'", [row.user_id]);
      await c.query("INSERT INTO auth_identities(id,account_id,provider_id,user_id,password) VALUES($1,$2,'credential',$2,$3)", [randomUUID(), row.user_id, hash]);
      await c.query('UPDATE auth_refresh_sessions SET revoked_at=now() WHERE user_id=$1', [row.user_id]);
      await c.query("DELETE FROM auth_one_time_tokens WHERE user_id=$1 AND purpose='reset'", [row.user_id]);
      await c.query('COMMIT');
      return { success: true };
    } catch (e) { await c.query('ROLLBACK'); throw e; } finally { c.release(); }
  }
  async changePassword(req: Request, current: string, next: string) {
    const user = await this.authenticate(req);
    const row = (await query("SELECT password FROM auth_identities WHERE user_id=$1 AND provider_id='credential'", [user.id]))[0];
    if (!row || !await verifyPassword(current, row.password)) throw new HttpError(400, 'Mật khẩu hiện tại không đúng.', 'INVALID_CREDENTIALS');
    const hash = await hashPassword(next), c = await pool.connect();
    try { await c.query('BEGIN'); await c.query("UPDATE auth_identities SET password=$2,updated_at=now() WHERE user_id=$1 AND provider_id='credential'", [user.id, hash]); await c.query('UPDATE auth_refresh_sessions SET revoked_at=now() WHERE user_id=$1', [user.id]); await c.query('COMMIT'); } catch(e) { await c.query('ROLLBACK'); throw e; } finally { c.release(); }
    return { success: true };
  }
  async googleStart(req: Request, res: Response, link: boolean, callback: string) {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) throw new HttpError(503, 'Google chưa được cấu hình.', 'PROVIDER_DISABLED');
    const user = link ? await this.authenticate(req) : null;
    const state = randomToken(), nonce = randomToken(), verifier = randomToken();
    res.cookie('everlang_oauth', tokenHash(state), {httpOnly:true,secure:secure(),sameSite:'lax',path:'/api/auth/callback/google',maxAge:600000});
    const destination = callback.startsWith('/') && !callback.startsWith('//') && !callback.includes('\\') ? callback : '/';
    await query("INSERT INTO auth_one_time_tokens(token_hash,user_id,purpose,payload,expires_at) VALUES($1,$2,$3,$4,now()+interval '10 minutes')", [tokenHash(state), user?.id ?? null, link ? 'google-link' : 'google-login', JSON.stringify({ nonce, verifier, callback: destination, sid: user?.sid })]);
    const params = new URLSearchParams({ client_id: process.env.GOOGLE_CLIENT_ID, redirect_uri: `${origin()}/api/auth/callback/google`, response_type: 'code', scope: 'openid email profile', state, nonce, code_challenge: createHash('sha256').update(verifier).digest('base64url'), code_challenge_method: 'S256' });
    return { url: `https://accounts.google.com/o/oauth2/v2/auth?${params}` };
  }
  async googleCallback(req: Request, code: string, state: string, res: Response) {
    if (req.cookies?.everlang_oauth !== tokenHash(state)) throw new HttpError(400, 'Phiên Google không đúng trình duyệt.', 'STATE_MISMATCH');
    res.clearCookie('everlang_oauth',{httpOnly:true,secure:secure(),sameSite:'lax',path:'/api/auth/callback/google'});
    const saved = (await query("DELETE FROM auth_one_time_tokens WHERE token_hash=$1 AND purpose IN ('google-login','google-link') AND expires_at>now() RETURNING *", [tokenHash(state)]))[0];
    if (!saved) throw new HttpError(400, 'Phiên đăng nhập Google không hợp lệ.', 'STATE_MISMATCH');
    const response = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ code, client_id: process.env.GOOGLE_CLIENT_ID!, client_secret: process.env.GOOGLE_CLIENT_SECRET!, redirect_uri: `${origin()}/api/auth/callback/google`, grant_type: 'authorization_code', code_verifier: saved.payload.verifier }), signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new HttpError(502, 'Google chưa hoàn tất đăng nhập. Hãy thử lại.', 'GOOGLE_EXCHANGE_FAILED');
    const tokens = await response.json() as { id_token?: string };
    if (!tokens.id_token) throw new HttpError(502, 'Google không trả thông tin đăng nhập.', 'GOOGLE_ID_TOKEN_MISSING');
    const {createRemoteJWKSet,jwtVerify}=await import('jose');
    const jwks=createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));
    const { payload } = await jwtVerify(tokens.id_token, jwks, { issuer: ['https://accounts.google.com', 'accounts.google.com'], audience: process.env.GOOGLE_CLIENT_ID, algorithms: ['RS256'] });
    if (payload.nonce !== saved.payload.nonce || payload.email_verified !== true || typeof payload.email !== 'string' || !payload.sub) throw new HttpError(403, 'Không xác minh được tài khoản Google.', 'GOOGLE_ID_INVALID');
    const c = await pool.connect(); let userId: string;
    try {
      await c.query('BEGIN');
      if (saved.purpose === 'google-link') {
        const active = (await c.query('SELECT user_id FROM auth_refresh_sessions WHERE id=$1 AND user_id=$2 AND revoked_at IS NULL AND expires_at>now()', [saved.payload.sid, saved.user_id])).rows[0];
        if (!active) throw new HttpError(401, 'Hãy đăng nhập lại để liên kết Google.', 'SESSION_REVOKED');
        userId = saved.user_id;
        await c.query("INSERT INTO auth_identities(id,account_id,provider_id,user_id) VALUES($1,$2,'google',$3)", [randomUUID(), payload.sub, userId]);
      } else {
        const identity = (await c.query("SELECT user_id FROM auth_identities WHERE provider_id='google' AND account_id=$1", [payload.sub])).rows[0];
        if (identity) userId = identity.user_id;
        else {
          if ((await c.query('SELECT id FROM users WHERE lower(email)=$1', [payload.email.toLowerCase()])).rowCount) throw new HttpError(409, 'Email đã tồn tại. Hãy đăng nhập rồi liên kết Google tại hồ sơ.', 'ACCOUNT_NOT_LINKED');
          userId = randomUUID();
          await c.query('INSERT INTO users(id,name,email,email_verified,image) VALUES($1,$2,$3,true,$4)', [userId, String(payload.name || payload.email), payload.email.toLowerCase(), typeof payload.picture === 'string' ? payload.picture : null]);
          await c.query("INSERT INTO auth_identities(id,account_id,provider_id,user_id) VALUES($1,$2,'google',$3)", [randomUUID(), payload.sub, userId]);
        }
      }
      await c.query('COMMIT');
    } catch(e) { await c.query('ROLLBACK'); if ((e as {code?:string}).code === '23505') throw new HttpError(409, 'Google đã được liên kết.', 'ACCOUNT_ALREADY_LINKED'); throw e; } finally { c.release(); }
    await this.startSession(userId!, res);
    return saved.payload.callback as string;
  }
}
