import mongoose, { Schema } from "mongoose";
import { LEVELS, TOPICS, type Level, type Topic } from "@/lib/types";

export interface ISentence extends mongoose.Document {
  sourceId?: string;
  topic: Topic;
  level: Level;
  viText: string;
  koSampleAnswer: string;
  keyGrammar: string[];
  keyVocab: string[];
  isAiGenerated: boolean;
  createdAt: Date;
}

const SentenceSchema = new Schema<ISentence>({
  sourceId: { type: String, unique: true, sparse: true },
  topic: { type: String, enum: TOPICS, required: true, index: true },
  level: { type: String, enum: LEVELS, required: true, index: true },
  viText: { type: String, required: true, trim: true },
  koSampleAnswer: { type: String, required: true, trim: true },
  keyGrammar: { type: [String], default: [] },
  keyVocab: { type: [String], default: [] },
  isAiGenerated: { type: Boolean, default: false },
}, { timestamps: { createdAt: true, updatedAt: false } });

SentenceSchema.index({ topic: 1, level: 1, createdAt: -1 });
export const Sentence = mongoose.models.Sentence || mongoose.model<ISentence>("Sentence", SentenceSchema);
