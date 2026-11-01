import { z } from "zod";
import {
  catalogKey,
  catalogLearningBody,
} from "@everlang/contracts/vocabulary-catalog-contract";
import {
  catalogLearning,
  saveCatalogLearning,
  saveCatalogPreferences,
} from "@everlang/backend/catalog-learning";
import { Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { queryParams } from '@everlang/backend/http';
import type { Viewer } from '@everlang/backend/http';
@Injectable()
export class WordSetsLearnService {
async get(r: Request, u: Viewer) {
  const key = catalogKey.parse(queryParams(r).get("key"));
  const revision = queryParams(r).get("revision");
  return catalogLearning(
    u.id,
    key,
    revision ? z.coerce.number().int().positive().parse(revision) : undefined,
  );

}
async post(r: Request, u: Viewer) {return saveCatalogLearning(u.id, catalogLearningBody.parse(r.body));
}
async put(r: Request, u: Viewer) {
  const b = z
    .object({
      newPerDay: z.number().int().min(0).max(30),
      version: z.number().int().nonnegative(),
    })
    .strict()
    .parse(r.body);
  return saveCatalogPreferences(u.id, b.newPerDay, b.version);

}
}
