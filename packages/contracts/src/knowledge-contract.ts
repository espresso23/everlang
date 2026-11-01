import { z } from "zod";

export const knowledgeKinds = [
  "grammar",
  "idiom",
  "proverb",
  "hanja",
  "collocation",
  "phonetics",
  "article",
] as const;
export const knowledgeLabels: Record<(typeof knowledgeKinds)[number], string> =
  {
    grammar: "Ngữ pháp",
    idiom: "Quán dụng ngữ · Idiom",
    proverb: "Tục ngữ",
    hanja: "Thành ngữ Hán–Hàn",
    collocation: "Cụm từ",
    phonetics: "Phát âm",
    article: "Bài đọc & tài liệu",
  };
const short = z.string().trim().min(1).max(500);
export const knowledgeSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    kind: z.enum(knowledgeKinds),
    level: z.enum(["Sơ cấp", "Trung cấp", "Cao cấp"]),
    topic: z.string().trim().min(1).max(120),
    summary: z.string().trim().min(1).max(1000),
    source: short,
    rights: z.string().trim().min(1).max(1000),
    sections: z
      .array(
        z
          .object({
            id: z.string().regex(/^[a-z0-9-]{1,60}$/),
            heading: short,
            text: z.string().trim().min(1).max(6000),
          })
          .strict(),
      )
      .min(1)
      .max(30),
    examples: z
      .array(z.object({ ko: short, vi: short }).strict())
      .min(1)
      .max(20),
    related: z.array(z.string().regex(/^[a-z0-9-]{1,80}$/)).max(10),
    questions: z
      .array(
        z
          .object({
            id: z.string().regex(/^[a-z0-9-]{1,60}$/),
            type: z.enum(["choice", "cloze"]),
            prompt: short,
            options: z.array(short).max(6),
            answers: z.array(short).min(1).max(10),
            explanation: z.string().trim().min(1).max(2000),
          })
          .strict(),
      )
      .max(15),
  })
  .strict()
  .superRefine((entry, ctx) => {
    for (const field of ["sections", "questions"] as const) {
      if (new Set(entry[field].map((x) => x.id)).size !== entry[field].length)
        ctx.addIssue({
          code: "custom",
          message: "ID không được trùng",
          path: [field],
        });
    }
    entry.questions.forEach((q, i) => {
      if (
        q.type === "choice" &&
        (q.options.length < 2 ||
          q.answers.length !== 1 ||
          !q.options.includes(q.answers[0]))
      )
        ctx.addIssue({
          code: "custom",
          message: "Cần ít nhất hai lựa chọn và một đáp án trong lựa chọn",
          path: ["questions", i],
        });
      if (q.type === "cloze" && q.options.length)
        ctx.addIssue({
          code: "custom",
          message: "Điền khuyết không có lựa chọn",
          path: ["questions", i],
        });
      if (new Set(q.options).size !== q.options.length)
        ctx.addIssue({
          code: "custom",
          message: "Lựa chọn bị trùng",
          path: ["questions", i],
        });
    });
  });
export type KnowledgeContent = z.infer<typeof knowledgeSchema>;
export type KnowledgeEntry = KnowledgeContent & {
  key: string;
  revision: number;
  editVersion: number;
  status: "draft" | "reviewed" | "published";
  reviewedBy?: string;
};
export function publicEntry(entry: KnowledgeEntry) {
  const { questions, reviewedBy: _reviewedBy, ...rest } = entry;
  void _reviewedBy;
  return {
    ...rest,
    relatedItems: [] as { key: string; title: string }[],
    questions: questions.map(
      ({ answers: _answers, explanation: _explanation, ...q }) => {
        void _answers;
        void _explanation;
        return q;
      },
    ),
  };
}
export type PublicKnowledge = ReturnType<typeof publicEntry>;
export function normalizeKnowledgeAnswer(value: string) {
  return value
    .normalize("NFC")
    .replace(/[.!?。！？,，]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
export function gradeKnowledge(
  entry: KnowledgeContent,
  answers: Record<string, string>,
) {
  return entry.questions.map((q) => ({
    id: q.id,
    correct: q.answers.some((a) =>
      q.type === "choice"
        ? a === answers[q.id]
        : normalizeKnowledgeAnswer(a) ===
          normalizeKnowledgeAnswer(answers[q.id] || ""),
    ),
    answer: q.answers.join(" / "),
    explanation: q.explanation,
  }));
}
export const knowledgeKey = z.string().regex(/^[a-z0-9-]{1,80}$/);
export const stateSchema = z
  .object({
    key: knowledgeKey,
    revision: z.number().int().positive(),
    version: z.number().int().nonnegative(),
    bookmarked: z.boolean(),
    note: z.string().max(6000),
    section: z.string().max(60),
    read: z.boolean(),
  })
  .strict();
