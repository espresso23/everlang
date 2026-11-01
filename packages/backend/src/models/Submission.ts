import mongoose, { Schema } from "mongoose";

const GrammarErrorSchema = new Schema({ error: String, correction: String, explanation: String }, { _id: false });
const VocabSuggestionSchema = new Schema({ original: String, suggested: String, reason: String }, { _id: false });
const RewriteSchema = new Schema({ style: String, text: String, explanation: String }, { _id: false });

const SubmissionSchema = new Schema({
  userId: { type: String, required: true, index: true },
  sentenceId: { type: Schema.Types.ObjectId, ref: "Sentence", required: true, index: true },
  userTranslation: { type: String, required: true, trim: true },
  score: { type: Number, min: 0, max: 100, required: true },
  accuracyRating: { type: String, enum: ["Excellent", "Good", "Needs Improvement", "Redo"], required: true },
  overallComment: { type: String, required: true },
  grammarErrors: { type: [GrammarErrorSchema], default: [] },
  vocabSuggestions: { type: [VocabSuggestionSchema], default: [] },
  advancedRewrites: { type: [RewriteSchema], validate: (items: unknown[]) => items.length === 3 },
  submittedAt: { type: Date, default: Date.now },
});

SubmissionSchema.index({ userId: 1, submittedAt: -1 });
export const Submission = mongoose.models.Submission || mongoose.model("Submission", SubmissionSchema);
