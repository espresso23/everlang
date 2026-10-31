import { z } from "zod";
import { api } from "@/lib/api";
import { listKnowledge, publicKnowledge } from "@/lib/knowledge";

export const GET = api("/api/knowledge", async (r) => {
  const params = Object.fromEntries(r.nextUrl.searchParams);
  const b = z
    .object({
      key: z.string().optional(),
      q: z.string().max(120).default(""),
      kind: z.string().max(30).default(""),
      level: z.string().max(30).default(""),
      topic: z.string().max(120).default(""),
    })
    .parse(params);
  return b.key
    ? { item: await publicKnowledge(b.key) }
    : listKnowledge(b.q.trim(), b.kind, b.level, b.topic);
});
