import { z } from "zod";
import { catalogKey, catalogTopics } from "@everlang/contracts/vocabulary-catalog-contract";
import { listCatalog, catalogSetDetail } from "@everlang/backend/vocabulary-catalog";
import { Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { queryParams } from '@everlang/backend/http';
import type { Viewer } from '@everlang/backend/http';
@Injectable()
export class WordSetsService {
async get(r: Request, _u: Viewer) {
  const language = z.literal("ko").parse(queryParams(r).get("language") || "ko");
  const key = queryParams(r).get("key");
  if (key) {
    catalogKey.parse(key);
    const revision = queryParams(r).get("revision");
    return { ...(await catalogSetDetail(
      key,
      revision ? z.coerce.number().int().positive().parse(revision) : undefined,
    )), language, ownership: "system" };
  }
  const b = z
    .object({
      kind: z.enum(["set", "sense"]),
      q: z.string().max(200),
      topic: z.string().max(80),
      level: z.string().max(30),
      offset: z.coerce.number().int().min(0).max(20000),
    })
    .parse({
      kind: queryParams(r).get("kind") || "set",
      q: queryParams(r).get("q") || "",
      topic: queryParams(r).get("topic") || "",
      level: queryParams(r).get("level") || "",
      offset: queryParams(r).get("offset") || 0,
    });
  return {
    ...(await listCatalog(b.kind, b.q, b.topic, b.level, b.offset)),
    topics: catalogTopics,
    language,
    ownership: "system",
  };

}
}
