import { randomBytes } from "node:crypto";
import { ormDataSource } from "./orm";
import { contentEntities, type ContentRow, type ContentTable } from "./content-entities";
import { HttpError } from "./http";
import type { Level, Topic } from "@everlang/contracts/types";
import type { KnowledgeContent } from "@everlang/contracts/knowledge-contract";
import type { CatalogRecord } from "@everlang/contracts/vocabulary-catalog-contract";
import type { z } from "zod";
import type { examSchema } from "@everlang/contracts/exams";
export interface SentenceDocument extends Record<string, unknown> {
    _id: string;
    sourceId?: string | number;
    language: string;
    skill: string;
    contentVersion: number;
    status: "draft" | "reviewed" | "published";
    source: string;
    rights: string;
    topic: Topic;
    level: Level;
    viText: string;
    koSampleAnswer: string;
    keyGrammar: string[];
    keyVocab: string[];
    isAiGenerated: boolean;
    createdAt: string;
}
export interface KnowledgeDocument {
    _id?: string;
    key: string;
    revision: number;
    editVersion: number;
    status: "draft" | "reviewed" | "published";
    content: KnowledgeContent;
    reviewedBy?: string;
    createdAt?: string;
    updatedAt?: string;
}
export interface ExamDocument {
    _id: string;
    title: string;
    document: z.infer<typeof examSchema>;
    published: boolean;
    version: number;
    createdAt?: string;
    updatedAt?: string;
}
export const contentId = () => randomBytes(12).toString("hex");
export function contentRow(document: Record<string, unknown>): ContentRow {
    const id = String(document._id || contentId());
    const date = new Date().toISOString();
    return { id, key: document.key == null ? null : String(document.key), revision: document.revision == null ? null : Number(document.revision),
        source_id: document.sourceId == null ? null : String(document.sourceId),
        status: String(document.status || (document.published === true ? "published" : "draft")),
        version: Number(document.editVersion || document.contentVersion || document.version || 1),
        document: { ...document, _id: id }, created_at: new Date(String(document.createdAt || date)), updated_at: new Date(String(document.updatedAt || document.createdAt || date)) };
}
const repository = (table: ContentTable) => ormDataSource.getRepository(contentEntities[table]);
export const sentences = {
    async list(input: {
        ids?: string[];
        excludeIds?: string[];
        status?: string;
        topic?: string;
        level?: string;
        search?: string;
        limit?: number;
        offset?: number;
    } = {}) {
        const q = repository("content_sentences").createQueryBuilder("c");
        if (input.status)
            q.andWhere("c.status=:status", { status: input.status });
        if (input.ids)
            q.andWhere("c.id=ANY(:ids::text[])", { ids: input.ids });
        if (input.excludeIds)
            q.andWhere("NOT(c.id=ANY(:exclude::text[]))", { exclude: input.excludeIds });
        for (const field of ["topic", "level"] as const)
            if (input[field])
                q.andWhere(`c.document->>'${field}'=:${field}`, { [field]: input[field] });
        if (input.search)
            q.andWhere("strpos(lower(concat_ws(' ',c.document->>'viText',c.document->>'koSampleAnswer',c.document->>'keyGrammar',c.document->>'keyVocab')),lower(:search))>0", { search: input.search });
        const total = await q.getCount();
        const rows = await q.orderBy("c.created_at", "DESC").addOrderBy("c.id", "DESC").take(input.limit ?? 300).skip(input.offset ?? 0).getMany();
        return { items: rows.map(r => r.document as SentenceDocument), total };
    },
    async get(id: string) { return (await repository("content_sentences").findOneBy({ id }))?.document as SentenceDocument | undefined; },
    async create(input: Partial<SentenceDocument>) {
        const document = { language: "ko", skill: "translation", contentVersion: 1, status: "draft", keyGrammar: [], keyVocab: [], isAiGenerated: false, createdAt: new Date().toISOString(), ...input, _id: input._id || contentId() } as SentenceDocument;
        const row = contentRow(document);
        await repository("content_sentences").createQueryBuilder().insert().values({ ...row, document: () => ":document" }).setParameter("document", JSON.stringify(document)).execute();
        return document;
    },
    async change(current: SentenceDocument, changes: Partial<SentenceDocument>) {
        const document = { ...current, ...changes, contentVersion: current.contentVersion + 1 };
        const result = await repository("content_sentences").createQueryBuilder().update().set({ document: () => ":document", status: document.status, version: document.contentVersion, updated_at: new Date() }).setParameter("document", JSON.stringify(document)).where("id=:id AND version=:version AND status=:status", { id: current._id, version: current.contentVersion, status: current.status }).execute();
        if (!result.affected)
            throw new HttpError(409, "Học liệu đã thay đổi.");
        return document;
    },
    async seed(entries: Partial<SentenceDocument>[]) {
        if (!entries.length)
            return;
        const rows = entries.map(input => contentRow({ createdAt: new Date().toISOString(), ...input }));
        await repository("content_sentences").createQueryBuilder().insert().values(rows.map((r, i) => ({ ...r, document: () => `:doc${i}` }))).setParameters(Object.fromEntries(rows.map((r, i) => [`doc${i}`, JSON.stringify(r.document)]))).orIgnore().execute();
    },
};
export class RevisionStore<T extends KnowledgeDocument | CatalogRecord> {
    constructor(readonly table: "knowledge_entries" | "vocabulary_catalog") { }
    builder() { return repository(this.table).createQueryBuilder("c"); }
    async get(key: string, revision?: number, published = false) {
        const q = this.builder().where("c.key=:key", { key });
        if (revision)
            q.andWhere("c.revision=:revision", { revision });
        if (published)
            q.andWhere("c.status='published'");
        return (await q.orderBy("c.revision", "DESC").getOne())?.document as T | undefined;
    }
    latestPublished() {
        const latest = this.builder().select(["c.key AS key", "c.revision AS revision", "c.document AS document"]).distinctOn(["c.key"]).where("c.status='published'").orderBy("c.key").addOrderBy("c.revision", "DESC");
        return ormDataSource.createQueryBuilder().select("latest.document", "document").from(`(${latest.getQuery()})`, "latest");
    }
    async list(input: {
        kind?: string;
        limit: number;
        offset?: number;
    }) {
        const q = this.builder();
        if (input.kind)
            q.andWhere("c.document->'content'->>'kind'=:kind", { kind: input.kind });
        const total = await q.getCount();
        const rows = await q.orderBy("c.updated_at", "DESC").addOrderBy("c.key").skip(input.offset || 0).take(input.limit).getMany();
        return { items: rows.map(r => r.document as T), total };
    }
    async references(refs: {
        key: string;
        revision: number;
    }[], published = false) {
        if (!refs.length)
            return [];
        const q = this.builder().where("(c.key || ':' || c.revision::text)=ANY(:refs::text[])", { refs: refs.map(r => `${r.key}:${r.revision}`) });
        if (published)
            q.andWhere("c.status='published'");
        return (await q.getMany()).map(r => r.document as T);
    }
    async create(input: T, ignore = false) {
        const date = new Date().toISOString();
        const row = contentRow({ createdAt: date, updatedAt: date, ...input, _id: contentId() });
        const q = repository(this.table).createQueryBuilder().insert().values({ ...row, document: () => ":document" }).setParameter("document", JSON.stringify(row.document)).returning("id");
        if (ignore)
            q.orIgnore();
        const result = await q.execute();
        return { item: row.document as T, inserted: result.raw.length > 0 };
    }
    async change(current: T, changes: Partial<T>, clearReviewer = false) {
        const document = { ...current, ...changes, editVersion: current.editVersion + 1, updatedAt: new Date().toISOString() };
        if (clearReviewer)
            delete document.reviewedBy;
        const result = await repository(this.table).createQueryBuilder().update().set({ document: () => ":document", status: document.status, version: document.editVersion, updated_at: new Date() }).setParameter("document", JSON.stringify(document)).where("key=:key AND revision=:revision AND version=:version AND status=:status", { key: current.key, revision: current.revision, version: current.editVersion, status: current.status }).execute();
        if (!result.affected)
            throw new HttpError(409, "Có thay đổi đồng thời. Hãy tải lại.");
        return document;
    }
}
export const knowledgeStore = new RevisionStore<KnowledgeDocument>("knowledge_entries");
export const catalogStore = new RevisionStore<CatalogRecord>("vocabulary_catalog");
export const exams = {
    async list() { return (await repository("content_exams").findBy({ status: "published" })).map(r => r.document as unknown as ExamDocument); },
    async get(id: string) { return (await repository("content_exams").findOneBy({ id, status: "published" }))?.document as unknown as ExamDocument | undefined; },
    async create(input: Omit<ExamDocument, "_id">, seed = false) {
        if (seed) {
            const existing = await repository("content_exams").createQueryBuilder("c").where("c.document->>'title'=:title", { title: input.title }).getOne();
            if (existing)
                return existing.document as unknown as ExamDocument;
        }
        const row = contentRow({ ...input, _id: contentId(), createdAt: new Date().toISOString(), ...(seed ? { sourceId: "everlang-mini-exam" } : {}) });
        const q = repository("content_exams").createQueryBuilder().insert().values({ ...row, document: () => ":document" }).setParameter("document", JSON.stringify(row.document));
        if (seed)
            q.orIgnore();
        await q.execute();
        return row.document as unknown as ExamDocument;
    },
};
