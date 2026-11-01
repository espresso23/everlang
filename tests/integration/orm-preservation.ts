// Run only against an explicitly disposable QA database. Never prints learner rows or secrets.
import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import { initializeOrm, closeOrm } from "@everlang/backend/orm";
import { migrateOrm } from "@everlang/backend/orm-migrations";
import { Entities } from "@everlang/backend/entities";
import { rateLimit } from "@everlang/backend/rate-limit";
const database = new URL(process.env.DATABASE_URL!).pathname.slice(1);
assert.match(database, /^everlang_orm_(adoption|fresh)_20261101$/);
const source = await initializeOrm();
const hash = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
async function snapshot() {
    const tables = await source.query("SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename NOT IN ('orm_migrations','rate_limit_buckets','content_sentences','content_exams','knowledge_entries','vocabulary_catalog','legacy_documents') ORDER BY tablename");
    const rows: Record<string, string> = {};
    for (const { tablename } of tables) {
        assert.match(tablename, /^[a-z_]+$/);
        const values = await source.createQueryBuilder().select("row.*").from(tablename, "row").getRawMany();
        rows[tablename] = hash(values.map(value => JSON.stringify(value)).sort());
    }
    const schema = await source.query("SELECT table_name,column_name,data_type,udt_name,is_nullable,column_default FROM information_schema.columns WHERE table_schema='public' AND table_name NOT IN ('orm_migrations','rate_limit_buckets','content_sentences','content_exams','knowledge_entries','vocabulary_catalog','legacy_documents') ORDER BY table_name,ordinal_position");
    const indexes = await source.query("SELECT tablename,indexname,indexdef FROM pg_indexes WHERE schemaname='public' AND tablename NOT IN ('orm_migrations','rate_limit_buckets','content_sentences','content_exams','knowledge_entries','vocabulary_catalog','legacy_documents') ORDER BY tablename,indexname");
    const constraints = await source.query("SELECT c.relname,k.conname,pg_get_constraintdef(k.oid) AS definition FROM pg_constraint k JOIN pg_class c ON c.oid=k.conrelid JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relname NOT IN ('orm_migrations','rate_limit_buckets','content_sentences','content_exams','knowledge_entries','vocabulary_catalog','legacy_documents') ORDER BY c.relname,k.conname");
    return { rows, schema: hash(schema), indexes: hash(indexes), constraints: hash(constraints) };
}
try {
    const fresh = database.includes("_fresh_");
    const before = await snapshot();
    const migrations = await migrateOrm(source);
    assert.equal(migrations.length, fresh ? 10 : 2);
    if (!fresh)
        assert.deepEqual(await snapshot(), before, "Every existing row, column, index and constraint must survive adoption unchanged");
    assert.equal((await migrateOrm(source)).length, 0);
    const key = randomUUID();
    const outcomes = await Promise.all(Array.from({ length: 24 }, () => rateLimit(key, "concurrency", 7)));
    assert.equal(outcomes.filter(Boolean).length, 7);
    // Real JSONB + targeted conflict + update + optimistic version + transaction rollback.
    const id = randomUUID();
    const runner = source.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();
    try {
        await runner.manager.getRepository(Entities.users).insert({ id, name: "ORM QA", email: `${id}@example.test`, email_verified: true });
        const profiles = runner.manager.getRepository(Entities.profiles);
        await profiles.insert({ user_id: id });
        await runner.manager.createQueryBuilder().insert().into(Entities.profiles).values({ user_id: id, level: "Trung cấp", goal: "travel", minutes: 25, timezone: "Asia/Ho_Chi_Minh" }).orUpdate(["minutes"], ["user_id"]).execute();
        assert.equal((await profiles.findOneByOrFail({ user_id: id })).minutes, 25);
        await runner.manager.createQueryBuilder().insert().into(Entities.drafts).values({ user_id: id, sentence_id: "qa", text: "one" }).orUpdate([], ["user_id", "sentence_id"]).execute();
        await runner.manager.createQueryBuilder().insert().into(Entities.drafts).values({ user_id: id, sentence_id: "qa", text: "two" }).orUpdate([], ["user_id", "sentence_id"]).execute();
        assert.equal((await runner.manager.getRepository(Entities.drafts).findOneByOrFail({ user_id: id, sentence_id: "qa" })).text, "one");
        const snapshot = { text: "한국어", choices: [1, 2], nested: { ok: true } };
        await runner.manager.createQueryBuilder().insert().into(Entities.submissions).values({ id: randomUUID(), user_id: id, sentence_id: "qa", translation: "qa", snapshot: () => ":snapshot", dedup_key: randomUUID(), model: "qa", prompt_version: "qa", rubric_version: "qa" }).setParameter("snapshot", JSON.stringify(snapshot)).execute();
        const saved = await runner.manager.getRepository(Entities.submissions).findOneByOrFail({ user_id: id });
        assert.deepEqual(saved.snapshot, snapshot);
        const vector = JSON.stringify([1, ...Array(1535).fill(0)]);
        await runner.manager.createQueryBuilder().insert().into(Entities.tutor_chunks).values({ id, content_id: "qa", content_version: 1, text: "qa", embedding: () => ":embeddingValue::vector" }).setParameter("embeddingValue", vector).execute();
        const nearest = await runner.manager.createQueryBuilder().select("id").from(Entities.tutor_chunks, "chunk").orderBy("embedding <=> :embeddingValue::vector", "ASC").setParameter("embeddingValue", vector).limit(1).getRawOne();
        assert.equal(nearest.id, id);
    }
    finally {
        await runner.rollbackTransaction();
        await runner.release();
    }
    assert.equal(await source.getRepository(Entities.users).countBy({ id }), 0);
    // A non-prefix history must stop before any DDL/business writes.
    const history = () => source.createQueryBuilder();
    const record = await history().select("*").from("orm_migrations", "row").where("name=:name", { name: "Historical11730000000000" }).getRawOne();
    await history().delete().from("orm_migrations").where("id=:id", { id: record.id }).execute();
    try {
        await assert.rejects(migrateOrm(source), /non-prefix/);
    }
    finally {
        await history().insert().into("orm_migrations").values(record).execute();
    }
    console.info(JSON.stringify({ result: "PASS", mode: fresh ? "fresh" : "adoption", preservedTables: Object.keys(before.rows).length, entityMappings: source.entityMetadatas.length, migrations: 10, quotaAllowed: 7, quotaAttempts: 24, jsonb: true, targetedConflict: true, rollback: true, corruptHistoryRejected: true }));
}
finally {
    await closeOrm();
}
