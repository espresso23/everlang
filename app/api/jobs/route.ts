import { api, HttpError } from "@/lib/api";
import { query } from "@/lib/sql";
import { reportView, type StoredSubmission } from "@/lib/learning/submissions";
export const GET = api("/api/jobs", async (r, u) => {
  const row = (
    await query<StoredSubmission>(
      "SELECT * FROM submissions WHERE id=$1 AND user_id=$2",
      [r.nextUrl.searchParams.get("id"), u.id],
    )
  )[0];
  if (!row) throw new HttpError(404, "Không tìm thấy lượt chấm.");
  return {
    status: row.status,
    error: row.error,
    report: row.status === "completed" ? reportView(row) : null,
  };
});
