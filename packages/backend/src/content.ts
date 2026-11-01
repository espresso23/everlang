import { sentences } from "./content-store";
import { readFileSync } from "node:fs";
import type { Sentence as SeedSentence } from "@everlang/contracts/types";
const seed = JSON.parse(readFileSync("data/seed-sentences.json", "utf8")) as Array<SeedSentence & {
    sourceId: number;
}>;
import { HttpError } from "./http";
async function initializeContent() {
    await sentences.seed(seed.map(entry => ({ ...entry, language: "ko", skill: "translation", contentVersion: 1, status: "published" as const, isAiGenerated: false, source: "Kho bài luyện dịch ban đầu", rights: "Cần rà soát nguồn trước khi phát hành công khai" })));
}
export async function publishedSentence(id: string) {
    if (!/^[a-f\d]{24}$/i.test(id))
        throw new HttpError(400, "Mã bài học không hợp lệ.");
    const item = await sentences.get(id);
    if (!item || item.status !== "published")
        throw new HttpError(404, "Không tìm thấy bài học đã xuất bản.");
    return item;
}
let contentReady: Promise<void> | undefined;
export function ensureContent() {
    return (contentReady ??= initializeContent().catch((e) => {
        contentReady = undefined;
        throw e;
    }));
}
