import mongoose from "mongoose";
import { connectDb } from "@everlang/backend/db";
import { VocabularyCatalog } from "@everlang/backend/models/VocabularyCatalog";
import {
  catalogContentSchema,
  catalogTopics,
  CATALOG_TAXONOMY_VERSION,
  type CatalogContent,
} from "@everlang/contracts/vocabulary-catalog-contract";
import { vocabularyDrafts } from "../data/vocabulary-drafts";
await connectDb();
await VocabularyCatalog.init();
const common = {
  language: "ko" as const,
  skill: "vocabulary" as const,
  taxonomyVersion: CATALOG_TAXONOMY_VERSION,
  level: "Trung cấp" as const,
  source: "EverLang · bản nháp tự biên soạn có hỗ trợ AI",
  rights:
    "Ví dụ do dự án tự biên soạn, không sao chép từ website khác; người duyệt phải kiểm nội dung và quyền trước xuất bản.",
};
const entries: { key: string; content: CatalogContent }[] =
  vocabularyDrafts.map(([key, term, meaning, topic, ko, vi, examples]) => ({
    key,
    content: catalogContentSchema.parse({
      ...common,
      kind: "sense",
      term,
      meaning,
      topics: [topic],
      pos: key === "seounhada-disappointed" ? "Tính từ" : "Danh từ",
      register: "Trung tính",
      pronunciation: "",
      hanja: "",
      usage: key.startsWith("bae-")
        ? "Một nghĩa riêng của từ đồng tự 배; không gộp với các nghĩa còn lại khi ôn tập."
        : "Kiểm lại ngữ cảnh và sắc thái với người duyệt trước khi xuất bản.",
      collocations: [{ ko, vi }],
      examples: examples.map(([ko, vi]) => ({ ko, vi })),
    }),
  }));
for (const topic of catalogTopics) {
  const senses = entries
    .filter(
      (e) => e.content.kind === "sense" && e.content.topics.includes(topic.id),
    )
    .map((e) => ({ key: e.key, revision: 1 }));
  if (senses.length)
    entries.push({
      key: `topic-${topic.id}`,
      content: catalogContentSchema.parse({
        ...common,
        kind: "set",
        topics: [topic.id],
        title: `${topic.label} · bản khởi đầu`,
        summary: `Các nghĩa và câu trong nhóm ${topic.group.toLowerCase()}. Đây là bộ nháp khởi đầu, chưa phải coverage đầy đủ hoặc bảng tần suất đã kiểm chứng.`,
        senses,
      }),
    });
}
// Cross-set reference demonstrates one stable sense, not duplicated content.
entries.push({
  key: "life-shopping-context",
  content: catalogContentSchema.parse({
    ...common,
    kind: "set",
    topics: ["shopping", "food"],
    title: "Đi chợ và yêu cầu dịch vụ",
    summary:
      "Một số từ đặt trong tình huống mua hàng. Các nghĩa dùng chung với bộ khác; lịch ôn không nhân đôi.",
    senses: ["bae-pear", "hwanbul-refund", "sikjaeryo-ingredients"].map(
      (key) => ({ key, revision: 1 }),
    ),
  }),
});
let inserted = 0;
for (const entry of entries) {
  const result = await VocabularyCatalog.updateOne(
    { key: entry.key, revision: 1 },
    {
      $setOnInsert: {
        ...entry,
        revision: 1,
        editVersion: 1,
        status: "draft",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    },
    { upsert: true, timestamps: false },
  );
  inserted += result.upsertedCount;
}
console.log(
  JSON.stringify({
    inserted,
    requested: entries.length,
    mode: "draft-only; human review required",
    senses: vocabularyDrafts.length,
  }),
);
await mongoose.disconnect();
