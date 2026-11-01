import { z } from "zod";
import { HttpError } from '@everlang/backend/http';
import { knowledgeStore } from "@everlang/backend/content-store";
import { knowledgeKey, knowledgeSchema } from "@everlang/contracts/knowledge-contract";
import { Injectable } from '@nestjs/common';
import type { Request } from 'express';
import type { Viewer } from '@everlang/backend/http';
@Injectable()
export class AdminKnowledgeService {
    async get(_r: Request, _u: Viewer) {
        return {
            items: (await knowledgeStore.list({ limit: 200 })).items,
        };
    }
    async post(r: Request, _u: Viewer) {
        const b = z
            .object({ key: knowledgeKey, content: knowledgeSchema })
            .strict()
            .parse(r.body);
        try {
            return {
                item: (await knowledgeStore.create({
                    ...b,
                    revision: 1,
                    editVersion: 1,
                    status: "draft",
                })).item,
            };
        }
        catch (e) {
            if ((e as {
                code?: string;
            }).code === "23505")
                throw new HttpError(409, "Mã tài liệu đã tồn tại. Hãy tạo phiên bản mới.");
            throw e;
        }
    }
    async patch(r: Request, u: Viewer) {
        const b = z
            .object({
            key: knowledgeKey,
            revision: z.number().int().positive(),
            editVersion: z.number().int().positive(),
            action: z.enum(["edit", "review", "publish", "fork", "revise"]),
            content: knowledgeSchema.optional(),
        })
            .strict()
            .parse(r.body);
        const current = await knowledgeStore.get(b.key, b.revision);
        if (!current || current.editVersion !== b.editVersion)
            throw new HttpError(409, "Tài liệu đã đổi. Hãy tải lại.");
        if (b.action === "fork") {
            if (current.status !== "published")
                throw new HttpError(400, "Chỉ tạo revision mới từ bản đã xuất bản.");
            const latest = await knowledgeStore.get(b.key);
            if (latest?.revision !== b.revision)
                throw new HttpError(409, "Đã có phiên bản mới hơn.");
            try {
                return {
                    item: (await knowledgeStore.create({
                        key: b.key,
                        revision: b.revision + 1,
                        editVersion: 1,
                        status: "draft",
                        content: current.content,
                    })).item,
                };
            }
            catch (e) {
                if ((e as {
                    code?: string;
                }).code === "23505")
                    throw new HttpError(409, "Đã có bản nháp mới.");
                throw e;
            }
        }
        if (b.action === "edit" && (current.status !== "draft" || !b.content))
            throw new HttpError(400, "Chỉ sửa nội dung bản nháp.");
        if (b.action === "review" && current.status !== "draft")
            throw new HttpError(400, "Chỉ duyệt từ bản nháp.");
        if (b.action === "revise" && current.status !== "reviewed")
            throw new HttpError(400, "Chỉ trả bản đã duyệt chưa xuất bản về nháp.");
        if (b.action === "publish" &&
            (current.status !== "reviewed" || !current.reviewedBy))
            throw new HttpError(400, "Cần người duyệt xác nhận trước khi xuất bản.");
        if (b.action === "publish") {
            const refs = [...new Set(current.content.related)];
            const published = await knowledgeStore.builder().select("c.key").distinct(true).where("c.key=ANY(:refs::text[]) AND c.status='published'", { refs }).getRawMany();
            if (refs.includes(b.key) || published.length !== refs.length)
                throw new HttpError(400, "Tài liệu liên quan phải đã xuất bản và không trỏ về chính bài này. Trả về nháp để sửa liên kết.");
        }
        knowledgeSchema.parse(b.content || current.content);
        const changes = b.action === "edit"
            ? { content: b.content }
            : b.action === "review"
                ? { status: "reviewed", reviewedBy: u.id }
                : b.action === "revise"
                    ? { status: "draft" }
                    : { status: "published" };
        const item = await knowledgeStore.change(current, changes as Partial<typeof current>, b.action === "revise");
        if (!item)
            throw new HttpError(409, "Có thay đổi đồng thời. Hãy tải lại.");
        return { item };
    }
}
