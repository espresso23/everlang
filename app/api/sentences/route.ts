import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { Sentence } from "@/lib/models/Sentence";
import seedData from "@/data/seed-sentences.json";
import { LEVELS, TOPICS } from "@/lib/types";
import { logError, withApiLogging } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function ensureSeedData() {
  if (await Sentence.countDocuments({ sourceId: { $exists: true } }) >= seedData.length) return;
  try {
    await Sentence.bulkWrite(seedData.map((entry) => ({
      updateOne: { filter: { sourceId: entry.sourceId }, update: { $setOnInsert: entry }, upsert: true },
    })), { ordered: false });
  } catch (error) {
    if (!(error instanceof Error) || !error.message.includes("E11000")) throw error;
  }
}

async function handleGet(request: NextRequest) {
  try {
    await connectDb();
    await ensureSeedData();
    const params = request.nextUrl.searchParams;
    const topic = params.get("topic");
    const level = params.get("level");
    const page = Math.max(1, Number(params.get("page")) || 1);
    const limit = Math.min(50, Math.max(1, Number(params.get("limit")) || 20));
    const filter: Record<string, string> = {};
    if (topic && topic !== "ALL") {
      if (!TOPICS.includes(topic as (typeof TOPICS)[number])) return NextResponse.json({ error: "Chủ đề không hợp lệ." }, { status: 400 });
      filter.topic = topic;
    }
    if (level && level !== "ALL") {
      if (!LEVELS.includes(level as (typeof LEVELS)[number])) return NextResponse.json({ error: "Cấp độ không hợp lệ." }, { status: 400 });
      filter.level = level;
    }
    const [items, total] = await Promise.all([
      Sentence.find(filter).sort({ createdAt: -1, _id: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Sentence.countDocuments(filter),
    ]);
    return NextResponse.json({ items: items.map((item) => ({ ...item, _id: String(item._id) })), page, limit, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    logError("sentences.list.failed", error);
    return NextResponse.json({ error: "Không thể tải bài tập. Hãy kiểm tra kết nối MongoDB và cấu hình máy chủ." }, { status: 503 });
  }
}

export const GET = withApiLogging("/api/sentences", handleGet);
