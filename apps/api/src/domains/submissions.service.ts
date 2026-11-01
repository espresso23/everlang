import { query } from "@everlang/backend/sql";
import { reportView, type StoredSubmission } from "@everlang/backend/learning/submissions";
import { Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { queryParams } from '@everlang/backend/http';
import type { Viewer } from '@everlang/backend/http';
@Injectable()
export class SubmissionsService {
async get(r: Request, u: Viewer) {
  const id = queryParams(r).get("sentenceId");
  const rows = await query<StoredSubmission>(
    `SELECT * FROM submissions WHERE user_id=$1 AND status='completed' ${id ? "AND sentence_id=$2" : ""} ORDER BY created_at DESC LIMIT 200`,
    id ? [u.id, id] : [u.id],
  );
  return id
    ? { submission: rows[0] ? reportView(rows[0]) : null }
    : { submissions: rows.map(reportView) };

}
}
