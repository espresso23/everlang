import { redis } from "@everlang/backend/redis";
import { XMLParser } from "fast-xml-parser";
import { logError } from "@everlang/backend/logger";
type XmlNode = Record<string, unknown>;
type EntryPart = "word" | "ip";
const parser = new XMLParser({
  ignoreAttributes: false,
  trimValues: true,
  processEntities: true,
});
function asArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}
function text(value: unknown): string {
  if (typeof value === "string" || typeof value === "number")
    return String(value).trim();
  if (value && typeof value === "object" && "#text" in value)
    return text((value as { "#text": unknown })["#text"]);
  return "";
}
async function handleGet(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (!query || query.length > 48 || !/[가-힣ㄱ-ㅎㅏ-ㅣ]/u.test(query)) {
    return HttpResult.json(
      { error: "검색어 tiếng Hàn không hợp lệ." },
      { status: 400 },
    );
  }

  const cached = await redis.get(`dictionary:ko:vi:${query}`).catch(() => null);
  if (cached) return HttpResult.json(JSON.parse(cached));
  const key = process.env.KRDICT_API_KEY?.trim();
  if (!key) return HttpResult.json({ configured: false, items: [] });
  const dictionaryKey = key;

  try {
    async function search(term: string, part: EntryPart) {
      const url = new URL("https://krdict.korean.go.kr/api/search");
      url.search = new URLSearchParams({
        key: dictionaryKey,
        q: term,
        part,
        sort: "popular",
        start: "1",
        num: "10",
        translated: "y",
        trans_lang: "7",
      }).toString();
      const response = await fetch(url, {
        signal: AbortSignal.timeout(8000),
      });
      if (!response.ok) throw new Error(`KRdict returned ${response.status}`);
      const xml = await response.text();
      const parsed = parser.parse(xml) as { channel?: XmlNode };
      if (!parsed.channel) throw new Error("Invalid KRdict response");
      return asArray(parsed.channel.item as XmlNode | XmlNode[] | undefined)
        .map((item) => {
          const senses = asArray(item.sense as XmlNode | XmlNode[] | undefined)
            .map((sense) => ({
              definition: text(sense.definition),
              translations: asArray(
                sense.translation as XmlNode | XmlNode[] | undefined,
              )
                .map((translation) => ({
                  word: text(translation.trans_word),
                  definition: text(translation.trans_dfn),
                }))
                .filter(
                  (translation) => translation.word || translation.definition,
                ),
            }))
            .filter((sense) => sense.definition || sense.translations.length);
          const link = text(item.link);
          return {
            id: text(item.target_code) || `${part}:${text(item.word)}`,
            word: text(item.word),
            pronunciation: text(item.pronunciation),
            pos: text(item.pos),
            level: text(item.word_grade),
            entryType: part === "ip" ? ("idiom" as const) : ("word" as const),
            link: link.startsWith("https://krdict.korean.go.kr/")
              ? link
              : "https://krdict.korean.go.kr/",
            senses,
          };
        })
        .filter((item) => item.word);
    }

    const exactItems = (
      await Promise.all([search(query, "word"), search(query, "ip")])
    ).flat();
    let items = exactItems;
    if (!items.length) {
      const tokens = query.split(/\s+/u).filter(Boolean);
      const particles = [
        "으로부터",
        "에게서",
        "한테서",
        "에서는",
        "으로는",
        "에게",
        "한테",
        "에서",
        "으로",
        "이랑",
        "와",
        "과",
        "은",
        "는",
        "이",
        "가",
        "을",
        "를",
        "의",
        "에",
        "로",
        "도",
        "만",
        "부터",
        "까지",
        "보다",
        "처럼",
        "께서",
        "께",
        "이나",
        "나",
        "마다",
        "조차",
        "마저",
        "라도",
        "뿐",
      ];
      const candidates = new Set<string>();
      for (const token of tokens) {
        for (const particle of particles) {
          if (token.endsWith(particle) && token.length - particle.length >= 2) {
            candidates.add(token.slice(0, -particle.length));
            break;
          }
        }
        if (tokens.length > 1) candidates.add(token);
      }
      items = (
        await Promise.all(
          [...candidates].map((candidate) => search(candidate, "word")),
        )
      ).flat();
    }
    const uniqueItems = [
      ...new Map(
        items.map((item) => [`${item.entryType}:${item.id}`, item]),
      ).values(),
    ].slice(0, 12);
    const payload = { configured: true, items: uniqueItems };
    await redis
      .set(`dictionary:ko:vi:${query}`, JSON.stringify(payload), "EX", 3600)
      .catch(() => null);
    return HttpResult.json(payload);
  } catch (error) {
    logError("dictionary.lookup.failed", error, { provider: "krdict" });
    return HttpResult.json(
      { error: "Không thể kết nối KRdict lúc này." },
      { status: 502 },
    );
  }
}
import { Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { HttpResult } from '@everlang/backend/http';
import type { Viewer } from '@everlang/backend/http';
@Injectable()
export class DictionaryService {
async get(r: Request, _u: Viewer) {return handleGet(r);
}
}
