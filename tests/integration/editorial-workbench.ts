import assert from "node:assert/strict";
import { randomUUID, createHash } from "node:crypto";
import { request } from "@playwright/test";
import { initializeOrm, closeOrm } from "@everlang/backend/orm";
import { migrateOrm } from "@everlang/backend/orm-migrations";
import { Entities } from "@everlang/backend/entities";
import { hashPassword } from "@everlang/backend/auth-crypto";
import { knowledgeStore, catalogStore, sentences } from "@everlang/backend/content-store";
import { knowledgeSeed } from "../../data/knowledge-seed";
import { TOPICS, LEVELS } from "@everlang/contracts/types";
import { CATALOG_TAXONOMY_VERSION, catalogContentSchema } from "@everlang/contracts/vocabulary-catalog-contract";
import { installJwtContext } from "../e2e/helpers/jwt-context";

assert.equal(new URL(process.env.DATABASE_URL!).pathname, "/everlang_editorial_qa_20261101");
const db = await initializeOrm();
await migrateOrm(db);
for (const email of ["editorial-admin@example.test", "editorial-learner@example.test"]) await db.getRepository(Entities.users).delete({ email });
const prefix = `qa-${randomUUID().slice(0, 8)}`;
const content = { ...knowledgeSeed[0].content, related: [] };
for (let n = 0; n < 210; n++) await knowledgeStore.create({ key: `${prefix}-${String(n).padStart(3, "0")}`, revision: 1, editVersion: 1, status: n % 2 ? "reviewed" : "draft", content: { ...content, title: `${prefix} ${n}` } });
const sense = catalogContentSchema.parse({ language: "ko", skill: "vocabulary", taxonomyVersion: CATALOG_TAXONOMY_VERSION, level: "Trung cấp", source: "QA", rights: "QA only", kind: "sense", topics: ["food"], term: "학교", meaning: "trường học", pronunciation: "", hanja: "", pos: "Danh từ", register: "Trung tính", usage: "QA fixture", collocations: [], examples: [{ ko: "학교에 가요.", vi: "Tôi đi học." }] });
for (let n = 0; n < 60; n++) await catalogStore.create({ key: `${prefix}-sense-${n}`, revision: 1, editVersion: 1, status: "draft", content: sense });
const sentence = { topic: TOPICS[0], level: LEVELS[0], viText: `${prefix} bài luyện`, koSampleAnswer: "학교에 가요.", keyGrammar: [], keyVocab: [], source: "QA", rights: "QA only" };
for (let n = 0; n < 60; n++) await sentences.create({ ...sentence, viText: `${prefix} ${n}` });
const clients = [];
try {
  for (const [email, admin] of [["editorial-admin@example.test", true], ["editorial-learner@example.test", false]] as const) {
    const id = randomUUID(), password = randomUUID() + "Aa1!";
    await db.getRepository(Entities.users).insert({ id, email, name: "Editorial QA", email_verified: true });
    await db.getRepository(Entities.auth_identities).insert({ id: randomUUID(), account_id: id, user_id: id, provider_id: "credential", password: await hashPassword(password) });
    const client = await request.newContext({ baseURL: "http://localhost:4002", extraHTTPHeaders: { Origin: "http://localhost:3002" } });
    installJwtContext(client, "http://localhost:3002"); clients.push(client);
    const login = await client.post("/api/auth/sign-in/email", { data: { email, password } }); assert.equal(login.status(), 200);
    assert.equal((await login.json()).user.admin, admin);
  }
  const [admin, learner] = clients;
  for (const path of ["knowledge", "content", "word-sets"]) assert.equal((await learner.get(`/api/admin/${path}`)).status(), 403);
  const get = async (path: string) => { const r = await admin.get(path); assert.equal(r.status(), 200, path); return r.json(); };
  const pages = [];
  for (const offset of [0, 100, 200]) { const p = await get(`/api/admin/knowledge?q=${prefix}&limit=100&offset=${offset}&sort=title`); assert.equal(p.total, 210); pages.push(...p.items); }
  assert.equal(pages.length, 210); assert.equal(new Set(pages.map(x => x.key)).size, 210);
  assert.equal((await get(`/api/admin/knowledge?q=${prefix}&status=draft&limit=25`)).total, 105);
  assert.equal((await get(`/api/admin/knowledge?q=.*&limit=25`)).total, 0);
  assert.equal((await admin.get("/api/admin/knowledge?limit=200")).status(), 400);
  for (const [path, suffix] of [["content", ""], ["word-sets", "&kind=sense&topic=food"]]) {
    const first = await get(`/api/admin/${path}?q=${prefix}&limit=25${suffix}`);
    const second = await get(`/api/admin/${path}?q=${prefix}&limit=25&offset=25${suffix}`);
    assert.equal(first.total, 60); assert.equal(first.items.length, 25); assert.equal(second.items.length, 25);
    const ids = [...first.items, ...second.items].map(x => x.key || x._id); assert.equal(new Set(ids).size, 50);
  }
  const key = `${prefix}-000`;
  assert.equal((await learner.get(`/api/knowledge?key=${key}`)).status(), 404);
  assert.equal((await admin.patch("/api/admin/knowledge", { data: { key, revision: 1, editVersion: 1, action: "review" } })).status(), 200);
  assert.equal((await admin.patch("/api/admin/knowledge", { data: { key, revision: 1, editVersion: 1, action: "publish" } })).status(), 409);
  assert.equal((await admin.patch("/api/admin/knowledge", { data: { key, revision: 1, editVersion: 2, action: "publish" } })).status(), 200);
  const student = await (await learner.get(`/api/knowledge?key=${key}`)).json(); assert.ok(!("answers" in student.item.questions[0]));
  const importKey = createHash("sha256").update(JSON.stringify(sentence)).digest("hex");
  const imported = await (await admin.post("/api/admin/content", { data: { ...sentence, importKey } })).json();
  const duplicate = await (await admin.post("/api/admin/content", { data: { ...sentence, importKey } })).json();
  assert.ok(imported.item); assert.equal(duplicate.item._id, imported.item._id); assert.equal(duplicate.duplicate, true);
  assert.equal((await admin.patch("/api/admin/content", { data: { id: imported.item._id, version: 1, action: "review" } })).status(), 200);
  const edited = await admin.patch("/api/admin/content", { data: { id: imported.item._id, version: 2, action: "edit", content: { ...sentence, source: "Updated QA source" } } });
  assert.equal(edited.status(), 200); assert.equal((await edited.json()).item.status, "draft");
  assert.equal((await admin.post("/api/admin/content", { data: { ...sentence, importKey } })).status(), 409);
  assert.equal((await admin.post("/api/admin/knowledge", { data: { key, content } })).status(), 409);
  console.info(JSON.stringify({ result: "PASS", knowledge: 210, catalogue: 60, sentences: 60, pagination: "no duplicates or truncation", filters: "whole dataset", roles: "403", CAS: "409", import: "idempotent/conflict", reviewedEdit: "draft", learnerAnswers: "hidden", providerCalls: 0 }));
} finally { for (const client of clients) await client.dispose(); await closeOrm(); }
