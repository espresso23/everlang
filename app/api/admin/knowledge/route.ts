import { z } from "zod";
import { api, HttpError } from "@/lib/api";
import { connectDb } from "@/lib/db";
import { Knowledge } from "@/lib/models/Knowledge";
import { knowledgeKey, knowledgeSchema } from "@/lib/knowledge-contract";

export const GET = api(
  "/api/admin/knowledge",
  async () => {
    await connectDb();
    return {
      items: await Knowledge.find().sort({ updatedAt: -1 }).limit(200).lean(),
    };
  },
  true,
);
export const POST = api(
  "/api/admin/knowledge",
  async (r) => {
    const b = z
      .object({ key: knowledgeKey, content: knowledgeSchema })
      .strict()
      .parse(await r.json());
    await connectDb();
    await Knowledge.init();
    try {
      return {
        item: await Knowledge.create({
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
          "Mã tài liệu đã tồn tại. Hãy tạo phiên bản mới.",
        );
      throw e;
    }
  },
  true,
);
export const PATCH = api(
  "/api/admin/knowledge",
  async (r, u) => {
    const b = z
      .object({
        key: knowledgeKey,
        revision: z.number().int().positive(),
        editVersion: z.number().int().positive(),
        action: z.enum(["edit", "review", "publish", "fork", "revise"]),
        content: knowledgeSchema.optional(),
      })
      .strict()
      .parse(await r.json());
    await connectDb();
    const filter = {
      key: b.key,
      revision: b.revision,
      editVersion: b.editVersion,
    };
    const current = await Knowledge.findOne(filter).lean();
    if (!current) throw new HttpError(409, "Tài liệu đã đổi. Hãy tải lại.");
    if (b.action === "fork") {
      if (current.status !== "published")
        throw new HttpError(400, "Chỉ tạo revision mới từ bản đã xuất bản.");
      const latest = await Knowledge.findOne({ key: b.key })
        .sort({ revision: -1 })
        .lean();
      if (latest?.revision !== b.revision)
        throw new HttpError(409, "Đã có phiên bản mới hơn.");
      try {
        return {
          item: await Knowledge.create({
            key: b.key,
            revision: b.revision + 1,
            editVersion: 1,
            status: "draft",
            content: current.content,
          }),
        };
      } catch (e) {
        if ((e as { code?: number }).code === 11000)
          throw new HttpError(409, "Đã có bản nháp mới.");
        throw e;
      }
    }
    if (b.action === "edit" && (current.status !== "draft" || !b.content))
      throw new HttpError(400, "Chỉ sửa nội dung bản nháp.");
    if (b.action === "review" && current.status !== "draft")
      throw new HttpError(400, "Chỉ duyệt từ bản nháp.");
    if (b.action === "revise" && current.status !== "reviewed")
      throw new HttpError(400, "Chỉ trả bản đã duyệt chưa xuất bản về nháp.");
    if (
      b.action === "publish" &&
      (current.status !== "reviewed" || !current.reviewedBy)
    )
      throw new HttpError(400, "Cần người duyệt xác nhận trước khi xuất bản.");
    if (b.action === "publish") {
      const refs = [...new Set(current.content.related)];
      const published = await Knowledge.distinct("key", {
        key: { $in: refs },
        status: "published",
      });
      if (refs.includes(b.key) || published.length !== refs.length)
        throw new HttpError(
          400,
          "Tài liệu liên quan phải đã xuất bản và không trỏ về chính bài này. Trả về nháp để sửa liên kết.",
        );
    }
    knowledgeSchema.parse(b.content || current.content);
    const changes =
      b.action === "edit"
        ? { content: b.content }
        : b.action === "review"
          ? { status: "reviewed", reviewedBy: u.id }
          : b.action === "revise"
            ? { status: "draft" }
            : { status: "published" };
    const item = await Knowledge.findOneAndUpdate(
      { ...filter, status: current.status },
      {
        $set: changes,
        $inc: { editVersion: 1 },
        ...(b.action === "revise" ? { $unset: { reviewedBy: "" } } : {}),
      },
      { new: true },
    ).lean();
    if (!item) throw new HttpError(409, "Có thay đổi đồng thời. Hãy tải lại.");
    return { item };
  },
  true,
);
