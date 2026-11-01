import { knowledgeStore } from "./content-store";
import { HttpError } from "./http";
import { knowledgeKey, publicEntry, type KnowledgeEntry } from "@everlang/contracts/knowledge-contract";
export async function getKnowledge(key: string, revision?: number) {
    knowledgeKey.parse(key);
    const doc = await knowledgeStore.get(key, revision, true);
    if (!doc)
        throw new HttpError(404, "Không tìm thấy tài liệu đã xuất bản.");
    return { ...doc.content, key: doc.key, revision: doc.revision, editVersion: doc.editVersion, status: doc.status } as KnowledgeEntry;
}
export async function listKnowledge(search: string, kind: string, level: string, topic: string) {
    const q = knowledgeStore.latestPublished();
    for (const [field, value] of Object.entries({ kind, level, topic }))
        if (value)
            q.andWhere(`latest.document->'content'->>'${field}'=:${field}`, { [field]: value });
    if (search) {
        const aliases: Record<string, string> = { idiom: "idiom", "quán dụng ngữ": "idiom", "tục ngữ": "proverb", "ngữ pháp": "grammar" };
        q.andWhere("(strpos(lower(concat_ws(' ',latest.document->'content'->>'title',latest.document->'content'->>'summary',latest.document->'content'->>'topic')),lower(:search))>0 OR latest.document->'content'->>'kind'=:alias)", { search, alias: aliases[search.toLowerCase()] || "" });
    }
    const rows = await q.orderBy("latest.document->'content'->>'title'").addOrderBy("latest.key").limit(100).getRawMany<{
        document: import("./content-store").KnowledgeDocument;
    }>();
    return { items: rows.map(({ document: d }) => ({ key: d.key, revision: d.revision, title: d.content.title, kind: d.content.kind, level: d.content.level, topic: d.content.topic, summary: d.content.summary })), limit: 100 };
}
export async function publicKnowledge(key: string) { const item = publicEntry(await getKnowledge(key)); return { ...item, relatedItems: await knowledgeTitles(item.related) }; }
export async function knowledgeTitles(keys: string[]) {
    if (!keys.length)
        return [];
    const rows = await knowledgeStore.latestPublished().where("latest.key=ANY(:keys::text[])", { keys }).getRawMany<{
        document: import("./content-store").KnowledgeDocument;
    }>();
    return rows.map(({ document: d }) => ({ key: d.key, title: d.content.title }));
}
