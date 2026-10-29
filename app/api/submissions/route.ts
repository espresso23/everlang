import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDb } from "@/lib/db";
import { Submission } from "@/lib/models/Submission";
import { getUserId } from "@/lib/user-id";
import { logError, withApiLogging } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const sentenceIdSchema = z.string().regex(/^[a-f\d]{24}$/i);

async function handleGet(request: NextRequest) {
  const userId = getUserId(request);
  if (!userId) return NextResponse.json({ error: "Thiếu định danh trình duyệt hợp lệ." }, { status: 400 });
  const parsedId = sentenceIdSchema.safeParse(request.nextUrl.searchParams.get("sentenceId"));
  const sentenceId = request.nextUrl.searchParams.get("sentenceId");
  if (sentenceId && !parsedId.success) return NextResponse.json({ error: "Mã câu hỏi không hợp lệ." }, { status: 400 });

  try {
    await connectDb();
    if (parsedId.success) {
      const submission = await Submission.findOne({ userId, sentenceId: parsedId.data })
        .sort({ submittedAt: -1 })
        .select("score accuracyRating overallComment grammarErrors vocabSuggestions advancedRewrites userTranslation submittedAt")
        .lean();
      return NextResponse.json({ submission });
    }
    const submissions = await Submission.aggregate([
      { $match: { userId } },
      { $sort: { submittedAt: -1 } },
      { $group: { _id: "$sentenceId", submission: { $first: "$$ROOT" } } },
      { $replaceRoot: { newRoot: "$submission" } },
      { $lookup: { from: "sentences", localField: "sentenceId", foreignField: "_id", as: "sentence" } },
      { $unwind: "$sentence" },
      { $sort: { submittedAt: -1 } },
      { $project: { score: 1, accuracyRating: 1, overallComment: 1, grammarErrors: 1, vocabSuggestions: 1, advancedRewrites: 1, userTranslation: 1, submittedAt: 1, sentence: 1 } },
    ]);
    return NextResponse.json({ submissions });
  } catch (error) {
    logError("submissions.history.failed", error);
    return NextResponse.json({ error: "Không thể tải đánh giá đã lưu." }, { status: 503 });
  }
}

export const GET = withApiLogging("/api/submissions", handleGet);
