import { catalogStore } from "./content-store";
import { HttpError } from "./http";
import { catalogKey, catalogContentSchema, catalogPublic, type CatalogRecord } from "@everlang/contracts/vocabulary-catalog-contract";
export async function getCatalog(key: string, revision?: number) {
    catalogKey.parse(key);
    const doc = await catalogStore.get(key, revision, true);
    if (!doc)
        throw new HttpError(404, "Không tìm thấy nội dung đã xuất bản.");
    return doc;
}
export async function catalogSetDetail(key: string, revision?: number) {
    const set = await getCatalog(key, revision);
    if (set.content.kind !== "set")
        throw new HttpError(404, "Không tìm thấy bộ từ.");
    const records = (await catalogStore.references(set.content.senses, true)).filter(r => r.content.kind === "sense");
    const byKey = new Map(records.map(r => [r.key, r]));
    if (records.length !== set.content.senses.length)
        throw new HttpError(409, "Một mục trong bộ chưa khả dụng. Hãy thử lại sau.");
    return { set: catalogPublic(set), senses: set.content.senses.map(s => catalogPublic(byKey.get(s.key)!)) };
}
export async function listCatalog(kind: "set" | "sense", search: string, topic: string, level: string, offset: number) {
    const q = catalogStore.latestPublished().where("latest.document->'content'->>'kind'=:kind", { kind });
    if (topic)
        q.andWhere("(latest.document->'content'->'topics') @> :topics::jsonb", { topics: JSON.stringify([topic]) });
    if (level)
        q.andWhere("latest.document->'content'->>'level'=:level", { level });
    if (search)
        q.andWhere(`(strpos(lower(concat_ws(' ',latest.document->'content'->>'title',latest.document->'content'->>'summary',latest.document->'content'->>'term',latest.document->'content'->>'meaning',latest.document->'content'->>'usage')),lower(:search))>0 OR EXISTS (
 SELECT 1 FROM vocabulary_catalog sense WHERE sense.status='published' AND sense.document->'content'->>'kind'='sense'
 AND EXISTS(SELECT 1 FROM jsonb_array_elements(COALESCE(latest.document->'content'->'senses','[]'::jsonb)) ref WHERE ref->>'key'=sense.key AND (ref->>'revision')::integer=sense.revision)
 AND strpos(lower(concat_ws(' ',sense.document->'content'->>'term',sense.document->'content'->>'meaning')),lower(:search))>0))`, { search });
    const total = Number((await q.clone().select("count(*)", "count").getRawOne())?.count || 0);
    const rows = await q.orderBy("latest.key").offset(offset).limit(30).getRawMany<{
        document: CatalogRecord;
    }>();
    return { items: rows.map(({ document: d }) => ({ key: d.key, revision: d.revision, title: d.content.kind === "set" ? d.content.title : d.content.term, meaning: d.content.kind === "sense" ? d.content.meaning : undefined, summary: d.content.kind === "set" ? d.content.summary : undefined, level: d.content.level, topics: d.content.topics, count: d.content.kind === "set" ? d.content.senses.length : 0 })), total, offset, limit: 30 };
}
export async function transitionCatalog(input: {
    key: string;
    revision: number;
    editVersion: number;
    action: "edit" | "review" | "publish" | "fork" | "revise";
    content?: CatalogRecord["content"];
    reviewConfirmed?: boolean;
}, userId: string) {
    if (input.content && input.action !== "edit")
        throw new HttpError(400, "Chỉ gửi nội dung khi sửa bản nháp; duyệt/xuất bản dùng đúng bản đang lưu.");
    const current = await catalogStore.get(input.key, input.revision);
    if (!current || current.editVersion !== input.editVersion)
        throw new HttpError(409, "Nội dung đã đổi. Hãy tải lại.");
    if (input.action === "fork") {
        const latest = await catalogStore.get(input.key);
        if (current.status !== "published" || latest?.revision !== current.revision)
            throw new HttpError(409, "Chỉ tạo revision từ bản published mới nhất khi chưa có nháp mới.");
        try {
            return (await catalogStore.create({
                key: current.key,
                revision: current.revision + 1,
                editVersion: 1,
                status: "draft",
                content: current.content,
            })).item;
        }
        catch (e) {
            if ((e as {
                code?: string;
            }).code === "23505")
                throw new HttpError(409, "Đã có bản nháp mới.");
            throw e;
        }
    }
    if (input.action === "edit" && (current.status !== "draft" || !input.content))
        throw new HttpError(400, "Chỉ sửa bản nháp.");
    if (input.content && input.content.kind !== current.content.kind)
        throw new HttpError(400, "Không đổi loại nội dung của một mã đã tạo.");
    if (input.action === "review" &&
        (current.status !== "draft" || !input.reviewConfirmed))
        throw new HttpError(400, "Cần xác nhận đã kiểm nội dung và quyền sử dụng.");
    if (input.action === "revise" && current.status !== "reviewed")
        throw new HttpError(400, "Chỉ trả bản đã duyệt về nháp.");
    if (input.action === "publish" &&
        (current.status !== "reviewed" || !current.reviewedBy))
        throw new HttpError(400, "Cần người duyệt xác nhận trước khi xuất bản.");
    const content = catalogContentSchema.parse(input.content || current.content);
    if (["review", "publish"].includes(input.action) && content.kind === "set") {
        const records = await catalogStore.references(content.senses, true);
        const count = records.filter(r => r.content.kind === "sense").length;
        if (count !== content.senses.length)
            throw new HttpError(400, "Mọi nghĩa trong bộ phải là revision đã xuất bản.");
    }
    const changes = input.action === "edit"
        ? { content }
        : input.action === "review"
            ? { status: "reviewed", reviewedBy: userId }
            : input.action === "revise"
                ? { status: "draft" }
                : { status: "published" };
    const item = await catalogStore.change(current, changes as Partial<CatalogRecord>, input.action === "revise");
    if (!item)
        throw new HttpError(409, "Có thay đổi đồng thời. Hãy tải lại.");
    return item;
}
