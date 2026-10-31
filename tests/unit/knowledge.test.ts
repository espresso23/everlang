import { describe, expect, it } from "vitest";
import {
  knowledgeSchema,
  publicEntry,
  gradeKnowledge,
  stateSchema,
  type KnowledgeEntry,
} from "../../lib/knowledge-contract";
import { knowledgeSeed } from "../../data/knowledge-seed";

describe("knowledge contracts and learner answer secrecy", () => {
  const entry = (): KnowledgeEntry => ({
    ...structuredClone(knowledgeSeed[0].content),
    key: "grammar-neurago",
    revision: 1,
    editVersion: 1,
    status: "published",
  });
  it("validates the entire editorial draft seed without pretending it is reviewed", () => {
    expect(new Set(knowledgeSeed.map((e) => e.key)).size).toBe(
      knowledgeSeed.length,
    );
    knowledgeSeed.forEach((e) =>
      expect(knowledgeSchema.safeParse(e.content).success, e.key).toBe(true),
    );
  });
  it("removes answer keys and explanations from learner payloads", () => {
    const publicVersion = publicEntry(entry());
    expect(publicVersion.questions).toHaveLength(1);
    expect(publicVersion.questions[0]).not.toHaveProperty("answers");
    expect(publicVersion.questions[0]).not.toHaveProperty("explanation");
    expect(publicVersion).not.toHaveProperty("reviewedBy");
  });
  it("rejects ambiguous answer keys, duplicate IDs and empty authored content", () => {
    const bad = structuredClone(knowledgeSeed[0].content);
    bad.questions[0].answers = ["not a choice"];
    expect(knowledgeSchema.safeParse(bad).success).toBe(false);
    const content = structuredClone(knowledgeSeed[0].content);
    content.sections[1].id = content.sections[0].id;
    expect(knowledgeSchema.safeParse(content).success).toBe(false);
    content.sections[1].id = "other";
    content.examples[0].ko = " ";
    expect(knowledgeSchema.safeParse(content).success).toBe(false);
  });
  it("grades cloze variants ignoring punctuation but keeps Korean word boundaries meaningful", () => {
    const content = entry();
    content.questions = [
      {
        id: "q",
        type: "cloze",
        prompt: "다시 써 보세요",
        options: [],
        answers: ["한국어를 공부해요"],
        explanation: "문장을 확인해 보세요.",
      },
    ];
    expect(
      gradeKnowledge(content, { q: "  한국어를   공부해요! " })[0].correct,
    ).toBe(true);
    expect(gradeKnowledge(content, { q: "한국어를공부해요" })[0].correct).toBe(
      false,
    );
    expect(gradeKnowledge(content, {})[0].correct).toBe(false);
  });
  it("does not accept a client-supplied identity or fake state version", () => {
    const state = {
      key: "entry",
      revision: 1,
      version: 0,
      bookmarked: true,
      note: "",
      section: "",
      read: false,
    };
    expect(stateSchema.safeParse(state).success).toBe(true);
    expect(stateSchema.safeParse({ ...state, user_id: "other" }).success).toBe(
      false,
    );
    expect(stateSchema.safeParse({ ...state, version: -1 }).success).toBe(
      false,
    );
  });
});
