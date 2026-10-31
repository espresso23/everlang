import type { PipelineStage } from "mongoose";
import { connectDb } from "./db";
import { HttpError } from "./api";
import { VocabularyCatalog } from "./models/VocabularyCatalog";
import {
  catalogKey,
  catalogContentSchema,
  catalogPublic,
  type CatalogRecord,
} from "./vocabulary-catalog-contract";

export async function getCatalog(key: string, revision?: number) {
  catalogKey.parse(key);
  await connectDb();
  const doc = await VocabularyCatalog.findOne({
    key,
    status: "published",
    ...(revision ? { revision } : {}),
  })
    .sort({ revision: -1 })
    .lean();
  if (!doc) throw new HttpError(404, "Không tìm thấy nội dung đã xuất bản.");
  return doc;
}
export async function catalogSetDetail(key: string, revision?: number) {
  const set = await getCatalog(key, revision);
  if (set.content.kind !== "set")
    throw new HttpError(404, "Không tìm thấy bộ từ.");
  const records = await VocabularyCatalog.find({
    status: "published",
    "content.kind": "sense",
    $or: set.content.senses.map((s) => ({ key: s.key, revision: s.revision })),
  }).lean();
  const byKey = new Map(records.map((s) => [s.key, s]));
  if (records.length !== set.content.senses.length)
    throw new HttpError(
      409,
      "Một mục trong bộ chưa khả dụng. Hãy thử lại sau.",
    );
  return {
    set: catalogPublic(set),
    senses: set.content.senses.map((s) => catalogPublic(byKey.get(s.key)!)),
  };
}
export async function listCatalog(
  kind: "set" | "sense",
  search: string,
  topic: string,
  level: string,
  offset: number,
) {
  await connectDb();
  const filters: Record<string, unknown>[] = [];
  if (topic) filters.push({ "content.topics": topic });
  if (level) filters.push({ "content.level": level });
  const lookup: PipelineStage[] = [];
  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (kind === "set")
      lookup.push({
        $lookup: {
          from: "vocabulary_catalog",
          localField: "content.senses.key",
          foreignField: "key",
          let: { refs: "$content.senses" },
          pipeline: [
            {
              $match: {
                status: "published",
                "content.kind": "sense",
                $expr: {
                  $in: [
                    { $concat: ["$key", ":", { $toString: "$revision" }] },
                    {
                      $map: {
                        input: "$$refs",
                        as: "ref",
                        in: {
                          $concat: [
                            "$$ref.key",
                            ":",
                            { $toString: "$$ref.revision" },
                          ],
                        },
                      },
                    },
                  ],
                },
              },
            },
            { $project: { "content.term": 1, "content.meaning": 1 } },
          ],
          as: "matchedSenses",
        },
      });
    filters.push({
      $or: ["title", "summary", "term", "meaning", "usage"]
        .map((k) => ({
          [`content.${k}`]: { $regex: escaped, $options: "i" },
        }))
        .concat(
          kind === "set"
            ? ["term", "meaning"].map((k) => ({
                [`matchedSenses.content.${k}`]: {
                  $regex: escaped,
                  $options: "i",
                },
              }))
            : [],
        ),
    });
  }
  const [result] = await VocabularyCatalog.aggregate([
    { $match: { status: "published", "content.kind": kind } },
    { $sort: { revision: -1 } },
    { $group: { _id: "$key", item: { $first: "$$ROOT" } } },
    { $replaceRoot: { newRoot: "$item" } },
    ...lookup,
    ...(filters.length ? [{ $match: { $and: filters } }] : []),
    { $sort: { key: 1 } },
    {
      $facet: {
        total: [{ $count: "count" }],
        items: [
          { $skip: offset },
          { $limit: 30 },
          {
            $project: {
              _id: 0,
              key: 1,
              revision: 1,
              title: { $ifNull: ["$content.title", "$content.term"] },
              meaning: "$content.meaning",
              summary: "$content.summary",
              level: "$content.level",
              topics: "$content.topics",
              count: { $size: { $ifNull: ["$content.senses", []] } },
            },
          },
        ],
      },
    },
  ]).option({ maxTimeMS: 5000 });
  return {
    items: result.items,
    total: result.total[0]?.count || 0,
    offset,
    limit: 30,
  };
}
export async function transitionCatalog(
  input: {
    key: string;
    revision: number;
    editVersion: number;
    action: "edit" | "review" | "publish" | "fork" | "revise";
    content?: CatalogRecord["content"];
    reviewConfirmed?: boolean;
  },
  userId: string,
) {
  if (input.content && input.action !== "edit")
    throw new HttpError(
      400,
      "Chỉ gửi nội dung khi sửa bản nháp; duyệt/xuất bản dùng đúng bản đang lưu.",
    );
  await connectDb();
  await VocabularyCatalog.init();
  const filter = {
    key: input.key,
    revision: input.revision,
    editVersion: input.editVersion,
  };
  const current = await VocabularyCatalog.findOne(filter).lean();
  if (!current) throw new HttpError(409, "Nội dung đã đổi. Hãy tải lại.");
  if (input.action === "fork") {
    const latest = await VocabularyCatalog.findOne({ key: input.key })
      .sort({ revision: -1 })
      .lean();
    if (current.status !== "published" || latest?.revision !== current.revision)
      throw new HttpError(
        409,
        "Chỉ tạo revision từ bản published mới nhất khi chưa có nháp mới.",
      );
    try {
      return await VocabularyCatalog.create({
        key: current.key,
        revision: current.revision + 1,
        editVersion: 1,
        status: "draft",
        content: current.content,
      });
    } catch (e) {
      if ((e as { code?: number }).code === 11000)
        throw new HttpError(409, "Đã có bản nháp mới.");
      throw e;
    }
  }
  if (input.action === "edit" && (current.status !== "draft" || !input.content))
    throw new HttpError(400, "Chỉ sửa bản nháp.");
  if (input.content && input.content.kind !== current.content.kind)
    throw new HttpError(400, "Không đổi loại nội dung của một mã đã tạo.");
  if (
    input.action === "review" &&
    (current.status !== "draft" || !input.reviewConfirmed)
  )
    throw new HttpError(400, "Cần xác nhận đã kiểm nội dung và quyền sử dụng.");
  if (input.action === "revise" && current.status !== "reviewed")
    throw new HttpError(400, "Chỉ trả bản đã duyệt về nháp.");
  if (
    input.action === "publish" &&
    (current.status !== "reviewed" || !current.reviewedBy)
  )
    throw new HttpError(400, "Cần người duyệt xác nhận trước khi xuất bản.");
  const content = catalogContentSchema.parse(input.content || current.content);
  if (["review", "publish"].includes(input.action) && content.kind === "set") {
    const count = await VocabularyCatalog.countDocuments({
      status: "published",
      "content.kind": "sense",
      $or: content.senses.map((s) => ({ key: s.key, revision: s.revision })),
    });
    if (count !== content.senses.length)
      throw new HttpError(
        400,
        "Mọi nghĩa trong bộ phải là revision đã xuất bản.",
      );
  }
  const changes =
    input.action === "edit"
      ? { content }
      : input.action === "review"
        ? { status: "reviewed", reviewedBy: userId }
        : input.action === "revise"
          ? { status: "draft" }
          : { status: "published" };
  const item = await VocabularyCatalog.findOneAndUpdate(
    { ...filter, status: current.status },
    {
      $set: changes,
      $inc: { editVersion: 1 },
      ...(input.action === "revise" ? { $unset: { reviewedBy: "" } } : {}),
    },
    { new: true },
  ).lean();
  if (!item) throw new HttpError(409, "Có thay đổi đồng thời. Hãy tải lại.");
  return item;
}
