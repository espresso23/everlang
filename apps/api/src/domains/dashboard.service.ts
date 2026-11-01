import { ormDataSource, createQueryRunner, rollback, } from "@everlang/backend/orm";
import { Entities } from "@everlang/backend/entities";
import { z } from "zod";
import { HttpError } from "@everlang/backend/http";
import { statistics } from "@everlang/backend/learning/submissions";
import { localDay, makePlan, streak, type DailyTask, } from "@everlang/contracts/learning/schedule";
import { ensureContent } from "@everlang/backend/content";
import { sentences } from "@everlang/backend/content-store";
import { Injectable } from "@nestjs/common";
import type { Request } from "express";
import type { Viewer } from "@everlang/backend/http";
@Injectable()
export class DashboardService {
    async get(_: Request, u: Viewer) {
        await ormDataSource
            .createQueryBuilder()
            .insert()
            .into(Entities.profiles, ["user_id"])
            .values({ user_id: () => ":p1" })
            .updateEntity(false)
            .orIgnore()
            .setParameters({ p1: u.id })
            .execute()
            .then((result) => result.raw);
        const profile = (await ormDataSource
            .createQueryBuilder()
            .select(["*"])
            .from(Entities.profiles, "row")
            .where("user_id=:p1")
            .setParameters({ p1: u.id })
            .getRawMany())[0];
        const today = localDay(new Date(), profile.timezone);
        const due = Number((await ormDataSource
            .createQueryBuilder()
            .select(["count(*)"])
            .from(Entities.vocabulary, "row")
            .where("user_id=:p1 AND NOT suspended AND due<=now()")
            .setParameters({ p1: u.id })
            .getRawMany())[0].count);
        const stats = await statistics(u.id);
        let plan = (await ormDataSource
            .createQueryBuilder()
            .select(["*"])
            .from(Entities.daily_plans, "row")
            .where("user_id=:p1 AND day=:p2")
            .setParameters({ p1: u.id, p2: today })
            .getRawMany())[0];
        if (!plan) {
            await ensureContent();
            const drafts = await ormDataSource
                .createQueryBuilder()
                .select(["sentence_id"])
                .from(Entities.drafts, "row")
                .where("user_id=:p1 AND length(trim(text))>0")
                .orderBy("updated_at", "DESC")
                .limit(2)
                .setParameters({ p1: u.id })
                .getRawMany();
            const done = await ormDataSource
                .createQueryBuilder()
                .select(["sentence_id"])
                .from(Entities.submissions, "row")
                .distinct(true)
                .where("user_id=:p1 AND status='completed'")
                .setParameters({ p1: u.id })
                .getRawMany();
            const next = (await sentences.list({ status: "published", excludeIds: [...done, ...drafts].map(d => d.sentence_id), limit: 1 })).items[0];
            const tasks = makePlan(profile.minutes, due, drafts.map((d) => d.sentence_id), stats.weakTopics[0]?._id, next ? String(next._id) : undefined);
            await ormDataSource
                .createQueryBuilder()
                .insert()
                .into(Entities.daily_plans, ["user_id", "day", "timezone", "tasks"])
                .values({
                user_id: () => ":p1",
                day: () => ":p2",
                timezone: () => ":p3",
                tasks: () => ":p4",
            })
                .updateEntity(false)
                .orIgnore()
                .setParameters({
                p1: u.id,
                p2: today,
                p3: profile.timezone,
                p4: JSON.stringify(tasks),
            })
                .execute()
                .then((result) => result.raw);
            plan = (await ormDataSource
                .createQueryBuilder()
                .select(["*"])
                .from(Entities.daily_plans, "row")
                .where("user_id=:p1 AND day=:p2")
                .setParameters({ p1: u.id, p2: today })
                .getRawMany())[0];
        }
        const days = await ormDataSource
            .createQueryBuilder()
            .select(["day"])
            .from(Entities.study_days, "row")
            .where("user_id=:p1")
            .orderBy("day", "DESC")
            .setParameters({ p1: u.id })
            .getRawMany();
        const errors = await ormDataSource
            .createQueryBuilder()
            .select(["id", "snapshot", "report", "created_at"])
            .from(Entities.submissions, "row")
            .where("user_id=:p1 AND status='completed' AND jsonb_array_length(report->'grammarErrors')>0")
            .orderBy("created_at", "DESC")
            .limit(20)
            .setParameters({ p1: u.id })
            .getRawMany();
        return {
            profile,
            plan,
            dueCount: due,
            stats,
            streak: streak(days.map((d) => d.day), today),
            errors,
        };
    }
    async patch(r: Request, u: Viewer) {
        const b = z
            .object({
            day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
            version: z.number().int().positive(),
            taskId: z.string(),
            action: z.enum(["done", "skipped", "pending", "replace"]),
        })
            .parse(r.body);
        const c = await createQueryRunner();
        try {
            await c.startTransaction();
            const p = (await c.manager
                .createQueryBuilder()
                .select(["*"])
                .from(Entities.daily_plans, "row")
                .where("user_id=:p1 AND day=:p2")
                .setLock("pessimistic_write")
                .setParameters({ p1: u.id, p2: b.day })
                .getRawMany())[0];
            if (!p || p.version !== b.version)
                throw new HttpError(409, "Lịch đã thay đổi. Hãy tải lại.");
            if (localDay(new Date(), p.timezone) !== b.day)
                throw new HttpError(409, "Đã sang ngày mới. Hãy tải lịch hôm nay.");
            const task = (p.tasks as DailyTask[]).find((t) => t.id === b.taskId);
            if (!task)
                throw new HttpError(404, "Không tìm thấy nhiệm vụ.");
            if (b.action === "replace") {
                if (task.type === "review")
                    throw new HttpError(400, "Thẻ ôn đến hạn có thể bỏ qua hoặc hoàn thành.");
                await ensureContent();
                const next = (await sentences.list({ status: "published", excludeIds: task.target ? [task.target] : [], limit: 1 })).items[0];
                if (!next)
                    throw new HttpError(404, "Chưa có bài thay thế.");
                task.target = String(next._id);
                task.title = "Luyện bài dịch khác";
                task.reason = "Bạn đã đổi nhiệm vụ hôm nay";
                task.status = "pending";
            }
            else
                task.status = b.action;
            const complete = p.tasks.length > 0 &&
                p.tasks.every((t: DailyTask) => t.status !== "pending") &&
                p.tasks.some((t: DailyTask) => t.status === "done");
            await c.manager
                .createQueryBuilder()
                .update(Entities.daily_plans)
                .set({
                tasks: () => ":p3",
                version: () => "version+1",
                completed: () => ":p4",
            })
                .where("user_id=:p1 AND day=:p2")
                .setParameters({
                p1: u.id,
                p2: b.day,
                p3: JSON.stringify(p.tasks),
                p4: complete,
            })
                .execute()
                .then((result) => result.raw);
            if (complete)
                await c.manager
                    .createQueryBuilder()
                    .insert()
                    .into(Entities.study_days, ["user_id", "day"])
                    .values({ user_id: () => ":p1", day: () => ":p2" })
                    .updateEntity(false)
                    .orIgnore()
                    .setParameters({ p1: u.id, p2: b.day })
                    .execute()
                    .then((result) => result.raw);
            await c.commitTransaction();
            return { saved: true };
        }
        catch (e) {
            await rollback(c);
            throw e;
        }
        finally {
            await c.release();
        }
    }
}
