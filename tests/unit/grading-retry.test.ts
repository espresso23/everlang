import { beforeEach, afterEach, expect, it, vi } from "vitest";
import type { Request } from "express";
import { createOrmMock } from "../helpers/orm-mock";
const state = vi.hoisted(() => ({ query: vi.fn(), add: vi.fn(), session: { user: { id: "qa-owner", name: "QA", email: "qa@example.test", emailVerified: true } } as unknown }));
vi.mock("@everlang/backend/orm", () => ({ ormDataSource: createOrmMock(state.query) }));
vi.mock("@everlang/backend/rate-limit", () => ({ rateLimit: async () => true }));
vi.mock("@everlang/backend/redis", () => ({ rateLimit: async () => true, getGradingQueue: () => ({ add: state.add }) }));
vi.mock("@everlang/backend/content", () => ({ publishedSentence: async () => ({ _id: "lesson", contentVersion: 1, viText: "Câu mẫu", koSampleAnswer: "예문", level: "Trung cấp" }) }));
import { SubmissionsGradeService } from "../../apps/api/src/domains/submissions-grade.service";
const service = new SubmissionsGradeService();
const viewer = { id: "qa-owner", email: "qa@example.test", name: "QA", emailVerified: true, admin: false };
const POST = async (r: Request) => { const result = await service.post(r, viewer); return result instanceof HttpResult ? new Response(JSON.stringify(result.body), { status: result.status }) : new Response(JSON.stringify(result)); };
import { HttpResult } from "@everlang/backend/http";
function request(forceRegrade = false) {
    return { body: { sentenceId: "lesson", userTranslation: "예문", requestId: "5396ee70-3cd2-4b5a-a90a-ad9d3d935520", forceRegrade } } as Request;
}
beforeEach(() => {
    vi.clearAllMocks();
    state.query.mockReset();
    state.session = { user: { id: "qa-owner", name: "QA", email: "qa@example.test", emailVerified: true } };
    vi.spyOn(console, "info").mockImplementation(() => { });
    vi.spyOn(console, "warn").mockImplementation(() => { });
});
afterEach(() => vi.restoreAllMocks());
it("a new normal click bypasses the old failed cache and preserves the failed history", async () => {
    state.query.mockResolvedValueOnce([]).mockResolvedValueOnce([{ id: "old-failed", status: "failed", error: "Old provider error" }]).mockResolvedValueOnce([]).mockResolvedValueOnce([{ id: "retry", status: "queued" }]);
    const response = await POST(request());
    expect(response.status).toBe(202);
    expect(state.add).toHaveBeenCalledWith("translation", { submissionId: "retry" }, expect.objectContaining({ jobId: "retry" }));
    expect(state.query.mock.calls[2][0].parameters.p6).not.toBe(state.query.mock.calls[0][0].parameters.p6);
    expect(state.query.mock.calls.some(([c]) => c.operation === "update")).toBe(false);
});
it("replaying the same request after its retry failed does not create infinite retries", async () => {
    state.query.mockResolvedValueOnce([]).mockResolvedValueOnce([{ id: "old-failed", status: "failed" }]).mockResolvedValueOnce([]).mockResolvedValueOnce([{ id: "same-retry", status: "failed", error: "Current attempt failed" }]);
    const response = await POST(request());
    expect(response.status).toBe(409);
    expect((await response.json()).submissionId).toBe("same-retry");
    expect(state.add).not.toHaveBeenCalled();
    expect(state.query).toHaveBeenCalledTimes(4);
});
it("explicit force retry uses a new dedup key and enqueues a separate attempt", async () => {
    state.query.mockResolvedValueOnce([]).mockResolvedValueOnce([{ id: "old", status: "completed", report: { score: 80 }, snapshot: {} }]);
    await POST(request());
    const oldHash = state.query.mock.calls[0][0].parameters.p6;
    state.query.mockResolvedValueOnce([]).mockResolvedValueOnce([{ id: "retry", status: "queued" }]);
    const response = await POST(request(true));
    expect(response.status).toBe(202);
    expect(state.query.mock.calls[2][0].parameters.p6).not.toBe(oldHash);
    expect(state.add).toHaveBeenCalledWith("translation", { submissionId: "retry" }, expect.objectContaining({ attempts: 3, jobId: "retry" }));
});
it("completed duplicate keeps returning cached report", async () => {
    state.query.mockResolvedValue([{ id: "done", status: "completed", report: { score: 95 }, snapshot: {gradingRequestId:"internal-request-marker"}, translation: "예문" }]);
    const response = await POST(request());
    expect(response.status).toBe(200);
    const result=await response.json();expect(result).toMatchObject({ score: 95, cached: true });expect(result.sentence).not.toHaveProperty("gradingRequestId");
    expect(state.add).not.toHaveBeenCalled();
});

it("replaying the original failed request UUID does not create a second provider attempt",async()=>{
 const body=request().body;state.query.mockResolvedValue([{id:"original-failed",status:"failed",snapshot:{gradingRequestId:body.requestId},error:"Failure"}]);
 const response=await POST(request());expect(response.status).toBe(409);expect(state.query).toHaveBeenCalledTimes(2);expect(state.add).not.toHaveBeenCalled();
});
