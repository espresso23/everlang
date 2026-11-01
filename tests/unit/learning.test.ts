import { describe, it, expect } from "vitest";
import { localDay, makePlan, streak } from "@everlang/contracts/learning/schedule";
import { newCard, reviewCard, ALGORITHM } from "@everlang/backend/learning/srs";
import { examSchema, publicExam, scoreExam } from "@everlang/contracts/exams";
describe("daily study plan", () => {
  it("uses the learner timezone across midnight", () => {
    expect(localDay(new Date("2026-10-29T17:01:00Z"), "Asia/Ho_Chi_Minh")).toBe(
      "2026-10-30",
    );
    expect(localDay(new Date("2026-10-29T16:59:00Z"), "Asia/Ho_Chi_Minh")).toBe(
      "2026-10-29",
    );
  });
  it("respects budget and priority when reviews overload the day", () => {
    const p = makePlan(20, 300, ["draft"], "Kinh tế", "new");
    expect(p.map((t) => t.type)).toEqual(["review"]);
    expect(p.reduce((n, t) => n + t.minutes, 0)).toBe(20);
  });
  it("prioritizes unfinished work and weakness before new work", () => {
    expect(makePlan(25, 3, ["d"], "Xã hội", "n").map((t) => t.type)).toEqual([
      "review",
      "draft",
      "weak",
      "new",
    ]);
  });
  it("counts unique consecutive local dates and preserves streak until today ends", () => {
    expect(
      streak(["2026-10-29", "2026-10-29", "2026-10-28"], "2026-10-29"),
    ).toBe(2);
    expect(streak(["2026-10-28", "2026-10-27"], "2026-10-29")).toBe(2);
    expect(streak(["2026-10-27"], "2026-10-29")).toBe(0);
  });
});
describe("FSRS storage and scheduling", () => {
  it("can review a JSON roundtripped card without mutating stored input", async () => {
    const now = new Date("2026-10-29T08:00:00Z");
    const c = await newCard("test-card", now);
    const stored = JSON.parse(JSON.stringify(c));
    const before = JSON.stringify(stored);
    const result = await reviewCard(stored, 3, now);
    expect(result.card.dueAt.getTime()).toBeGreaterThan(now.getTime());
    expect(result.card.reps).toBe(1);
    expect(JSON.stringify(stored)).toBe(before);
    expect(ALGORITHM).toContain("FSRS-7");
  });
  it("schedules all four learner grades", async () => {
    for (const rating of [1, 2, 3, 4]) {
      const now = new Date();
      const r = await reviewCard(await newCard("test", now), rating, now);
      expect(Number.isFinite(r.card.dueAt.getTime())).toBe(true);
      expect(r.revlog).toBeTruthy();
    }
  });
});
describe("exam confidentiality and scoring", () => {
  const e = examSchema.parse({
    title: "Sample",
    format: "TOPIK-II-PBT",
    formatVersion: "1",
    kind: "mini",
    source: "Original",
    rights: "Authored",
    minutes: 5,
    questions: [
      {
        id: "1",
        skill: "reading",
        prompt: "Q",
        options: ["A", "B"],
        answer: "B",
        points: 2,
        explanation: "Because B",
      },
    ],
  });
  it("does not reveal answers before submission", () => {
    const text = JSON.stringify(publicExam(e));
    expect(text).not.toContain('"answer"');
    expect(text).not.toContain("Because B");
  });
  it("scores objective questions deterministically", () => {
    expect(scoreExam(e, { "1": "B" }).objectiveScore).toBe(2);
    expect(scoreExam(e, { "1": "A" }).objectiveScore).toBe(0);
  });
  it("rejects an incomplete test labeled full", () => {
    expect(examSchema.safeParse({ ...e, kind: "full" }).success).toBe(false);
  });
});
