import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { initializeOrm, closeOrm } from "@everlang/backend/orm";
import { migrateOrm } from "@everlang/backend/orm-migrations";
import { importContentSnapshot, documentHash, type MongoSnapshot } from "@everlang/backend/content-import";
import { contentTables, legacyDocuments } from "@everlang/backend/content-entities";
import { sentences, knowledgeStore, catalogStore, exams } from "@everlang/backend/content-store";
import { listKnowledge, getKnowledge } from "@everlang/backend/knowledge";
import { listCatalog, catalogSetDetail } from "@everlang/backend/vocabulary-catalog";
import { knowledgeSeed } from "../../data/knowledge-seed";
import { installProcessErrorHandlers } from "@everlang/backend/process-errors";
installProcessErrorHandlers("postgresql-content-qa");
assert.match(new URL(process.env.DATABASE_URL!).pathname, /^\/everlang_(?:pgonly_qa|pgonly_fresh)_20261101$/);
const source = await initializeOrm();
const snapshot = JSON.parse(readFileSync(process.argv[2], "utf8").replace(/^\uFEFF/, "")) as MongoSnapshot;
async function businessHashes() {
    const tables = await source.query("SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename");
    const result: Record<string, string> = {};
    for (const { tablename } of tables) {
        if ([...contentTables, "legacy_documents", "orm_migrations"].includes(tablename))
            continue;
        assert.match(tablename, /^[a-z_]+$/);
        result[tablename] = documentHash((await source.createQueryBuilder().select("r.*").from(tablename, "r").getRawMany()).map(documentHash).sort());
    }
    return result;
}
try {
    const before = await businessHashes();
    const applied = await migrateOrm(source);
    assert.equal((await migrateOrm(source)).length, 0);
    const imported = await importContentSnapshot(source, snapshot);
    const second = await importContentSnapshot(source, snapshot);
    assert.ok(Object.values(second).every(c => c.inserted === 0));
    assert.deepEqual(await businessHashes(), before);
    for (const [collection, docs] of Object.entries(snapshot))
        assert.equal(await source.getRepository(legacyDocuments).countBy({ collection }), docs.length);
    assert.equal((await sentences.list({ status: "published", limit: 200 })).total, snapshot.sentences.length);
    const sentence = (await sentences.list({ status: "published", limit: 1 })).items[0];
    assert.equal((await sentences.get(sentence._id))?.viText, sentence.viText);
    assert.equal((await sentences.list({ search: sentence.viText.slice(0, 8) })).items.some(s => s._id === sentence._id), true);
    const draft = await sentences.create({ ...sentence, _id: undefined, sourceId: undefined, status: "draft" });
    const writes = await Promise.allSettled(["A", "B"].map(viText => sentences.change(draft, { viText })));
    assert.equal(writes.filter(r => r.status === "fulfilled").length, 1);
    assert.equal(writes.filter(r => r.status === "rejected").length, 1);
    const doc = { key: "pgonly-knowledge-probe", revision: 1, editVersion: 1, status: "published" as const, content: { ...knowledgeSeed[0].content, title: "Old searchable marker" } };
    await knowledgeStore.create(doc);
    await knowledgeStore.create({ ...doc, revision: 2, content: { ...doc.content, title: "Current revision marker" } });
    assert.equal((await listKnowledge("Old searchable marker", "", "", "")).items.length, 0);
    assert.equal((await getKnowledge(doc.key)).revision, 2);
    assert.equal((await listKnowledge("Current revision marker", "", "", "")).items.length, 1);
    const originalExams=await exams.list();
    const originalMini=originalExams[0];assert.ok(originalMini);
    await Promise.all(Array.from({length:4},()=>exams.create({...originalMini},true)));
    assert.equal((await exams.list()).length,originalExams.length,"Seed must preserve imported exam identity without duplicates");
    const original = (await catalogStore.list({ kind: "sense", limit: 1 })).items[0];
    assert.ok(original);
    assert.equal(original.content.kind, "sense");
    const sense = { ...original, key: "pgonly-sense-probe", revision: 1, editVersion: 1, status: "published" as const, content: original.content };
    await catalogStore.create(sense);
    await catalogStore.create({ ...sense, revision: 2, content: { ...sense.content, term: "New unpinned term" } as typeof sense.content });
    const set = { ...sense, key: "pgonly-set-probe", content: { ...sense.content, kind: "set", title: "PG only set", summary: "Pinned fixture", senses: [{ key: sense.key, revision: 1 }] } };
    await catalogStore.create(set as Parameters<typeof catalogStore.create>[0]);
    const detail = await catalogSetDetail(set.key);
    assert.equal(detail.senses[0].revision, 1);
    if (original.content.kind === "sense")
        assert.equal((await listCatalog("set", original.content.term, "", "", 0)).items.some(i => i.key === set.key), true);
    assert.equal((await listCatalog("set", "New unpinned term", "", "", 0)).items.some(i => i.key === set.key), false);
    const bad = structuredClone(snapshot);
    bad.sentences[0] = { ...bad.sentences[0], viText: "Conflicting replacement" };
    await assert.rejects(importContentSnapshot(source, { aaa_probe: [{ _id: "rollback-probe" }], ...bad }), /Conflicting/);
    assert.equal(await source.getRepository(legacyDocuments).countBy({ collection: "aaa_probe" }), 0);
    assert.deepEqual(await businessHashes(), before);
    console.info(JSON.stringify({ result: "PASS", migrationsApplied: applied.length, historyRerun: 0, preservedBusinessTables: Object.keys(before).length, collections: imported, idempotent: true, atomicConflictRollback: true, sentenceCAS: true, latestBeforeSearch: true, pinnedSetSearch: true, examIdentityPreserved:true, metadata: source.entityMetadatas.length }));
}
finally {
    await closeOrm();
}
