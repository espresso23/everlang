import { ormDataSource } from "@everlang/backend/orm";
import { Entities } from "@everlang/backend/entities";
import { type Viewer } from "@everlang/backend/http";
import { connectDb } from "@everlang/backend/db";
import { Sentence } from "@everlang/backend/models/Sentence";
import { ensureContent } from "@everlang/backend/content";
import { LEVELS, TOPICS } from "@everlang/contracts/types";
import { logError } from "@everlang/backend/logger";
async function handleGet(request: Request, viewer: Viewer) {
  try {
    await connectDb();
    await ensureContent();
    const params = queryParams(request);
    const topic = params.get("topic");
    const level = params.get("level");
    const page = Math.max(1, Number(params.get("page")) || 1);
    const limit = Math.min(50, Math.max(1, Number(params.get("limit")) || 20));
    const filter: Record<string, unknown> = { status: "published" };
    const sentenceId = params.get("sentenceId");
    if (sentenceId) {
      if (!/^[a-f\d]{24}$/i.test(sentenceId))
        return HttpResult.json(
          { error: "Mã bài không hợp lệ" },
          { status: 400 },
        );
      filter._id = sentenceId;
    }
    if (params.get("mistakes") === "true") {
      const rows = await ormDataSource
        .createQueryBuilder()
        .select(["sentence_id"])
        .from(Entities.submissions, "row")
        .distinct(true)
        .where(
          "user_id=:p1 AND status='completed' AND jsonb_array_length(report->'grammarErrors')>0",
        )
        .setParameters({ p1: viewer.id })
        .getRawMany();
      filter._id = { $in: rows.map((r) => r.sentence_id) };
    }
    const search = params.get("search")?.trim().slice(0, 100);
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = ["viText", "koSampleAnswer", "keyGrammar", "keyVocab"].map(
        (key) => ({ [key]: { $regex: escaped, $options: "i" } }),
      );
    }
    if (topic && topic !== "ALL") {
      if (!TOPICS.includes(topic as (typeof TOPICS)[number]))
        return HttpResult.json(
          { error: "Chủ đề không hợp lệ." },
          { status: 400 },
        );
      filter.topic = topic;
    }
    if (level && level !== "ALL") {
      if (!LEVELS.includes(level as (typeof LEVELS)[number]))
        return HttpResult.json(
          { error: "Cấp độ không hợp lệ." },
          { status: 400 },
        );
      filter.level = level;
    }
    const [items, total] = await Promise.all([
      Sentence.find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Sentence.countDocuments(filter),
    ]);
    return HttpResult.json({
      items: items.map((item) => ({ ...item, _id: String(item._id) })),
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    logError("sentences.list.failed", error);
    return HttpResult.json(
      {
        error:
          "Không thể tải bài tập. Hãy kiểm tra kết nối MongoDB và cấu hình máy chủ.",
      },
      { status: 503 },
    );
  }
}
import { Injectable } from "@nestjs/common";
import type { Request } from "express";
import { HttpResult, queryParams } from "@everlang/backend/http";
@Injectable()
export class SentencesService {
  async get(r: Request, u: Viewer) {
    return handleGet(r, u);
  }
}
