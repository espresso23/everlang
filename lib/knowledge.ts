import { connectDb } from "./db";
import { Knowledge } from "./models/Knowledge";
import { HttpError } from "./api";
import {
  knowledgeKey,
  publicEntry,
  type KnowledgeEntry,
} from "./knowledge-contract";

export async function getKnowledge(key: string, revision?: number) {
  knowledgeKey.parse(key);
  await connectDb();
  const doc = await Knowledge.findOne({
    key,
    status: "published",
    ...(revision ? { revision } : {}),
  })
    .sort({ revision: -1 })
    .lean();
  if (!doc) throw new HttpError(404, "Không tìm thấy tài liệu đã xuất bản.");
  return {
    ...doc.content,
    key: doc.key,
    revision: doc.revision,
    editVersion: doc.editVersion,
    status: doc.status,
  } as KnowledgeEntry;
}
export async function listKnowledge(
  search: string,
  kind: string,
  level: string,
  topic: string,
) {
  await connectDb();
  // Group before filtering so a previous revision never resurfaces on a search.
  const clauses: Record<string, unknown>[] = [];
  if (kind) clauses.push({ "content.kind": kind });
  if (level) clauses.push({ "content.level": level });
  if (topic) clauses.push({ "content.topic": topic });
  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const aliases: Record<string, string> = {
      idiom: "idiom",
      "quán dụng ngữ": "idiom",
      "tục ngữ": "proverb",
      "ngữ pháp": "grammar",
    };
    clauses.push({
      $or: [
        ...["title", "summary", "topic"].map((field) => ({
          [`content.${field}`]: { $regex: escaped, $options: "i" },
        })),
        ...(aliases[search.toLowerCase()]
          ? [{ "content.kind": aliases[search.toLowerCase()] }]
          : []),
      ],
    });
  }
  const items = await Knowledge.aggregate([
    { $match: { status: "published" } },
    { $sort: { revision: -1 } },
    { $group: { _id: "$key", latest: { $first: "$$ROOT" } } },
    { $replaceRoot: { newRoot: "$latest" } },
    ...(clauses.length ? [{ $match: { $and: clauses } }] : []),
    { $sort: { "content.title": 1, key: 1 } },
    { $limit: 100 },
    {
      $project: {
        _id: 0,
        key: 1,
        revision: 1,
        title: "$content.title",
        kind: "$content.kind",
        level: "$content.level",
        topic: "$content.topic",
        summary: "$content.summary",
      },
    },
  ]);
  return { items, limit: 100 };
}
export async function publicKnowledge(key: string) {
  const item = publicEntry(await getKnowledge(key));
  return { ...item, relatedItems: await knowledgeTitles(item.related) };
}
export async function knowledgeTitles(keys: string[]) {
  if (!keys.length) return [];
  await connectDb();
  return Knowledge.aggregate<{ key: string; title: string }>([
    { $match: { status: "published", key: { $in: keys } } },
    { $sort: { revision: -1 } },
    { $group: { _id: "$key", latest: { $first: "$$ROOT" } } },
    {
      $project: { _id: 0, key: "$latest.key", title: "$latest.content.title" },
    },
  ]);
}
