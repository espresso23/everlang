import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { Submission } from "@/lib/models/Submission";
import { getUserId } from "@/lib/user-id";
import { logError, withApiLogging } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handleGet(request: NextRequest) {
  const userId = getUserId(request);
  if (!userId) return NextResponse.json({ error: "Thiếu định danh trình duyệt hợp lệ." }, { status: 400 });
  try {
    await connectDb();
    const latestPerSentence = await Submission.aggregate([
      { $match: { userId } },
      { $sort: { submittedAt: -1 } },
      { $group: { _id: "$sentenceId", score: { $first: "$score" }, submittedAt: { $first: "$submittedAt" } } },
      { $lookup: { from: "sentences", localField: "_id", foreignField: "_id", as: "sentence" } },
      { $unwind: "$sentence" },
      { $project: { score: 1, submittedAt: 1, topic: "$sentence.topic" } },
    ]);
    const totalCompleted = latestPerSentence.length;
    const averageScore = totalCompleted ? latestPerSentence.reduce((sum, item) => sum + item.score, 0) / totalCompleted : 0;
    const byTopic = new Map<string, { total: number; attempts: number }>();
    for (const item of latestPerSentence) {
      const value = byTopic.get(item.topic) ?? { total: 0, attempts: 0 };
      value.total += item.score;
      value.attempts += 1;
      byTopic.set(item.topic, value);
    }
    const weakTopics = [...byTopic].map(([_id, value]) => ({ _id, averageScore: value.total / value.attempts, attempts: value.attempts }))
      .sort((a, b) => a.averageScore - b.averageScore).slice(0, 3);
    const latestSubmission = latestPerSentence.reduce<Date | null>((latest, item) => !latest || item.submittedAt > latest ? item.submittedAt : latest, null);
    return NextResponse.json({ totalCompleted, averageScore: Math.round(averageScore), weakTopics, latestSubmission });
  } catch (error) {
    logError("user.stats.failed", error);
    return NextResponse.json({ error: "Không thể tải thống kê." }, { status: 503 });
  }
}

export const GET = withApiLogging("/api/user/stats", handleGet);
