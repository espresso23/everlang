import { z } from "zod";
import { api } from "@/lib/api";
import { catalogKey, catalogTopics } from "@/lib/vocabulary-catalog-contract";
import { listCatalog, catalogSetDetail } from "@/lib/vocabulary-catalog";

export const GET = api("/api/word-sets", async (r) => {
  const language = z.literal("ko").parse(r.nextUrl.searchParams.get("language") || "ko");
  const key = r.nextUrl.searchParams.get("key");
  if (key) {
    catalogKey.parse(key);
    const revision = r.nextUrl.searchParams.get("revision");
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
      kind: r.nextUrl.searchParams.get("kind") || "set",
      q: r.nextUrl.searchParams.get("q") || "",
      topic: r.nextUrl.searchParams.get("topic") || "",
      level: r.nextUrl.searchParams.get("level") || "",
      offset: r.nextUrl.searchParams.get("offset") || 0,
    });
  return {
    ...(await listCatalog(b.kind, b.q, b.topic, b.level, b.offset)),
    topics: catalogTopics,
    language,
    ownership: "system",
  };
});
