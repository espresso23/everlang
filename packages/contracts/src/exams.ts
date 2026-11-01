import { z } from "zod";
export const questionSchema = z.object({
  id: z.string().min(1).max(80),
  skill: z.enum(["reading", "listening", "writing"]),
  prompt: z.string().min(1).max(10000),
  options: z.array(z.string().max(2000)).max(6).default([]),
  answer: z.string().max(5000),
  points: z.number().int().min(1).max(100),
  explanation: z.string().max(5000),
  audioUrl: z.string().url().optional(),
});
export const examSchema = z
  .object({
    title: z.string().min(1).max(200),
    format: z.literal("TOPIK-II-PBT"),
    formatVersion: z.string().min(1),
    kind: z.enum(["mini", "full"]),
    source: z.string().min(1).max(1000),
    rights: z.string().min(1).max(1000),
    minutes: z.number().int().min(1).max(180),
    questions: z.array(questionSchema).min(1).max(104),
  })
  .superRefine((e, ctx) => {
    if (new Set(e.questions.map((q) => q.id)).size !== e.questions.length)
      ctx.addIssue({ code: "custom", message: "Mã câu phải duy nhất" });
    for (const q of e.questions) {
      if (q.skill !== "writing" && !q.options.includes(q.answer))
        ctx.addIssue({ code: "custom", message: "Đáp án phải thuộc lựa chọn" });
      if (q.skill === "listening" && !q.audioUrl)
        ctx.addIssue({ code: "custom", message: "Bài nghe cần audio" });
      if (q.audioUrl && !q.audioUrl.startsWith("https://"))
        ctx.addIssue({ code: "custom", message: "Audio cần HTTPS" });
    }
    if (
      e.kind === "full" &&
      (e.minutes !== 180 ||
        e.questions.filter((q) => q.skill === "reading").length !== 50 ||
        e.questions.filter((q) => q.skill === "listening").length !== 50 ||
        e.questions.filter((q) => q.skill === "writing").length !== 4 ||
        ["reading", "listening", "writing"].some(
          (skill) =>
            e.questions
              .filter((q) => q.skill === skill)
              .reduce((n, q) => n + q.points, 0) !== 100,
        ))
    )
      ctx.addIssue({
        code: "custom",
        message:
          "Đề full cần 180 phút, 50 Nghe/50 Đọc/4 Viết và 100 điểm mỗi kỹ năng",
      });
  });
export type Exam = z.infer<typeof examSchema>;
export function publicExam(e: Exam) {
  return {
    ...e,
    questions: e.questions.map((q) => ({
      ...q,
      answer: undefined,
      explanation: undefined,
    })),
  };
}
export function scoreExam(e: Exam, answers: Record<string, string>) {
  const objective = e.questions.filter((q) => q.skill !== "writing");
  return {
    objectiveScore: objective.reduce(
      (n, q) => n + (answers[q.id] === q.answer ? q.points : 0),
      0,
    ),
    objectiveMax: objective.reduce((n, q) => n + q.points, 0),
    writingStatus: e.questions.some((q) => q.skill === "writing")
      ? "queued"
      : "none",
    writing: [],
    official: false,
  };
}
