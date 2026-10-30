import { api, type Viewer } from "@/lib/api";
import { query } from "@/lib/sql";
import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { Sentence } from "@/lib/models/Sentence";
import { ensureContent } from "@/lib/content";
import { LEVELS, TOPICS } from "@/lib/types";
import { logError } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handleGet(request: NextRequest, viewer: Viewer) {
  try {
    await connectDb();
    await ensureContent();
    const params = request.nextUrl.searchParams;
    const topic = params.get("topic");
    const level = params.get("level");
    const page = Math.max(1, Number(params.get("page")) || 1);
    const limit = Math.min(50, Math.max(1, Number(params.get("limit")) || 20));
    const filter: Record<string, unknown> = { status: "published" };
    const sentenceId = params.get("sentenceId");
    if (sentenceId) {
      if (!/^[a-f\d]{24}$/i.test(sentenceId))
        return NextResponse.json(
          { error: "Mã bài không hợp lệ" },
          { status: 400 },
        );
      filter._id = sentenceId;
    }
    if (params.get("mistakes") === "true") {
      const rows = await query(
        "SELECT DISTINCT sentence_id FROM submissions WHERE user_id=$1 AND status='completed' AND jsonb_array_length(report->'grammarErrors')>0",
        [viewer.id],
      );
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
        return NextResponse.json(
          { error: "Chủ đề không hợp lệ." },
          { status: 400 },
        );
      filter.topic = topic;
    }
    if (level && level !== "ALL") {
      if (!LEVELS.includes(level as (typeof LEVELS)[number]))
        return NextResponse.json(
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
    return NextResponse.json({
      items: items.map((item) => ({ ...item, _id: String(item._id) })),
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    logError("sentences.list.failed", error);
    return NextResponse.json(
      {
        error:
          "Không thể tải bài tập. Hãy kiểm tra kết nối MongoDB và cấu hình máy chủ.",
      },
      { status: 503 },
    );
  }
}

export const GET = api("/api/sentences", handleGet);
