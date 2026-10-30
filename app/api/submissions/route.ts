import { api } from "@/lib/api";
import { query } from "@/lib/sql";
import { reportView, type StoredSubmission } from "@/lib/learning/submissions";
export const GET = api("/api/submissions", async (r, u) => {
  const id = r.nextUrl.searchParams.get("sentenceId");
  const rows = await query<StoredSubmission>(
    `SELECT * FROM submissions WHERE user_id=$1 AND status='completed' ${id ? "AND sentence_id=$2" : ""} ORDER BY created_at DESC LIMIT 200`,
    id ? [u.id, id] : [u.id],
  );
  return id
    ? { submission: rows[0] ? reportView(rows[0]) : null }
    : { submissions: rows.map(reportView) };
});
