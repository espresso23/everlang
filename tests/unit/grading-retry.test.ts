import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const state = vi.hoisted(() => ({ query: vi.fn(), add: vi.fn(), session: { user: { id: "qa-owner", name: "QA", email: "qa@example.test", emailVerified: true } } as unknown }));
vi.mock("../../lib/sql", () => ({ query: state.query }));
vi.mock("../../lib/redis", () => ({ rateLimit: async () => true, getGradingQueue: () => ({ add: state.add }) }));
vi.mock("../../lib/auth", () => ({ getAuth: () => ({ api: { getSession: async () => state.session } }), isAdmin: () => false }));
vi.mock("../../lib/content", () => ({ publishedSentence: async () => ({ _id: "lesson", contentVersion: 1, viText: "Câu mẫu", koSampleAnswer: "예문", level: "Trung cấp" }) }));
import { POST } from "../../app/api/submissions/grade/route";

function request(forceRegrade = false) {
  return new NextRequest("http://localhost/api/submissions/grade", { method: "POST", headers: { "content-type": "application/json", "x-request-id": "grading-retry-qa" }, body: JSON.stringify({ sentenceId: "lesson", userTranslation: "예문", requestId: "5396ee70-3cd2-4b5a-a90a-ad9d3d935520", forceRegrade }) });
}
beforeEach(() => {
  vi.clearAllMocks();
  state.session = { user: { id: "qa-owner", name: "QA", email: "qa@example.test", emailVerified: true } };
  vi.spyOn(console, "info").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => vi.restoreAllMocks());

it("cached failure returns actionable409 without enqueueing or overwriting the failed attempt", async () => {
  state.query.mockResolvedValue([{ id: "old-failed", status: "failed", error: "Dịch vụ AI đang giới hạn lượt gọi." }]);
  const response = await POST(request());
  expect(response.status).toBe(409);
  expect(response.headers.get("x-request-id")).toBe("grading-retry-qa");
  expect(await response.json()).toMatchObject({ code: "GRADING_PREVIOUS_FAILED", submissionId: "old-failed", retryable: true });
  expect(state.add).not.toHaveBeenCalled();
  expect(state.query.mock.calls.some(([sql]) => sql.startsWith("UPDATE"))).toBe(false);
  expect(state.query.mock.calls[1][1]).toEqual([expect.any(String), "qa-owner"]);
});

it("explicit force retry uses a new dedup key and enqueues a separate attempt", async () => {
  state.query.mockResolvedValueOnce([]).mockResolvedValueOnce([{ id: "old", status: "failed" }]);
  await POST(request());
  const oldHash = state.query.mock.calls[0][1][5];
  state.query.mockResolvedValueOnce([]).mockResolvedValueOnce([{ id: "retry", status: "queued" }]);
  const response = await POST(request(true));
  expect(response.status).toBe(202);
  expect(state.query.mock.calls[2][1][5]).not.toBe(oldHash);
  expect(state.add).toHaveBeenCalledWith("translation", { submissionId: "retry" }, expect.objectContaining({ attempts: 3, jobId: "retry" }));
});

it("completed duplicate keeps returning cached report", async () => {
  state.query.mockResolvedValue([{ id: "done", status: "completed", report: { score: 95 }, snapshot: {}, translation: "예문" }]);
  const response = await POST(request());
  expect(response.status).toBe(200);
  expect(await response.json()).toMatchObject({ score: 95, cached: true });
  expect(state.add).not.toHaveBeenCalled();
});

it("anonymous request is rejected before access to submission state", async () => {
  state.session = null;
  expect((await POST(request())).status).toBe(401);
  expect(state.query).not.toHaveBeenCalled();
});
