import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

type RequestContext = { requestId: string };
type LogLevel = "debug" | "info" | "warn" | "error";
type LogFields = Record<string, unknown>;
type ApiHandler = (request: NextRequest) => Response | Promise<Response>;

const requestContext = new AsyncLocalStorage<RequestContext>();
const levelWeight: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };

function configuredLevel(): LogLevel {
  const requested = process.env.LOG_LEVEL?.toLowerCase();
  return requested && requested in levelWeight ? requested as LogLevel : "info";
}

function redact(value: string): string {
  return value
    .replace(/sk-or-v1-[a-z\d_-]+/gi, "[REDACTED_OPENROUTER_KEY]")
    .replace(/AIza[\w-]{20,}/g, "[REDACTED_GOOGLE_KEY]")
    .replace(/Bearer\s+[^\s"']+/gi, "Bearer [REDACTED]")
    .replace(/GOCSPX-[\w-]+/g, "[REDACTED_GOOGLE_SECRET]")
    .replace(/postgres(?:ql)?:\/\/[^\s"'<>]+/gi, "postgresql://[REDACTED]")
    .replace(/mongodb(?:\+srv)?:\/\/[^\s"']+/gi, "mongodb://[REDACTED]");
}

function safeFields(fields: LogFields): LogFields {
  return Object.fromEntries(Object.entries(fields).map(([key, value]) => [
    key,
    typeof value === "string" ? redact(value).slice(0, 2000) : value,
  ]));
}

export function log(level: LogLevel, event: string, fields: LogFields = {}) {
  if (levelWeight[level] < levelWeight[configuredLevel()]) return;
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    service: "everlang",
    event,
    requestId: requestContext.getStore()?.requestId,
    ...safeFields(fields),
  };
  const line = JSON.stringify(entry);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else if (level === "debug") console.debug(line);
  else console.info(line);
}

export function logError(event: string, error: unknown, fields: LogFields = {}) {
  const detail = error instanceof Error
    ? { errorName: error.name, errorMessage: error.message, errorStack: error.stack }
    : { errorMessage: String(error) };
  log("error", event, { ...detail, ...fields });
}

function incomingRequestId(request: NextRequest): string {
  const candidate = request.headers.get("x-request-id")?.trim() ?? "";
  return /^[a-z\d._-]{8,80}$/i.test(candidate) ? candidate : randomUUID();
}

export function withApiLogging(route: string, handler: ApiHandler) {
  return async (request: NextRequest): Promise<Response> => {
    const requestId = incomingRequestId(request);
    const startedAt = performance.now();
    return requestContext.run({ requestId }, async () => {
      let response: Response;
      try {
        response = await handler(request);
      } catch (error) {
        logError("http.request.unhandled_error", error, {
          method: request.method,
          route,
          statusCode: 500,
        });
        response = NextResponse.json(
          { error: "Lỗi nội bộ máy chủ.", requestId },
          { status: 500 },
        );
      }

      response.headers.set("x-request-id", requestId);
      const statusCode = response.status;
      log(statusCode >= 500 ? "error" : statusCode >= 400 ? "warn" : "info", "http.request.completed", {
        method: request.method,
        route,
        statusCode,
        durationMs: Math.round((performance.now() - startedAt) * 100) / 100,
      });
      return response;
    });
  };
}
