import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { Job } from "bullmq";

const state = vi.hoisted(() => ({
  processor: undefined as unknown as (job: Job) => Promise<void>,
  listeners: {} as Record<string, (...args: unknown[]) => unknown>,
  options: {} as Record<string, unknown>,
  query: vi.fn(), grade: vi.fn(), rateLimit: vi.fn(), add: vi.fn(), getJob: vi.fn(), logError: vi.fn(),
}));
vi.mock("ioredis", () => ({ default: class { on() { return this; } quit = vi.fn(); } }));
vi.mock("../../lib/sql", () => ({ query: state.query, pool: { end: vi.fn() } }));
vi.mock("../../lib/redis", () => ({ redis: { quit: vi.fn() }, getGradingQueue: () => ({ add: state.add, getJob: state.getJob, rateLimit: state.rateLimit, close: vi.fn() }) }));
vi.mock("../../lib/logger", () => ({ log: vi.fn(), logError: state.logError }));
vi.mock("../../lib/process-errors", async original => ({ ...(await original<object>()), installProcessErrorHandlers: vi.fn() }));
vi.mock("../../lib/ai", async original => ({ ...(await original<object>()), gradeTranslation: state.grade }));
vi.mock("bullmq", async original => ({ ...(await original<object>()), Worker: class {
  constructor(_name: string, processor: typeof state.processor, options: Record<string, unknown>) { state.processor = processor; state.options = options; }
  on(name: string, listener: (...args: unknown[]) => unknown) { state.listeners[name] = listener; return this; }
  close = vi.fn();
} }));

let signalListeners: Map<string, Set<unknown>>;
beforeEach(() => {
  vi.resetModules(); vi.clearAllMocks(); vi.useFakeTimers();
  signalListeners = new Map((["SIGINT", "SIGTERM"] as const).map(s => [s, new Set(process.listeners(s))]));
  state.query.mockResolvedValue([]); state.getJob.mockResolvedValue(undefined); state.rateLimit.mockResolvedValue(undefined);
});
afterEach(() => {
  vi.clearAllTimers(); vi.useRealTimers();
  for (const signal of ["SIGINT", "SIGTERM"] as const) for (const listener of process.listeners(signal)) if (!signalListeners.get(signal)!.has(listener)) process.off(signal, listener);
});

it("429 cools the shared queue and preserves the original error for bounded retries", async () => {
  await import("../../scripts/worker");
  const { ProviderError } = await import("../../lib/ai");
  state.query.mockResolvedValue([{ id: "s1", snapshot: {}, translation: "답" }]);
  const error = new ProviderError("busy", 429, 120000);
  state.grade.mockRejectedValue(error);
  await expect(state.processor({ name: "translation", data: { submissionId: "s1" }, id: "s1" } as Job)).rejects.toBe(error);
  expect(state.rateLimit).toHaveBeenCalledWith(120000);
  expect(state.options).toMatchObject({ concurrency: 1, limiter: { max: 1, duration: 1000 } });
  expect(state.query.mock.calls.some(([sql]) => sql.includes("status='completed'"))).toBe(false);
});

it("an async failed listener SQL failure is contained by the existing structured logger", async () => {
  await import("../../scripts/worker");
  state.query.mockRejectedValue(new Error("database offline"));
  expect(state.listeners.failed({ name: "translation", data: { submissionId: "s1" }, attemptsMade: 3, opts: { attempts: 3 } }, new Error("provider offline"))).toBeUndefined();
  await vi.waitFor(() => expect(state.logError).toHaveBeenCalledWith("grading.failure_status.error", expect.any(Error)));
});

it("startup outage does not crash and recovery can retry on the next tick", async () => {
  state.query.mockRejectedValueOnce(new Error("offline"));
  await import("../../scripts/worker");
  expect(state.logError).toHaveBeenCalledWith("grading.recovery.error", expect.any(Error));
  state.query.mockResolvedValue([]);
  const before = state.query.mock.calls.length;
  await vi.advanceTimersByTimeAsync(30000);
  expect(state.query.mock.calls.length).toBeGreaterThan(before);
});

it("reconciles terminal Redis failures after an SQL outage without re-enqueuing AI", async () => {
  state.query.mockImplementation(async (sql: string) => sql.startsWith("SELECT id FROM submissions") ? [{ id: "s1" }] : []);
  state.getJob.mockResolvedValue({ getState: async () => "failed" });
  await import("../../scripts/worker");
  expect(state.query).toHaveBeenCalledWith(expect.stringContaining("status='failed'"), expect.arrayContaining(["s1"]));
  expect(state.add).not.toHaveBeenCalled();
});
