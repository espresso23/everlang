import { z } from "zod";
import { HttpError } from '@everlang/backend/http';
import { catalogStore } from "@everlang/backend/content-store";
import { catalogContentSchema, catalogKey, } from "@everlang/contracts/vocabulary-catalog-contract";
import { transitionCatalog } from "@everlang/backend/vocabulary-catalog";
import { Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { queryParams } from '@everlang/backend/http';
import type { Viewer } from '@everlang/backend/http';
@Injectable()
export class AdminWordSetsService {
    async get(r: Request, _u: Viewer) {
        const key = queryParams(r).get("key");
        if (key) {
            catalogKey.parse(key);
            const revision = z.coerce
                .number()
                .int()
                .positive()
                .parse(queryParams(r).get("revision"));
            const item = await catalogStore.get(key, revision);
            if (!item)
                throw new HttpError(404, "Không tìm thấy phiên bản.");
            const references = item.content.kind === "set"
                ? await catalogStore.references(item.content.senses)
                : [];
            return {
                item,
                references: references.map((ref) => ({
                    key: ref.key,
                    revision: ref.revision,
                    status: ref.status,
                    title: ref.content.kind === "sense" ? ref.content.term : ref.key,
                    meaning: ref.content.kind === "sense"
                        ? ref.content.meaning
                        : "Không phải nghĩa của từ",
                })),
            };
        }
        const offset = z.coerce
            .number()
            .int()
            .min(0)
            .max(20000)
            .parse(queryParams(r).get("offset") || 0);
        const kind = z
            .enum(["set", "sense"])
            .parse(queryParams(r).get("kind") || "sense");
        const result = await catalogStore.list({ kind, offset, limit: 50 });
        return { ...result, limit: 50, offset };
    }
    async post(r: Request, _u: Viewer) {
        const b = z
            .object({ key: catalogKey, content: catalogContentSchema })
            .strict()
            .parse(r.body);
        try {
            return {
                item: (await catalogStore.create({
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
                throw new HttpError(409, "Mã đã tồn tại; chọn bản cũ để tạo revision mới.");
            throw e;
        }
    }
    async patch(r: Request, u: Viewer) {
        const b = z
            .object({
            key: catalogKey,
            revision: z.number().int().positive(),
            editVersion: z.number().int().positive(),
            action: z.enum(["edit", "review", "publish", "fork", "revise"]),
            content: catalogContentSchema.optional(),
            reviewConfirmed: z.boolean().optional(),
        })
            .strict()
            .parse(r.body);
        return { item: await transitionCatalog(b, u.id) };
    }
}
