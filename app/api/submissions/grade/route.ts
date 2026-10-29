import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { aiErrorResponse, gradeTranslation } from "@/lib/ai";
import { connectDb } from "@/lib/db";
import { Sentence } from "@/lib/models/Sentence";
import { Submission } from "@/lib/models/Submission";
import { getUserId } from "@/lib/user-id";
import { logError, withApiLogging } from "@/lib/logger";

export const runtime = "nodejs";
const bodySchema = z.object({ sentenceId: z.string().regex(/^[a-f\d]{24}$/i), userTranslation: z.string().trim().min(1).max(5000), forceRegrade: z.boolean().optional().default(false) });

async function handlePost(request: NextRequest) {
  try {
    const userId = getUserId(request);
    if (!userId) return NextResponse.json({ error: "Thiếu định danh trình duyệt hợp lệ." }, { status: 400 });
    let rawBody: unknown;
    try { rawBody = await request.json(); }
    catch { return NextResponse.json({ error: "Nội dung yêu cầu phải là JSON hợp lệ." }, { status: 400 }); }
    const body = bodySchema.parse(rawBody);
    await connectDb();
    const sentence = await Sentence.findById(body.sentenceId).lean();
    if (!sentence) return NextResponse.json({ error: "Không tìm thấy câu hỏi." }, { status: 404 });
    if (!body.forceRegrade) {
      const cached = await Submission.findOne({ userId, sentenceId: new mongoose.Types.ObjectId(body.sentenceId), userTranslation: body.userTranslation })
        .sort({ submittedAt: -1 }).lean();
      if (cached) return NextResponse.json({
        score: cached.score,
        accuracyRating: cached.accuracyRating,
        overallComment: cached.overallComment,
        grammarErrors: cached.grammarErrors,
        vocabSuggestions: cached.vocabSuggestions,
        advancedRewrites: cached.advancedRewrites,
        submissionId: String(cached._id),
        submittedAt: cached.submittedAt,
        cached: true,
      });
    }
    const report = await gradeTranslation({ viText: sentence.viText, level: sentence.level, koSampleAnswer: sentence.koSampleAnswer, userTranslation: body.userTranslation });
    const submission = await Submission.create({ userId, sentenceId: new mongoose.Types.ObjectId(body.sentenceId), userTranslation: body.userTranslation, ...report });
    return NextResponse.json({ ...report, submissionId: String(submission._id), submittedAt: submission.submittedAt });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Vui lòng nhập bản dịch hợp lệ.", details: error.issues }, { status: 400 });
    logError("submissions.grade.failed", error, { provider: "openrouter", model: process.env.OPENROUTER_MODEL || "qwen/qwen3.8-flash" });
    const failure = aiErrorResponse(error);
    return NextResponse.json({ error: failure.message }, { status: failure.status });
  }
}

export const POST = withApiLogging("/api/submissions/grade", handlePost);
