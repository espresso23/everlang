import { createHash } from "node:crypto";
import type { DataSource } from "typeorm";
import { contentEntities, legacyDocuments, type ContentTable } from "./content-entities";
import { contentRow } from "./content-store";
import { advisoryTransactionLock, rollback } from "./orm";
export type MongoSnapshot = Record<string, Record<string, unknown>[]>;
export function normalizeBson(value: unknown): unknown {
    if (Array.isArray(value))
        return value.map(normalizeBson);
    if (value && typeof value === "object") {
        const row = value as Record<string, unknown>;
        if (Object.keys(row).length === 1 && typeof row.$oid === "string")
            return row.$oid;
        if (Object.keys(row).length === 1 && row.$date !== undefined) {
            const date = row.$date as string | {
                $numberLong: string;
            };
            return new Date(typeof date === "string" ? date : Number(date.$numberLong)).toISOString();
        }
        return Object.fromEntries(Object.entries(row).map(([key, item]) => [key, normalizeBson(item)]));
    }
    return value;
}
function canonical(value: unknown): unknown {
    if (Array.isArray(value))
        return value.map(canonical);
    if (value && typeof value === "object")
        return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => [k, canonical(v)]));
    return value;
}
export const documentHash = (value: unknown) => createHash("sha256").update(JSON.stringify(canonical(value))).digest("hex");
const destinations: Record<string, ContentTable> = { sentences: "content_sentences", exams: "content_exams", knowledge_entries: "knowledge_entries", vocabulary_catalog: "vocabulary_catalog" };
export function operationalDocument(collection: string, raw: Record<string, unknown>) {
    const document = normalizeBson(raw) as Record<string, unknown>;
    if (collection === "sentences")
        return { language: "ko", skill: "translation", contentVersion: 1, status: "published", source: "Kho bài luyện dịch ban đầu", rights: "Rà soát trước khi phát hành công khai", keyGrammar: [], keyVocab: [], isAiGenerated: false, ...document };
    return document;
}
// One atomic import. Never mutates Mongo or silently overwrites an edited target.
export async function importContentSnapshot(source: DataSource, snapshot: MongoSnapshot) {
    if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot))
        throw new Error("Expected collection snapshot object");
    const runner = source.createQueryRunner();
    await runner.connect();
    const counts: Record<string, {
        source: number;
        inserted: number;
        hash: string;
    }> = {};
    try {
        await runner.startTransaction();
        await advisoryTransactionLock(runner, 814926, "mongo-content-import");
        for (const [collection, documents] of Object.entries(snapshot)) {
            if (!Array.isArray(documents))
                throw new Error("Snapshot collection must be an array");
            let inserted = 0;
            const seen = new Set<string>();
            for (const raw of documents) {
                const normalized = normalizeBson(raw) as Record<string, unknown>;
                const id = String(normalized._id || "");
                if (!id || seen.has(id))
                    throw new Error("Snapshot has missing or duplicate document identity");
                seen.add(id);
                const archive = runner.manager.getRepository(legacyDocuments);
                const existing = await archive.findOneBy({ collection, id });
                if (existing && documentHash(existing.document) !== documentHash(raw))
                    throw new Error(`Conflicting archive in ${collection}`);
                if (!existing) {
                    await archive.createQueryBuilder().insert().values({ collection, id, document: () => ":document" }).setParameter("document", JSON.stringify(raw)).execute();
                    inserted++;
                }
                const table = destinations[collection];
                if (table) {
                    const document = operationalDocument(collection, raw);
                    const row = contentRow(document);
                    const target = runner.manager.getRepository(contentEntities[table]);
                    const prior = await target.findOneBy({ id });
                    if (prior && documentHash(prior.document) !== documentHash(document))
                        throw new Error(`Conflicting content in ${collection}`);
                    if (!prior)
                        await target.createQueryBuilder().insert().values({ ...row, document: () => ":document" }).setParameter("document", JSON.stringify(document)).execute();
                    const saved = await target.findOneByOrFail({ id });
                    if (documentHash(saved.document) !== documentHash(document))
                        throw new Error(`Content verification failed in ${collection}`);
                }
                const saved = await archive.findOneByOrFail({ collection, id });
                if (documentHash(saved.document) !== documentHash(raw))
                    throw new Error(`Archive verification failed in ${collection}`);
            }
            counts[collection] = { source: documents.length, inserted, hash: documentHash(documents.map(documentHash).sort()) };
        }
        await runner.commitTransaction();
        return counts;
    }
    catch (error) {
        await rollback(runner);
        throw error;
    }
    finally {
        await runner.release();
    }
}
