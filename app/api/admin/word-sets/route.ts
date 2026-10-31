import { z } from "zod";
import { api, HttpError } from "@/lib/api";
import { connectDb } from "@/lib/db";
import { VocabularyCatalog } from "@/lib/models/VocabularyCatalog";
import {
  catalogContentSchema,
  catalogKey,
} from "@/lib/vocabulary-catalog-contract";
import { transitionCatalog } from "@/lib/vocabulary-catalog";
export const GET = api(
  "/api/admin/word-sets",
  async (r) => {
    await connectDb();
    const key = r.nextUrl.searchParams.get("key");
    if (key) {
      catalogKey.parse(key);
      const revision = z.coerce
        .number()
        .int()
        .positive()
        .parse(r.nextUrl.searchParams.get("revision"));
      const item = await VocabularyCatalog.findOne({ key, revision }).lean();
      if (!item) throw new HttpError(404, "Không tìm thấy phiên bản.");
      const references =
        item.content.kind === "set"
          ? await VocabularyCatalog.find({
              $or: item.content.senses.map((s) => ({
                key: s.key,
                revision: s.revision,
              })),
            })
              .select({
                _id: 0,
                key: 1,
                revision: 1,
                status: 1,
                "content.kind": 1,
                "content.term": 1,
                "content.meaning": 1,
              })
              .lean()
          : [];
      return {
        item,
        references: references.map((ref) => ({
          key: ref.key,
          revision: ref.revision,
          status: ref.status,
          title: ref.content.kind === "sense" ? ref.content.term : ref.key,
          meaning:
            ref.content.kind === "sense"
              ? ref.content.meaning
              : "Không phải nghĩa của từ",
        })),
      };
    }
    const offset = z.coerce
      .number()
      .int()
      .min(0)
      .max(20000)
      .parse(r.nextUrl.searchParams.get("offset") || 0);
    const kind = z
      .enum(["set", "sense"])
      .parse(r.nextUrl.searchParams.get("kind") || "sense");
    const filter = { "content.kind": kind };
    return {
      items: await VocabularyCatalog.find(filter)
        .sort({ updatedAt: -1, key: 1 })
        .skip(offset)
        .limit(50)
        .lean(),
      total: await VocabularyCatalog.countDocuments(filter),
      limit: 50,
      offset,
    };
  },
  true,
);
export const POST = api(
  "/api/admin/word-sets",
  async (r) => {
    const b = z
      .object({ key: catalogKey, content: catalogContentSchema })
      .strict()
      .parse(await r.json());
    await connectDb();
    await VocabularyCatalog.init();
    try {
      return {
        item: await VocabularyCatalog.create({
          ...b,
          revision: 1,
          editVersion: 1,
          status: "draft",
        }),
      };
    } catch (e) {
      if ((e as { code?: number }).code === 11000)
        throw new HttpError(
          409,
          "Mã đã tồn tại; chọn bản cũ để tạo revision mới.",
        );
      throw e;
    }
  },
  true,
);
export const PATCH = api(
  "/api/admin/word-sets",
  async (r, u) => {
    const b = z
      .object({
        key: catalogKey,
        revision: z.number().int().positive(),
        editVersion: z.number().int().positive(),
        action: z.enum(["edit", "review", "publish", "fork", "revise"]),
        content: catalogContentSchema.optional(),
        reviewConfirmed: z.boolean().optional(),
      })
      .strict()
      .parse(await r.json());
    return { item: await transitionCatalog(b, u.id) };
  },
  true,
);
