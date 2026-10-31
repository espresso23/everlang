import { api, HttpError } from "@/lib/api";
import { query } from "@/lib/sql";
import { knowledgeKey, stateSchema } from "@/lib/knowledge-contract";
import { getKnowledge, knowledgeTitles } from "@/lib/knowledge";

export const GET = api("/api/knowledge/state", async (r, u) => {
  if (!r.nextUrl.searchParams.has("key")) {
    const items = await query(
      "SELECT entry_key,revision,bookmarked,section,read,updated_at FROM knowledge_state WHERE user_id=$1 AND (bookmarked OR section<>'') ORDER BY updated_at DESC LIMIT 100",
      [u.id],
    );
    const titles = new Map(
      (await knowledgeTitles(items.map((row) => row.entry_key))).map((row) => [
        row.key,
        row.title,
      ]),
    );
    return {
      items: items.map((row) => ({
        ...row,
        title: titles.get(row.entry_key) || "Tài liệu đã lưu",
      })),
    };
  }
  const key = knowledgeKey.parse(r.nextUrl.searchParams.get("key"));
  return {
    state:
      (
        await query(
          "SELECT * FROM knowledge_state WHERE user_id=$1 AND entry_key=$2",
          [u.id, key],
        )
      )[0] || null,
  };
});
export const PUT = api("/api/knowledge/state", async (r, u) => {
  const b = stateSchema.parse(await r.json());
  const entry = await getKnowledge(b.key);
  if (entry.revision !== b.revision)
    throw new HttpError(
      409,
      "Tài liệu có phiên bản mới. Hãy mở lại bài trước khi lưu.",
    );
  if (b.section && !entry.sections.some((s) => s.id === b.section))
    throw new HttpError(400, "Vị trí đọc không thuộc bài.");
  const values = [
    u.id,
    b.key,
    b.revision,
    b.bookmarked,
    b.note,
    b.section,
    b.read,
    b.version,
  ];
  const sql =
    b.version === 0
      ? "INSERT INTO knowledge_state(user_id,entry_key,revision,bookmarked,note,section,read) VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT DO NOTHING RETURNING *"
      : "UPDATE knowledge_state SET revision=$3,bookmarked=$4,note=$5,section=$6,read=$7,version=version+1,updated_at=now() WHERE user_id=$1 AND entry_key=$2 AND version=$8 RETURNING *";
  const rows = await query(sql, b.version === 0 ? values.slice(0, 7) : values);
  if (!rows.length)
    throw new HttpError(
      409,
      "Ghi chú đã đổi trên thiết bị khác. Bản bạn nhập vẫn được giữ; tải bản mới để đối chiếu.",
    );
  return { state: rows[0] };
});
