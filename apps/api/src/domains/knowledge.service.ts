import { z } from "zod";
import { listKnowledge, publicKnowledge } from "@everlang/backend/knowledge";
import { Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { queryParams } from '@everlang/backend/http';
import type { Viewer } from '@everlang/backend/http';
@Injectable()
export class KnowledgeService {
async get(r: Request, _u: Viewer) {
  const params = Object.fromEntries(queryParams(r));
  const b = z
    .object({
      language: z.literal("ko").default("ko"),
      key: z.string().optional(),
      q: z.string().max(120).default(""),
      kind: z.string().max(30).default(""),
      level: z.string().max(30).default(""),
      topic: z.string().max(120).default(""),
    })
    .parse(params);
  const result = b.key
    ? { item: await publicKnowledge(b.key) }
    : listKnowledge(b.q.trim(), b.kind, b.level, b.topic);
  return { ...(await result), language: b.language, ownership: "system" };

}
}
