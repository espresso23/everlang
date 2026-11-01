import { z } from "zod";
import { HttpError } from '@everlang/backend/http';
import { ensureContent } from "@everlang/backend/content";
import { Sentence } from "@everlang/backend/models/Sentence";
import { TOPICS, LEVELS } from "@everlang/contracts/types";
import { generateExercises } from "@everlang/backend/ai";
import { rateLimit } from "@everlang/backend/rate-limit";
const body = z.object({
  topic: z.enum(TOPICS),
  level: z.enum(LEVELS),
  viText: z.string().trim().min(1).max(5000),
  koSampleAnswer: z.string().trim().min(1).max(5000),
  keyGrammar: z.array(z.string()).max(20),
  keyVocab: z.array(z.string()).max(30),
  source: z.string().trim().min(1).max(500),
  rights: z.string().trim().min(1).max(1000),
});
import { Injectable } from '@nestjs/common';
import type { Request } from 'express';

import type { Viewer } from '@everlang/backend/http';
@Injectable()
export class AdminContentService {
async get(_r: Request, _u: Viewer) {
    await ensureContent();
    return {
      items: await Sentence.find().sort({ createdAt: -1 }).limit(300).lean(),
    };

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
        items: await Sentence.insertMany(
          result.sentences.map((s) => ({
            ...s,
            status: "draft",
            language: "ko",
            skill: "translation",
            contentVersion: 1,
            isAiGenerated: true,
            source: "AI draft",
            rights: "Cần người duyệt xác nhận",
          })),
        ),
      };
    }
    return {
      item: await Sentence.create({
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
    const item = await Sentence.findById(b.id);
    if (!item) throw new HttpError(404, "Không tìm thấy học liệu.");
    if (item.contentVersion !== b.version)
      throw new HttpError(409, "Học liệu đã thay đổi.");
    if (b.action === "edit") {
      if (!b.content) throw new HttpError(400, "Thiếu nội dung sửa.");
      if (item.status === "published")
        throw new HttpError(
          400,
          "Bài đã xuất bản là bất biến. Tạo bản nháp mới để thay thế.",
        );
    }
    if (b.action === "review" && item.status !== "draft")
      throw new HttpError(400, "Chỉ duyệt từ bản nháp.");
    if (
      b.action === "publish" &&
      (item.status !== "reviewed" || !item.source || !item.rights)
    )
      throw new HttpError(
        400,
        "Cần duyệt và ghi nguồn/quyền sử dụng trước khi xuất bản.",
      );
    const updated = await Sentence.findOneAndUpdate(
      { _id: b.id, contentVersion: b.version },
      {
        $set:
          b.action === "edit"
            ? b.content
            : { status: b.action === "review" ? "reviewed" : "published" },
        $inc: { contentVersion: 1 },
      },
      { new: true },
    );
    if (!updated) throw new HttpError(409, "Học liệu đã thay đổi.");
    return { item: updated };

}
}
