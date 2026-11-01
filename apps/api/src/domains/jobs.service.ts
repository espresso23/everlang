import { ormDataSource } from "@everlang/backend/orm";
import { Entities } from "@everlang/backend/entities";
import { HttpError } from "@everlang/backend/http";
import {
  reportView,
  type StoredSubmission,
} from "@everlang/backend/learning/submissions";
import { Injectable } from "@nestjs/common";
import type { Request } from "express";
import { queryParams } from "@everlang/backend/http";
import type { Viewer } from "@everlang/backend/http";
@Injectable()
export class JobsService {
  async get(r: Request, u: Viewer) {
    const row = (
      await ormDataSource
        .createQueryBuilder()
        .select(["*"])
        .from(Entities.submissions, "row")
        .where("id=:p1 AND user_id=:p2")
        .setParameters({ p1: queryParams(r).get("id"), p2: u.id })
        .getRawMany<StoredSubmission>()
    )[0];
    if (!row) throw new HttpError(404, "Không tìm thấy lượt chấm.");
    return {
      status: row.status,
      error: row.error,
      report: row.status === "completed" ? reportView(row) : null,
    };
  }
}
