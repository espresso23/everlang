import mongoose, { Schema } from "mongoose";
import type { KnowledgeContent } from "@everlang/contracts/knowledge-contract";

interface KnowledgeDocument {
  key: string;
  revision: number;
  editVersion: number;
  status: "draft" | "reviewed" | "published";
  content: KnowledgeContent;
  reviewedBy?: string;
}
const schema = new Schema<KnowledgeDocument>(
  {
    key: { type: String, required: true },
    revision: { type: Number, required: true },
    editVersion: { type: Number, default: 1 },
    status: {
      type: String,
      enum: ["draft", "reviewed", "published"],
      default: "draft",
    },
    content: { type: Schema.Types.Mixed, required: true },
    reviewedBy: String,
  },
  { timestamps: true, collection: "knowledge_entries" },
);
schema.index({ key: 1, revision: 1 }, { unique: true });
schema.index({ status: 1, key: 1, revision: -1 });
export const Knowledge =
  (mongoose.models.Knowledge as mongoose.Model<KnowledgeDocument>) ||
  mongoose.model<KnowledgeDocument>("Knowledge", schema);
