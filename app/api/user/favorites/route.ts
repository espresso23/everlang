import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDb } from "@/lib/db";
import { UserSentenceState } from "@/lib/models/UserSentenceState";
import { getUserId } from "@/lib/user-id";
import { logError, withApiLogging } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({ sentenceId: z.string().regex(/^[a-f\d]{24}$/i), favorite: z.boolean() });

async function handleGet(request: NextRequest) {
  const userId = getUserId(request);
  if (!userId) return NextResponse.json({ error: "Thiếu định danh trình duyệt hợp lệ." }, { status: 400 });
  try {
    await connectDb();
    const favorites = await UserSentenceState.aggregate([
      { $match: { userId, favorite: true } },
      { $sort: { updatedAt: -1 } },
      { $lookup: { from: "sentences", localField: "sentenceId", foreignField: "_id", as: "sentence" } },
      { $unwind: "$sentence" },
      { $lookup: { from: "submissions", let: { sentenceId: "$sentenceId" }, pipeline: [
        { $match: { $expr: { $and: [{ $eq: ["$sentenceId", "$$sentenceId"] }, { $eq: ["$userId", userId] }] } } },
        { $sort: { submittedAt: -1 } }, { $limit: 1 },
      ], as: "submission" } },
      { $project: { sentence: 1, submission: { $arrayElemAt: ["$submission", 0] } } },
    ]);
    return NextResponse.json({ favorites });
  } catch (error) {
    logError("user.favorites.list.failed", error);
    return NextResponse.json({ error: "Không thể tải danh sách yêu thích." }, { status: 503 });
  }
}

async function handlePost(request: NextRequest) {
  const userId = getUserId(request);
  if (!userId) return NextResponse.json({ error: "Thiếu định danh trình duyệt hợp lệ." }, { status: 400 });
  let body: z.infer<typeof bodySchema>;
  try { body = bodySchema.parse(await request.json()); }
  catch { return NextResponse.json({ error: "Dữ liệu yêu thích không hợp lệ." }, { status: 400 }); }
  try {
    await connectDb();
    const state = await UserSentenceState.findOneAndUpdate(
      { userId, sentenceId: new mongoose.Types.ObjectId(body.sentenceId) },
      { $set: { favorite: body.favorite } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).lean();
    return NextResponse.json({ sentenceId: body.sentenceId, favorite: state.favorite });
  } catch (error) {
    logError("user.favorites.update.failed", error);
    return NextResponse.json({ error: "Không thể lưu thay đổi yêu thích." }, { status: 503 });
  }
}

export const GET = withApiLogging("/api/user/favorites", handleGet);
export const POST = withApiLogging("/api/user/favorites", handlePost);
