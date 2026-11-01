import { test, expect } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { verifiedAccount } from "./helpers/account";

test("ORM: Redis outage preserves login, profile, drafts; queue returns 503 and recovers", async ({ playwright, request, baseURL }) => {
  test.skip(process.env.E2E_ORM_REDIS_OUTAGE !== "1", "Only a dedicated disposable Redis may be stopped");
  test.setTimeout(90000);
  expect(baseURL).toBe("http://localhost:3002");
  const container = "langz-orm-qa-redis-1";
  const client = await playwright.request.newContext({ baseURL });
  const email = `orm-${randomUUID()}@example.test`, password = randomUUID() + "Aa1!";
  await verifiedAccount(client, request, baseURL!, email, password);
  const sentence = (await (await client.get("/api/sentences?limit=1")).json()).items[0];
  // Establish the queue connection before injecting failure.
  const payload = { sentenceId: sentence._id, userTranslation: "매일 공부합니다", requestId: randomUUID() };
  expect((await client.post("/api/submissions/grade", { data: payload })).status()).toBe(202);
  try {
    execFileSync("docker", ["stop", "--time", "1", container], { stdio: "pipe" });
    await expect.poll(async () => (await (await client.get("/api/health/ready")).json()).status).toBe("degraded");
    expect((await client.post("/api/auth/sign-in/email", { data: { email, password } })).status()).toBe(200);
    expect((await client.get("/api/profile")).status()).toBe(200);
    const profile = { name: "ORM outage QA", level: "Trung cấp", goal: "travel", minutes: 25, timezone: "Asia/Ho_Chi_Minh" };
    expect((await client.put("/api/profile", { data: profile })).status()).toBe(200);
    expect((await (await client.get("/api/profile")).json()).profile.minutes).toBe(25);
    const draft = await client.put("/api/drafts", { data: { sentenceId: sentence._id, text: "Nháp khi Redis lỗi", version: 0 } });
    expect(draft.status()).toBe(200);
    const version = (await draft.json()).version;
    const writes = await Promise.all(["A", "B"].map(text => client.put("/api/drafts", { data: { sentenceId: sentence._id, text, version } })));
    expect(writes.map(r => r.status()).sort()).toEqual([200, 409]);
    const queued = await client.post("/api/submissions/grade", { data: { ...payload, requestId: randomUUID(), forceRegrade: true } });
    expect(queued.status()).toBe(503);
    expect(await queued.json()).toMatchObject({ code: "QUEUE_UNAVAILABLE", requestId: expect.any(String) });
  } finally { execFileSync("docker", ["start", container], { stdio: "pipe" }); }
  await expect.poll(async () => (await (await client.get("/api/health/ready")).json()).status, { timeout: 30000 }).toBe("ready");
  expect((await client.post("/api/submissions/grade", { data: { ...payload, requestId: randomUUID(), forceRegrade: true } })).status()).toBe(202);
  await client.dispose();
});
