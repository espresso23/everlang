import { afterEach, expect, it, vi } from "vitest";
import { z } from "zod";
import { aiErrorResponse, generateJson, ProviderError, retryAfterMs } from "@everlang/backend/ai";
import { log } from "@everlang/backend/logger";

import { guardedTask, installProcessErrorHandlers } from "@everlang/backend/process-errors";

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

it("keeps 429 and Retry-After when upstream body is not JSON", async () => {
  vi.stubEnv("OPENROUTER_API_KEY", "test-only");
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("busy", { status: 429, headers: { "Retry-After": "120" } })));
  const error = await generateJson(z.object({ ok: z.boolean() }), "test").catch(e => e);
  expect(error).toBeInstanceOf(ProviderError);
  expect(error.status).toBe(429);
  expect(error.retryAfterMs).toBe(120000);
  expect(aiErrorResponse(error).status).toBe(429);
  expect(JSON.parse(warn.mock.calls[0][0])).toMatchObject({ event: "ai.request.rate_limited", retryAfterMs: 120000 });
});

it("parses retry dates and bounds invalid/untrusted retry headers", () => {
  expect(retryAfterMs("Sat, 31 Oct 2026 13:02:00 GMT", Date.parse("2026-10-31T13:00:00Z"))).toBe(120000);
  expect(retryAfterMs("bad")).toBeUndefined();
  expect(retryAfterMs("-2")).toBeUndefined();
  expect(retryAfterMs("0")).toBe(1000);
  expect(retryAfterMs("9999999999")).toBe(86400000);
  expect(retryAfterMs(null)).toBeUndefined();
});

it("redacts nested secret/client data and survives circular log fields", () => {
  const out = vi.spyOn(console, "warn").mockImplementation(() => {});
  const nested: Record<string, unknown> = { apiKey: "do-not-print", client: { secretKey: "private" }, url: "postgresql://test:private@db/data", usage: { total_tokens: 12 } };
  nested.cycle = nested;
  log("warn", "test.redaction", { nested });
  const line = String(out.mock.calls[0][0]);
  expect(line).not.toContain("do-not-print");
  expect(line).not.toContain("private");
  expect(JSON.parse(line).nested.usage.total_tokens).toBe(12);
});

it("catches rejected async emitter tasks and synchronous throws", async () => {
  const out = vi.spyOn(console, "error").mockImplementation(() => {});
  await guardedTask("test.failure", async () => { throw new Error("offline"); });
  await guardedTask("test.failure", () => { throw new Error("sync"); });
  expect(out).toHaveBeenCalledTimes(2);
});

it("fatal boundary logs normalized errors and exits rather than swallowing faults", () => {
  const out = vi.spyOn(console, "error").mockImplementation(() => {});
  const exit = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
  const previous = new Set(process.listeners("uncaughtException"));
  const remove = installProcessErrorHandlers("test-worker");
  try {
    const listener = process.listeners("uncaughtException").find(l => !previous.has(l))!;
    listener(new Error("fatal"), "uncaughtException");
    expect(exit).toHaveBeenCalledWith(1);
    expect(JSON.parse(out.mock.calls[0][0])).toMatchObject({ event: "process.uncaught_exception", component: "test-worker" });
  } finally { remove(); }
});

it("ORM pool idle error is handled without serializing its attached client", async () => {
  const {databaseOptions} = await import("@everlang/backend/orm");
  const out=vi.spyOn(console,"error").mockImplementation(()=>{});
  const options=databaseOptions();if(options.type!=="postgres")throw new Error("Expected PostgreSQL");
  expect(options.poolErrorHandler).toBeTypeOf("function");
  Reflect.apply(options.poolErrorHandler!,null,[new Error("Connection terminated unexpectedly"),{secretKey:"private"}]);
  expect(String(out.mock.calls[0][0])).not.toContain("private");
  expect(JSON.parse(out.mock.calls[0][0]).event).toBe("database.pool.error");
});
it("ORM errors never log query text, bindings or driver-echoed input",async()=>{
  const {logError}=await import("@everlang/backend/logger");const out=vi.spyOn(console,"error").mockImplementation(()=>{});
  const error=Object.assign(new Error("invalid UUID private-body-value"),{name:"QueryFailedError",query:"SELECT private-query",parameters:["private-token"],driverError:{code:"22P02"}});
  logError("test.orm",error);const line=String(out.mock.calls[0][0]);expect(line).not.toContain("private-");expect(JSON.parse(line)).toMatchObject({databaseCode:"22P02",errorMessage:"Database operation failed"});
});
