export const TOPICS = [
  "Kinh tế",
  "Xã hội",
  "Công nghệ",
  "Môi trường",
  "Giáo dục",
  "Thời sự",
  "Đời sống",
] as const;

export const LEVELS = ["TOPIK 4", "TOPIK 5", "TOPIK 6"] as const;
export type Topic = (typeof TOPICS)[number];
export type Level = (typeof LEVELS)[number];
export type Sentence = {
  _id: string;
  topic: Topic;
  level: Level;
  viText: string;
  koSampleAnswer: string;
  keyGrammar: string[];
  keyVocab: string[];
  isAiGenerated: boolean;
};
export type GradeReport = {
  score: number;
  accuracyRating: "Excellent" | "Good" | "Needs Improvement" | "Redo";
  overallComment: string;
  grammarErrors: { error: string; correction: string; explanation: string }[];
  vocabSuggestions: { original: string; suggested: string; reason: string }[];
  advancedRewrites: { style: string; text: string; explanation: string }[];
};
