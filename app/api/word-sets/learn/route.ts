import { z } from "zod";
import { api } from "@/lib/api";
import {
  catalogKey,
  catalogLearningBody,
} from "@/lib/vocabulary-catalog-contract";
import {
  catalogLearning,
  saveCatalogLearning,
  saveCatalogPreferences,
} from "@/lib/catalog-learning";
export const GET = api("/api/word-sets/learn", async (r, u) => {
  const key = catalogKey.parse(r.nextUrl.searchParams.get("key"));
  const revision = r.nextUrl.searchParams.get("revision");
  return catalogLearning(
    u.id,
    key,
    revision ? z.coerce.number().int().positive().parse(revision) : undefined,
  );
});
export const POST = api("/api/word-sets/learn", async (r, u) =>
  saveCatalogLearning(u.id, catalogLearningBody.parse(await r.json())),
);
export const PUT = api("/api/word-sets/learn", async (r, u) => {
  const b = z
    .object({
      newPerDay: z.number().int().min(0).max(30),
      version: z.number().int().nonnegative(),
    })
    .strict()
    .parse(await r.json());
  return saveCatalogPreferences(u.id, b.newPerDay, b.version);
});
