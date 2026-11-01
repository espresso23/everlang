import { createHash } from "node:crypto";
import { sentenceEditorialSchema } from "@everlang/contracts/editorial";
import { editorialQuerySchema } from "@everlang/contracts/editorial";
import { queryParams } from "@everlang/backend/http";
import { z } from "zod";
import { HttpError } from '@everlang/backend/http';
import { ensureContent } from "@everlang/backend/content";
import { sentences } from "@everlang/backend/content-store";
import { TOPICS, LEVELS } from "@everlang/contracts/types";
import { generateExercises } from "@everlang/backend/ai";
import { rateLimit } from "@everlang/backend/rate-limit";
const body = sentenceEditorialSchema;
import { Injectable } from '@nestjs/common';
import type { Request } from 'express';
import type { Viewer } from '@everlang/backend/http';
@Injectable()
export class AdminContentService {
    async get(r: Request, _u: Viewer) {
        await ensureContent();
        const query = editorialQuerySchema.parse(Object.fromEntries(queryParams(r)));
        const result = await sentences.list({ ...query, search: query.q });
        return { ...result, limit: query.limit, offset: query.offset };
    }
    async post(r: Request, u: Viewer) {
        const raw = r.body;
        await ensureContent();
        if (raw.generate) {
            if (!(await rateLimit(u.id, "generate", 3)))
                throw new HttpError(429, "Vui lòng chờ trước khi tạo thêm.");
            const b = z
                .object({ topic: z.enum(TOPICS), level: z.enum(LEVELS) })
                .parse(raw);
            const result = await generateExercises(b.topic, b.level, 5);
            if (result.sentences.length !== 5)
                throw new HttpError(502, "AI trả sai số lượng bài.");
            return {
                items: await Promise.all(result.sentences.map((s) => sentences.create({
                    ...s,
                    status: "draft",
                    language: "ko",
                    skill: "translation",
                    contentVersion: 1,
                    isAiGenerated: true,
                    source: "AI draft",
                    rights: "Cần người duyệt xác nhận",
                }))),
            };
        }
        if (raw.importKey !== undefined) {
            const importKey = z.string().regex(/^[a-f0-9]{64}$/).parse(raw.importKey);
            const { importKey: _key, ...payload } = raw;
            void _key;
            const parsed = body.parse(payload);
            const id = createHash("sha256").update(`${u.id}:${importKey}`).digest("hex").slice(0, 24);
            const existing = await sentences.get(id);
            const verify = (item: NonNullable<typeof existing>) => {
                const fields = Object.fromEntries(Object.keys(body.shape).map(key => [key, item[key]]));
                if (JSON.stringify(body.parse(fields)) !== JSON.stringify(parsed)) throw new HttpError(409, "Nháp nhập trước đã thay đổi; không ghi đè.");
                return { item, duplicate: true };
            };
            if (existing) return verify(existing);
            try { return { item: await sentences.create({ ...parsed, _id: id, status: "draft" }) }; }
            catch (e) { if ((e as {code?:string}).code === "23505") { const winner = await sentences.get(id); if (winner) return verify(winner); } throw e; }
        }
        return {
            item: await sentences.create({
                ...body.parse(raw),
                status: "draft",
                contentVersion: 1,
                language: "ko",
                skill: "translation",
            }),
        };
    }
    async patch(r: Request, _u: Viewer) {
        const b = z
            .object({
            id: z.string().regex(/^[a-f\d]{24}$/i),
            version: z.number().int().positive(),
            action: z.enum(["review", "publish", "edit"]),
            content: body.optional(),
        })
            .parse(r.body);
        await ensureContent();
        const item = await sentences.get(b.id);
        if (!item)
            throw new HttpError(404, "Không tìm thấy học liệu.");
        if (item.contentVersion !== b.version)
            throw new HttpError(409, "Học liệu đã thay đổi.");
        if (b.action === "edit") {
            if (!b.content)
                throw new HttpError(400, "Thiếu nội dung sửa.");
            if (item.status === "published")
                throw new HttpError(400, "Bài đã xuất bản là bất biến. Tạo bản nháp mới để thay thế.");
        }
        if (b.action === "review" && item.status !== "draft")
            throw new HttpError(400, "Chỉ duyệt từ bản nháp.");
        if (b.action === "publish" &&
            (item.status !== "reviewed" || !item.source || !item.rights))
            throw new HttpError(400, "Cần duyệt và ghi nguồn/quyền sử dụng trước khi xuất bản.");
        const updated = await sentences.change(item, b.action === "edit" ? { ...b.content!, status: "draft" } : { status: b.action === "review" ? "reviewed" : "published" });
        if (!updated)
            throw new HttpError(409, "Học liệu đã thay đổi.");
        return { item: updated };
    }
}
