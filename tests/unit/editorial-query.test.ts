import { describe, it, expect } from "vitest";
import { editorialQuerySchema, sentenceEditorialSchema } from "../../packages/contracts/src/editorial";

describe("editorial boundary", () => {
  it("defaults bounded pages and rejects invalid paging or status", () => {
    expect(editorialQuerySchema.parse({})).toMatchObject({ limit: 25, offset: 0, q: "", sort: "updated" });
    for (const query of [{ limit: 0 }, { limit: 200 }, { offset: -1 }, { offset: 1.5 }, { status: "all OR true" }, { sort: "SQL" }]) expect(editorialQuerySchema.safeParse(query).success).toBe(false);
    expect(editorialQuerySchema.parse({ limit: "100", offset: "200", q: "  느라고  " })).toMatchObject({ limit: 100, offset: 200, q: "느라고" });
  });
  it("does not allow imported student content to carry publication state", () => {
    expect(sentenceEditorialSchema.safeParse({ status: "published", reviewedBy: "someone" }).success).toBe(false);
  });
});
