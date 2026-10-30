import mongoose, { Schema } from "mongoose";
const ExamSchema = new Schema(
  {
    title: { type: String, required: true },
    document: { type: Schema.Types.Mixed, required: true },
    published: { type: Boolean, default: false },
    version: { type: Number, default: 1 },
  },
  { timestamps: true },
);
export const ExamModel =
  mongoose.models.Exam || mongoose.model("Exam", ExamSchema);
