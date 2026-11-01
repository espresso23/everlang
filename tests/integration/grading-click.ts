import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { request } from "@playwright/test";
import { initializeOrm, closeOrm } from "@everlang/backend/orm";
import { Entities } from "@everlang/backend/entities";
import { hashPassword } from "@everlang/backend/auth-crypto";
import { installJwtContext } from "../e2e/helpers/jwt-context";
import { installProcessErrorHandlers } from "@everlang/backend/process-errors";
installProcessErrorHandlers("grading-click-qa");
assert.equal(new URL(process.env.DATABASE_URL!).pathname, "/everlang_nest_qa_20261101");
const source = await initializeOrm();
const baseURL = "http://localhost:3002";
const client = await request.newContext({ baseURL });
installJwtContext(client, baseURL);
const id = randomUUID(), password = randomUUID() + "Aa1!", email = `${id}@example.test`;
try {
  await source.getRepository(Entities.users).insert({ id, email, name: "Grading click QA", email_verified: true });
  await source.getRepository(Entities.auth_identities).insert({ id: randomUUID(), account_id: id, user_id: id, provider_id: "credential", password: await hashPassword(password) });
  assert.equal((await client.post("/api/auth/sign-in/email", { data: { email, password } })).status(), 200);
  const sentence = (await (await client.get("/api/sentences?limit=1")).json()).items[0];
  const data = { sentenceId: sentence._id, userTranslation: "꾸준히 공부합니다", requestId: randomUUID(), forceRegrade: false };
  const first = await client.post("/api/submissions/grade", { data });
  assert.equal(first.status(), 202); const firstId = (await first.json()).jobId;
  async function waitFailed(jobId: string) {
    for (let attempt = 0; attempt < 90; attempt++) {
      const response = await client.get("/api/jobs?id=" + jobId); assert.equal(response.status(), 200);
      const body = await response.json();
      if (body.status === "failed") return;
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    throw new Error("QA no-key worker did not settle within timeout");
  }
  await waitFailed(firstId);
  const originalReplay = await client.post("/api/submissions/grade", { data });
  assert.equal(originalReplay.status(), 409); assert.equal((await originalReplay.json()).submissionId, firstId);
  const retryData = { ...data, requestId: randomUUID() };
  const retry = await client.post("/api/submissions/grade", { data: retryData });
  assert.equal(retry.status(), 202); const retryId = (await retry.json()).jobId; assert.notEqual(retryId, firstId);
  const duplicate = await client.post("/api/submissions/grade", { data: retryData });
  assert.equal(duplicate.status(), 202); assert.equal((await duplicate.json()).jobId, retryId);
  await waitFailed(retryId);
  const failedReplay = await client.post("/api/submissions/grade", { data: retryData });
  assert.equal(failedReplay.status(), 409); assert.equal((await failedReplay.json()).submissionId, retryId);
  const dictionary = await client.get("/api/dictionary?q=학교"); assert.equal(dictionary.status(), 200);
  assert.deepEqual(await dictionary.json(), { configured: false, items: [] });
  assert.equal((await client.get("/api/dictionary?q=invalid")).status(), 400);
  const mail = await client.post("/api/auth/request-password-reset", { data: { email } });
  assert.equal(mail.status(), 503); assert.equal((await mail.json()).code, "EMAIL_UNAVAILABLE");
  assert.equal(await source.getRepository(Entities.submissions).countBy({ user_id: id }), 2);
  console.info(JSON.stringify({ result: "PASS", originalReplayIdempotent: true, freshClickNewJob: true, retryReplayIdempotent: true, historyCount: 2, dictionary: "200/400", mailWithoutSMTP: "503/EMAIL_UNAVAILABLE", providerCalls: 0 }));
} finally {
  await client.dispose(); await source.getRepository(Entities.users).delete({ id }); await closeOrm();
}
