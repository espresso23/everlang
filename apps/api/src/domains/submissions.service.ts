import { ormDataSource } from "@everlang/backend/orm";
import { Entities } from "@everlang/backend/entities";
import {
  reportView,
  type StoredSubmission,
} from "@everlang/backend/learning/submissions";
import { Injectable } from "@nestjs/common";
import type { Request } from "express";
import { queryParams } from "@everlang/backend/http";
import type { Viewer } from "@everlang/backend/http";
@Injectable()
export class SubmissionsService {
  async get(r: Request, u: Viewer) {
    const id = queryParams(r).get("sentenceId");
    const rows = await (id
      ? ormDataSource
          .createQueryBuilder()
          .select(["*"])
          .from(Entities.submissions, "row")
          .where("user_id=:p1 AND status='completed' AND sentence_id=:p2")
          .orderBy("created_at", "DESC")
          .limit(200)
          .setParameters({
            p1: (id ? [u.id, id] : [u.id])[0],
            p2: (id ? [u.id, id] : [u.id])[1],
          })
          .getRawMany<StoredSubmission>()
      : ormDataSource
          .createQueryBuilder()
          .select(["*"])
          .from(Entities.submissions, "row")
          .where("user_id=:p1 AND status='completed'")
          .orderBy("created_at", "DESC")
          .limit(200)
          .setParameters({ p1: (id ? [u.id, id] : [u.id])[0] })
          .getRawMany<StoredSubmission>());
    return id
      ? { submission: rows[0] ? reportView(rows[0]) : null }
      : { submissions: rows.map(reportView) };
  }
}
