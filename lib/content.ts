import { connectDb } from "./db";
import { Sentence } from "./models/Sentence";
import seed from "@/data/seed-sentences.json";
import { HttpError } from "./api";

async function initializeContent() {
  await connectDb();
  await Sentence.updateMany(
    { status: { $exists: false } },
    {
      $set: {
        status: "published",
        language: "ko",
        skill: "translation",
        contentVersion: 1,
        source: "Kho bài luyện dịch ban đầu",
        rights: "Rà soát trước khi phát hành công khai",
      },
    },
  );
  await Sentence.bulkWrite(
    seed.map((entry) => ({
      updateOne: {
        filter: { sourceId: entry.sourceId },
        update: {
          $setOnInsert: {
            ...entry,
            language: "ko",
            skill: "translation",
            contentVersion: 1,
            status: "published",
            source: "Kho bài luyện dịch ban đầu",
            rights: "Cần rà soát nguồn trước khi phát hành công khai",
          },
        },
        upsert: true,
      },
    })),
    { ordered: false },
  );
}
export async function publishedSentence(id: string) {
  if (!/^[a-f\d]{24}$/i.test(id))
    throw new HttpError(400, "Mã bài học không hợp lệ.");
  await connectDb();
  const item = await Sentence.findOne({ _id: id, status: "published" }).lean();
  if (!item) throw new HttpError(404, "Không tìm thấy bài học đã xuất bản.");
  return { ...item, _id: String(item._id) };
}

let contentReady: Promise<void> | undefined;
export function ensureContent() {
  return (contentReady ??= initializeContent().catch((e) => {
    contentReady = undefined;
    throw e;
  }));
}
