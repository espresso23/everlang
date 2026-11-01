import { HttpError } from '@everlang/backend/http';
import { query } from "@everlang/backend/sql";
import { reportView, type StoredSubmission } from "@everlang/backend/learning/submissions";
import { Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { queryParams } from '@everlang/backend/http';
import type { Viewer } from '@everlang/backend/http';
@Injectable()
export class JobsService {
async get(r: Request, u: Viewer) {
  const row = (
    await query<StoredSubmission>(
      "SELECT * FROM submissions WHERE id=$1 AND user_id=$2",
      [queryParams(r).get("id"), u.id],
    )
  )[0];
  if (!row) throw new HttpError(404, "Không tìm thấy lượt chấm.");
  return {
    status: row.status,
    error: row.error,
    report: row.status === "completed" ? reportView(row) : null,
  };

}
}
