import { z } from "zod";
import { api, HttpError } from "@/lib/api";
import { query, pool } from "@/lib/sql";
import { statistics } from "@/lib/learning/submissions";
import {
  localDay,
  makePlan,
  streak,
  type DailyTask,
} from "@/lib/learning/schedule";
import { ensureContent } from "@/lib/content";
import { Sentence } from "@/lib/models/Sentence";
export const GET = api("/api/dashboard", async (_, u) => {
  await query(
    "INSERT INTO profiles(user_id) VALUES($1) ON CONFLICT DO NOTHING",
    [u.id],
  );
  const profile = (
    await query("SELECT * FROM profiles WHERE user_id=$1", [u.id])
  )[0];
  const today = localDay(new Date(), profile.timezone);
  const due = Number(
    (
      await query(
        "SELECT count(*) FROM vocabulary WHERE user_id=$1 AND NOT suspended AND due<=now()",
        [u.id],
      )
    )[0].count,
  );
  const stats = await statistics(u.id);
  let plan = (
    await query("SELECT * FROM daily_plans WHERE user_id=$1 AND day=$2", [
      u.id,
      today,
    ])
  )[0];
  if (!plan) {
    await ensureContent();
    const drafts = await query(
      "SELECT sentence_id FROM drafts WHERE user_id=$1 AND length(trim(text))>0 ORDER BY updated_at DESC LIMIT 2",
      [u.id],
    );
    const done = await query(
      "SELECT DISTINCT sentence_id FROM submissions WHERE user_id=$1 AND status='completed'",
      [u.id],
    );
    const next = await Sentence.findOne({
      status: "published",
      _id: { $nin: [...done, ...drafts].map((d) => d.sentence_id) },
    }).lean();
    const tasks = makePlan(
      profile.minutes,
      due,
      drafts.map((d) => d.sentence_id),
      stats.weakTopics[0]?._id,
      next ? String(next._id) : undefined,
    );
    await query(
      "INSERT INTO daily_plans(user_id,day,timezone,tasks) VALUES($1,$2,$3,$4) ON CONFLICT DO NOTHING",
      [u.id, today, profile.timezone, JSON.stringify(tasks)],
    );
    plan = (
      await query("SELECT * FROM daily_plans WHERE user_id=$1 AND day=$2", [
        u.id,
        today,
      ])
    )[0];
  }
  const days = await query(
    "SELECT day FROM study_days WHERE user_id=$1 ORDER BY day DESC",
    [u.id],
  );
  const errors = await query(
    "SELECT id,snapshot,report,created_at FROM submissions WHERE user_id=$1 AND status='completed' AND jsonb_array_length(report->'grammarErrors')>0 ORDER BY created_at DESC LIMIT 20",
    [u.id],
  );
  return {
    profile,
    plan,
    dueCount: due,
    stats,
    streak: streak(
      days.map((d) => d.day),
      today,
    ),
    errors,
  };
});
export const PATCH = api("/api/dashboard", async (r, u) => {
  const b = z
    .object({
      day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      version: z.number().int().positive(),
      taskId: z.string(),
      action: z.enum(["done", "skipped", "pending", "replace"]),
    })
    .parse(await r.json());
  const c = await pool.connect();
  try {
    await c.query("BEGIN");
    const p = (
      await c.query(
        "SELECT * FROM daily_plans WHERE user_id=$1 AND day=$2 FOR UPDATE",
        [u.id, b.day],
      )
    ).rows[0];
    if (!p || p.version !== b.version)
      throw new HttpError(409, "Lịch đã thay đổi. Hãy tải lại.");
    if (localDay(new Date(), p.timezone) !== b.day)
      throw new HttpError(409, "Đã sang ngày mới. Hãy tải lịch hôm nay.");
    const task = (p.tasks as DailyTask[]).find((t) => t.id === b.taskId);
    if (!task) throw new HttpError(404, "Không tìm thấy nhiệm vụ.");
    if (b.action === "replace") {
      if (task.type === "review")
        throw new HttpError(
          400,
          "Thẻ ôn đến hạn có thể bỏ qua hoặc hoàn thành.",
        );
      await ensureContent();
      const next = await Sentence.findOne({
        status: "published",
        _id: { $ne: task.target },
      }).lean();
      if (!next) throw new HttpError(404, "Chưa có bài thay thế.");
      task.target = String(next._id);
      task.title = "Luyện bài dịch khác";
      task.reason = "Bạn đã đổi nhiệm vụ hôm nay";
      task.status = "pending";
    } else task.status = b.action;
    const complete =
      p.tasks.length > 0 &&
      p.tasks.every((t: DailyTask) => t.status !== "pending") &&
      p.tasks.some((t: DailyTask) => t.status === "done");
    await c.query(
      "UPDATE daily_plans SET tasks=$3,version=version+1,completed=$4 WHERE user_id=$1 AND day=$2",
      [u.id, b.day, JSON.stringify(p.tasks), complete],
    );
    if (complete)
      await c.query(
        "INSERT INTO study_days(user_id,day) VALUES($1,$2) ON CONFLICT DO NOTHING",
        [u.id, b.day],
      );
    await c.query("COMMIT");
    return { saved: true };
  } catch (e) {
    await c.query("ROLLBACK");
    throw e;
  } finally {
    c.release();
  }
});
