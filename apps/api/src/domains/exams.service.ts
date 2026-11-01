import { randomUUID } from "node:crypto";
import { z } from "zod";
import { HttpError } from '@everlang/backend/http';
import { connectDb } from "@everlang/backend/db";
import { ExamModel } from "@everlang/backend/models/Exam";
import { examSchema, publicExam, scoreExam } from "@everlang/contracts/exams";
import { query, pool } from "@everlang/backend/sql";
import { getGradingQueue } from "@everlang/backend/redis";
const mini = {
  title: "Đọc & Viết — bài luyện ngắn beta",
  format: "TOPIK-II-PBT",
  formatVersion: "practice-1",
  kind: "mini",
  source: "EverLang tự biên soạn",
  rights: "Nội dung biên soạn beta; không phải đề thi chính thức",
  minutes: 10,
  questions: [
    {
      id: "r1",
      skill: "reading",
      prompt:
        "매일 조금씩 공부하면 실력이 늘 수 있다. 이 문장의 내용과 같은 것은?",
      options: [
        "꾸준히 공부하는 것이 도움이 된다.",
        "하루에 모든 내용을 외워야 한다.",
        "복습은 필요하지 않다.",
        "공부 시간은 길수록 항상 좋다.",
      ],
      answer: "꾸준히 공부하는 것이 도움이 된다.",
      points: 2,
      explanation: "조금씩 매일 공부하는 것은 꾸준한 학습을 뜻한다.",
    },
    {
      id: "w1",
      skill: "writing",
      prompt: "자신에게 효과적인 외국어 학습 방법을 100~200자로 설명하세요.",
      options: [],
      answer: "꾸준한 연습, 복습 방법, 구체적인 예시를 포함한 글.",
      points: 20,
      explanation: "Nêu phương pháp, lý do và ví dụ cụ thể.",
    },
  ],
};
import { Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { queryParams } from '@everlang/backend/http';
import type { Viewer } from '@everlang/backend/http';
@Injectable()
export class ExamsService {
async get(r: Request, u: Viewer) {
  await connectDb();
  await ExamModel.updateOne(
    { title: mini.title },
    {
      $setOnInsert: {
        title: mini.title,
        document: mini,
        published: true,
        version: 1,
      },
    },
    { upsert: true },
  );
  const attemptId = queryParams(r).get("attempt");
  if (attemptId) {
    const a = (
      await query("SELECT * FROM exam_attempts WHERE id=$1 AND user_id=$2", [
        attemptId,
        u.id,
      ])
    )[0];
    if (!a) throw new HttpError(404, "Không tìm thấy bài thi.");
    return {
      ...a,
      snapshot: a.submitted_at ? a.snapshot : publicExam(a.snapshot),
    };
  }
  const items = await ExamModel.find({ published: true }).lean();
  return {
    items: items.map((e) => ({
      id: String(e._id),
      title: e.title,
      kind: e.document.kind,
      minutes: e.document.minutes,
      source: e.document.source,
    })),
    attempts: await query(
      "SELECT id,exam_id,started_at,submitted_at,result FROM exam_attempts WHERE user_id=$1 ORDER BY started_at DESC LIMIT 20",
      [u.id],
    ),
  };

}
async post(r: Request, u: Viewer) {
  const b = z
    .object({ examId: z.string().regex(/^[a-f\d]{24}$/i) })
    .parse(r.body);
  await connectDb();
  const e = await ExamModel.findOne({ _id: b.examId, published: true }).lean();
  if (!e) throw new HttpError(404, "Không tìm thấy đề thi.");
  const doc = examSchema.parse(e.document);
  const existing = (
    await query(
      "SELECT id FROM exam_attempts WHERE user_id=$1 AND exam_id=$2 AND submitted_at IS NULL ORDER BY started_at DESC LIMIT 1",
      [u.id, b.examId],
    )
  )[0];
  if (existing) return { id: existing.id };
  const id = randomUUID();
  const inserted = await query(
    "INSERT INTO exam_attempts(id,user_id,exam_id,snapshot,deadline) VALUES($1,$2,$3,$4,now()+($5::integer*interval '1 minute')) ON CONFLICT DO NOTHING RETURNING id",
    [id, u.id, b.examId, JSON.stringify(doc), doc.minutes],
  );
  return {
    id:
      inserted[0]?.id ||
      (
        await query(
          "SELECT id FROM exam_attempts WHERE user_id=$1 AND exam_id=$2 AND submitted_at IS NULL",
          [u.id, b.examId],
        )
      )[0].id,
  };

}
async patch(r: Request, u: Viewer) {
  const b = z
    .object({
      id: z.string().uuid(),
      version: z.number().int().positive(),
      answers: z.record(z.string(), z.string().max(10000)),
      submit: z.boolean().default(false),
    })
    .parse(r.body);
  const c = await pool.connect();
  let queued = false;
  try {
    await c.query("BEGIN");
    const a = (
      await c.query(
        "SELECT * FROM exam_attempts WHERE id=$1 AND user_id=$2 FOR UPDATE",
        [b.id, u.id],
      )
    ).rows[0];
    if (!a) throw new HttpError(404, "Không tìm thấy bài thi.");
    if (a.submitted_at) {
      await c.query("COMMIT");
      return { saved: true, submitted: true };
    }
    if (a.version !== b.version)
      throw new HttpError(409, "Bài thi đã được cập nhật ở nơi khác.");
    const expired = new Date(a.deadline).getTime() <= Date.now();
    const answers = expired ? a.answers : b.answers;
    if (b.submit || expired) {
      const result = scoreExam(a.snapshot, answers);
      await c.query(
        "UPDATE exam_attempts SET answers=$3,submitted_at=now(),result=$4,version=version+1 WHERE id=$1 AND user_id=$2",
        [b.id, u.id, JSON.stringify(answers), JSON.stringify(result)],
      );
      queued = result.writingStatus === "queued";
    } else
      await c.query(
        "UPDATE exam_attempts SET answers=$3,version=version+1 WHERE id=$1 AND user_id=$2",
        [b.id, u.id, JSON.stringify(answers)],
      );
    await c.query("COMMIT");
  } catch (e) {
    await c.query("ROLLBACK");
    throw e;
  } finally {
    c.release();
  }
  if (queued)
    await getGradingQueue().add(
      "exam-writing",
      { attemptId: b.id },
      {
        jobId: "exam-" + b.id,
        attempts: 3,
        backoff: { type: "exponential", delay: 5000 },
        removeOnComplete: 100,
      },
    );
  return { saved: true };

}
async put(r: Request, _u: Viewer) {
    const b = examSchema.parse(r.body);
    await connectDb();
    const item = await ExamModel.create({
      title: b.title,
      document: b,
      published: true,
      version: 1,
    });
    return { id: String(item._id) };

}
}
