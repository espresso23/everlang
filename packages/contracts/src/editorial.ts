import { z } from "zod";
import { TOPICS, LEVELS } from "./types";

export const editorialQuerySchema = z.object({
  q: z.string().trim().max(200).default(""),
  status: z.enum(["", "draft", "reviewed", "published"]).default(""),
  level: z.string().max(100).default(""),
  topic: z.string().max(120).default(""),
  kind: z.string().max(40).default(""),
  sort: z.enum(["updated", "title"]).default("updated"),
  limit: z.coerce.number().int().refine(n => [25, 50, 100].includes(n)).default(25),
  offset: z.coerce.number().int().min(0).max(1000000).default(0),
});
export const sentenceEditorialSchema = z.object({
  topic: z.enum(TOPICS), level: z.enum(LEVELS),
  viText: z.string().trim().min(1).max(5000),
  koSampleAnswer: z.string().trim().min(1).max(5000),
  keyGrammar: z.array(z.string()).max(20), keyVocab: z.array(z.string()).max(30),
  source: z.string().trim().min(1).max(500), rights: z.string().trim().min(1).max(1000),
}).strict();
