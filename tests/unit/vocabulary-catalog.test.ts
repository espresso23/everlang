import { describe, expect, it } from "vitest";
import {
  catalogContentSchema,
  catalogRecallContext,
  type CatalogSnapshot,
  catalogPublic,
  catalogLearningBody,
  catalogTopics,
  CATALOG_TAXONOMY_VERSION,
  type CatalogRecord,
} from "../../lib/vocabulary-catalog-contract";
import { catalogDay } from "../../lib/catalog-learning";
import { vocabularyDrafts } from "../../data/vocabulary-drafts";
const base = {
  language: "ko",
  skill: "vocabulary",
  taxonomyVersion: CATALOG_TAXONOMY_VERSION,
  level: "Trung cấp",
  topics: ["food"],
  source: "QA original",
  rights: "QA only",
};
describe("vocabulary catalog content and learning boundaries", () => {
  it("does not reveal generated Vietnamese context before recall and keeps private customized context", () => {
    const snapshot = {
      key: "qa",
      revision: 1,
      content: { examples: [{ ko: "배를 먹어요.", vi: "Tôi ăn lê." }] },
    } as CatalogSnapshot;
    expect(catalogRecallContext("배를 먹어요.\nTôi ăn lê.", snapshot)).toBe(
      "배를 먹어요.",
    );
    expect(catalogRecallContext("배를 먹어요.", snapshot, true)).toContain(
      "Tôi ăn lê.",
    );
    expect(catalogRecallContext("My personal clue", snapshot)).toBe(
      "My personal clue",
    );
    expect(catalogRecallContext("Legacy context", null)).toBe("Legacy context");
  });

  it("accepts complete sense content, rejects unknown topics and incomplete examples", () => {
    const input = {
      ...base,
      kind: "sense",
      term: "배",
      pos: "Danh từ",
      meaning: "quả lê",
      register: "Trung tính",
      collocations: [],
      examples: [{ ko: "배를 먹어요.", vi: "Tôi ăn lê." }],
    };
    expect(catalogContentSchema.safeParse(input).success).toBe(true);
    expect(
      catalogContentSchema.safeParse({ ...input, topics: ["unknown"] }).success,
    ).toBe(false);
    expect(
      catalogContentSchema.safeParse({
        ...input,
        examples: [{ ko: "배", vi: "" }],
      }).success,
    ).toBe(false);
    expect(
      catalogContentSchema.safeParse({ ...input, reviewedBy: "self" }).success,
    ).toBe(false);
  });
  it("pins unique senses to revisions, rather than overwriting homographs or accepting duplicate set membership", () => {
    const set = {
      ...base,
      kind: "set",
      title: "Food",
      summary: "QA",
      senses: [
        { key: "bae-pear", revision: 1 },
        { key: "bae-boat", revision: 2 },
      ],
    };
    expect(catalogContentSchema.safeParse(set).success).toBe(true);
    expect(
      catalogContentSchema.safeParse({
        ...set,
        senses: [set.senses[0], set.senses[0]],
      }).success,
    ).toBe(false);
    expect(
      catalogContentSchema.safeParse({
        ...set,
        senses: [{ key: "bae-pear", revision: 0 }],
      }).success,
    ).toBe(false);
    expect(catalogContentSchema.safeParse({ ...set, senses: [] }).success).toBe(
      false,
    );
  });
  it("does not expose reviewer identity and enforces explicit paired legacy-card mapping", () => {
    const publicItem = catalogPublic({
      key: "qa",
      revision: 1,
      reviewedBy: "private",
      editVersion: 2,
      status: "published",
      content: {
        ...base,
        kind: "set",
        title: "QA",
        summary: "QA",
        senses: [{ key: "bae-pear", revision: 1 }],
      },
    } as CatalogRecord);
    expect(publicItem).not.toHaveProperty("reviewedBy");
    const b = {
      setKey: "qa",
      setRevision: 1,
      senseKey: "bae-pear",
      senseRevision: 1,
      action: "save",
      version: 0,
    };
    expect(catalogLearningBody.safeParse(b).success).toBe(true);
    expect(
      catalogLearningBody.safeParse({
        ...b,
        userId: "other",
        meaning: "spoofed",
      }).success,
    ).toBe(false);
    expect(
      catalogLearningBody.safeParse({
        ...b,
        attachCardId: "00000000-0000-4000-8000-000000000001",
      }).success,
    ).toBe(false);
    expect(
      catalogLearningBody.safeParse({
        ...b,
        action: "known",
        attachCardId: "00000000-0000-4000-8000-000000000001",
        attachVersion: 1,
      }).success,
    ).toBe(false);
  });
  it("computes the learner's local day across midnight and DST boundaries", () => {
    expect(
      catalogDay(new Date("2026-10-31T17:00:00Z"), "Asia/Ho_Chi_Minh"),
    ).toBe("2026-11-01");
    expect(
      catalogDay(new Date("2026-10-31T16:59:59Z"), "Asia/Ho_Chi_Minh"),
    ).toBe("2026-10-31");
    expect(
      catalogDay(new Date("2026-11-01T05:30:00Z"), "America/New_York"),
    ).toBe("2026-11-01");
    expect(
      catalogDay(new Date("2026-11-01T06:30:00Z"), "America/New_York"),
    ).toBe("2026-11-01");
  });
  it("keeps seed identities unique and references real taxonomy nodes without pretending drafts are reviewed", () => {
    expect(new Set(vocabularyDrafts.map((x) => x[0])).size).toBe(
      vocabularyDrafts.length,
    );
    for (const [, term, meaning, topic, , , examples] of vocabularyDrafts) {
      expect(term.trim()).not.toBe("");
      expect(meaning.trim()).not.toBe("");
      expect(catalogTopics.some((t) => t.id === topic)).toBe(true);
      expect(examples.length).toBeGreaterThan(0);
    }
    expect(vocabularyDrafts.filter((x) => x[1] === "배")).toHaveLength(3);
  });
});
