import mongoose, { Schema } from "mongoose";
import type { CatalogRecord } from "@everlang/contracts/vocabulary-catalog-contract";
const schema = new Schema<CatalogRecord>(
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
  { timestamps: true, collection: "vocabulary_catalog" },
);
schema.index({ key: 1, revision: 1 }, { unique: true });
schema.index({ status: 1, "content.kind": 1, key: 1, revision: -1 });
export const VocabularyCatalog =
  (mongoose.models.VocabularyCatalog as mongoose.Model<CatalogRecord>) ||
  mongoose.model<CatalogRecord>("VocabularyCatalog", schema);
