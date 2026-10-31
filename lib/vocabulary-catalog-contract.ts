import { z } from "zod";

export const CATALOG_TAXONOMY_VERSION = "ko-topics-v1";
export const catalogTopics = [
  { id: "food", group: "Đời sống", label: "Ăn uống" },
  { id: "home", group: "Đời sống", label: "Nhà ở & sinh hoạt" },
  { id: "transport", group: "Đời sống", label: "Đi lại" },
  { id: "shopping", group: "Đời sống", label: "Mua sắm & dịch vụ" },
  { id: "health", group: "Đời sống", label: "Sức khỏe" },
  { id: "relationships", group: "Đời sống", label: "Quan hệ & cảm xúc" },
  { id: "administration", group: "Đời sống", label: "Thủ tục & hành chính" },
  { id: "school", group: "Học tập & xã hội", label: "Trường học" },
  { id: "media", group: "Học tập & xã hội", label: "Truyền thông" },
  { id: "environment", group: "Học tập & xã hội", label: "Môi trường" },
  { id: "society", group: "Học tập & xã hội", label: "Xã hội & văn hóa" },
  { id: "email", group: "Công việc", label: "Email & liên lạc" },
  { id: "meetings", group: "Công việc", label: "Họp & báo cáo" },
  { id: "recruitment", group: "Công việc", label: "Tuyển dụng" },
  { id: "it", group: "Chuyên ngành", label: "Công nghệ thông tin" },
  { id: "business", group: "Chuyên ngành", label: "Kinh doanh & marketing" },
  { id: "finance", group: "Chuyên ngành", label: "Tài chính & kế toán" },
  { id: "manufacturing", group: "Chuyên ngành", label: "Sản xuất" },
  { id: "logistics", group: "Chuyên ngành", label: "Logistics" },
  { id: "tourism", group: "Chuyên ngành", label: "Du lịch & khách sạn" },
  { id: "medicine", group: "Chuyên ngành", label: "Y tế" },
  { id: "law", group: "Chuyên ngành", label: "Pháp lý" },
] as const;
export const catalogKey = z.string().regex(/^[a-z0-9-]{1,80}$/);
const text = z.string().trim().min(1).max(1000);
const bilingual = z.object({ ko: text, vi: text }).strict();
const base = {
  language: z.literal("ko"),
  skill: z.literal("vocabulary"),
  taxonomyVersion: z.literal(CATALOG_TAXONOMY_VERSION),
  level: z.enum(["Sơ cấp", "Trung cấp", "Cao cấp"]),
  topics: z
    .array(
      z
        .string()
        .refine(
          (id) => catalogTopics.some((t) => t.id === id),
          "Chủ đề không hợp lệ",
        ),
    )
    .min(1)
    .max(4)
    .refine((a) => new Set(a).size === a.length, "Chủ đề trùng"),
  source: z.string().trim().min(1).max(1000),
  rights: z.string().trim().min(1).max(1000),
};
export const senseSchema = z
  .object({
    ...base,
    kind: z.literal("sense"),
    term: z.string().trim().min(1).max(200),
    pos: z.enum([
      "Danh từ",
      "Động từ",
      "Tính từ",
      "Trạng từ",
      "Cụm từ",
      "Khác",
    ]),
    meaning: text,
    pronunciation: z.string().trim().max(200).default(""),
    hanja: z.string().trim().max(100).default(""),
    register: z.enum(["Trung tính", "Trang trọng", "Thân mật"]),
    usage: z.string().trim().max(2000).default(""),
    collocations: z.array(bilingual).max(8),
    examples: z.array(bilingual).min(1).max(6),
  })
  .strict();
export const setSchema = z
  .object({
    ...base,
    kind: z.literal("set"),
    title: z.string().trim().min(1).max(200),
    summary: text,
    senses: z
      .array(
        z
          .object({ key: catalogKey, revision: z.number().int().positive() })
          .strict(),
      )
      .min(1)
      .max(100)
      .refine(
        (a) => new Set(a.map((x) => x.key)).size === a.length,
        "Một nghĩa chỉ xuất hiện một lần trong bộ",
      ),
  })
  .strict();
export const catalogContentSchema = z.discriminatedUnion("kind", [
  senseSchema,
  setSchema,
]);
export type SenseContent = z.infer<typeof senseSchema>;
export type SetContent = z.infer<typeof setSchema>;
export type CatalogContent = z.infer<typeof catalogContentSchema>;
export type CatalogRecord = {
  key: string;
  revision: number;
  editVersion: number;
  status: "draft" | "reviewed" | "published";
  content: CatalogContent;
  reviewedBy?: string;
};
export function catalogPublic(item: CatalogRecord) {
  return { key: item.key, revision: item.revision, content: item.content };
}
export type PublicCatalog = ReturnType<typeof catalogPublic>;
export type CatalogSnapshot = {
  key: string;
  revision: number;
  content: SenseContent;
};
export function catalogRecallContext(
  context: string,
  snapshot?: CatalogSnapshot | null,
  revealed = false,
) {
  const example = snapshot?.content?.examples?.[0];
  if (
    !example ||
    (context !== example.ko && context !== `${example.ko}\n${example.vi}`)
  )
    return context;
  return revealed ? `${example.ko}\n${example.vi}` : example.ko;
}
export const catalogLearningBody = z
  .object({
    setKey: catalogKey,
    setRevision: z.number().int().positive(),
    senseKey: catalogKey,
    senseRevision: z.number().int().positive(),
    action: z.enum(["save", "known", "skipped", "reset"]),
    version: z.number().int().nonnegative(),
    attachCardId: z.string().uuid().optional(),
    attachVersion: z.number().int().positive().optional(),
  })
  .strict()
  .refine(
    (b) =>
      Boolean(b.attachCardId) === Boolean(b.attachVersion) &&
      (!b.attachCardId || b.action === "save"),
    "Liên kết thẻ cần ID/version và hành động lưu",
  );
