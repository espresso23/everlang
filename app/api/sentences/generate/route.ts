import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { aiErrorResponse, generateExercises } from "@/lib/ai";
import { connectDb } from "@/lib/db";
import { Sentence } from "@/lib/models/Sentence";
import { LEVELS, TOPICS } from "@/lib/types";
import { logError, withApiLogging } from "@/lib/logger";

export const runtime = "nodejs";
const bodySchema = z.object({ topic: z.enum(TOPICS), level: z.enum(LEVELS), count: z.number().int().min(1).max(10) });

async function handlePost(request: NextRequest) {
  try {
    let rawBody: unknown;
    try { rawBody = await request.json(); }
    catch { return NextResponse.json({ error: "Nội dung yêu cầu phải là JSON hợp lệ." }, { status: 400 }); }
    const body = bodySchema.parse(rawBody);
    await connectDb();
    const generated = await generateExercises(body.topic, body.level, body.count);
    if (generated.sentences.length !== body.count || generated.sentences.some((item) => item.topic !== body.topic || item.level !== body.level)) {
      return NextResponse.json({ error: "AI trả về số lượng hoặc cấp độ bài tập không đúng yêu cầu." }, { status: 502 });
    }
    const items = await Sentence.insertMany(generated.sentences.map((item) => ({ ...item, isAiGenerated: true })));
    return NextResponse.json({ items: items.map((item) => ({ ...item.toObject(), _id: String(item._id) })) }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Dữ liệu yêu cầu không hợp lệ.", details: error.issues }, { status: 400 });
    logError("sentences.generate.failed", error, { provider: "openrouter", model: process.env.OPENROUTER_MODEL || "google/gemma-4-26b-a4b-it:free" });
    const failure = aiErrorResponse(error);
    return NextResponse.json({ error: failure.message }, { status: failure.status });
  }
}

export const POST = withApiLogging("/api/sentences/generate", handlePost);
