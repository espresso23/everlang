import mongoose, { Schema } from "mongoose";

const UserSentenceStateSchema = new Schema({
  userId: { type: String, required: true },
  sentenceId: { type: Schema.Types.ObjectId, ref: "Sentence", required: true },
  favorite: { type: Boolean, default: false },
}, { timestamps: true });

UserSentenceStateSchema.index({ userId: 1, sentenceId: 1 }, { unique: true });
export const UserSentenceState = mongoose.models.UserSentenceState || mongoose.model("UserSentenceState", UserSentenceStateSchema);
