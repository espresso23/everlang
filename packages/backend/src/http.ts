import type { Request } from 'express';

export type Viewer = { id: string; email: string; name: string; image?: string | null; emailVerified: boolean; admin: boolean };
export class HttpError extends Error {
  constructor(public status: number, message: string, public code?: string) { super(message); }
}
export class HttpResult {
  constructor(public body: unknown, public status = 200, public headers: Record<string, string> = {}) {}
  static json(body: unknown, options: { status?: number; headers?: Record<string, string> } = {}) { return new HttpResult(body, options.status, options.headers); }
}
export class BinaryResult {
  constructor(public bytes: Uint8Array, public options: { headers: Record<string, string> }) {}
}
export function queryParams(request: Request) {
  return new URL(request.originalUrl, 'http://internal').searchParams;
}
