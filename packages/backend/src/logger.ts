import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";


export type RequestContext = { requestId: string; jobId?: string; attempt?: number };
type LogLevel = "debug" | "info" | "warn" | "error";
type LogFields = Record<string, unknown>;
export const requestContext = new AsyncLocalStorage<RequestContext>();
export function correlationId(candidate?: string) { return candidate && /^[a-z\d._-]{8,80}$/i.test(candidate) ? candidate : randomUUID(); }
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
    .replace(/rediss?:\/\/[^\s"'<>]+/gi, "redis://[REDACTED]")
    .replace(/mongodb(?:\+srv)?:\/\/[^\s"']+/gi, "mongodb://[REDACTED]");
}

function safeFields(fields: LogFields): LogFields {
  const seen = new WeakSet<object>();
  function safe(value: unknown, depth: number): unknown {
    if (typeof value === "string") return redact(value).slice(0, 2000);
    if (typeof value === "bigint") return String(value);
    if (!value || typeof value !== "object") return typeof value === "function" ? "[omitted]" : value;
    if (depth > 5 || seen.has(value)) return "[omitted]";
    seen.add(value);
    if (value instanceof Error) return { name: value.name, message: safe(value.message, depth + 1) };
    if (Array.isArray(value)) return value.slice(0, 30).map(item => safe(item, depth + 1));
    return Object.fromEntries(Object.entries(value).slice(0, 40).map(([key, item]) => [key,
      /password|secret|authorization|cookie|api.?key|connectionstring|^body$|^audio$|^translation$|^prompt$|^client$|^(?:(?:access|refresh|id|session)[_-]?)?token$/i.test(key) ? "[REDACTED]" : safe(item, depth + 1),
    ]));
  }
  return safe(fields, 0) as LogFields;
}

export function log(level: LogLevel, event: string, fields: LogFields = {}) {
  if (levelWeight[level] < levelWeight[configuredLevel()]) return;
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    service: process.env.SERVICE_NAME || "everlang-api",
    environment: process.env.NODE_ENV || "development",
    event,
    ...requestContext.getStore(),
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
