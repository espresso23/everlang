import { ormDataSource } from "../orm";
import { Entities } from "../entities";
import type { GradeReport, Sentence } from "@everlang/contracts/types";
export type StoredSubmission = {
  id: string;
  sentence_id: string;
  translation: string;
  snapshot: Sentence & { gradingRequestId?: string };
  report: GradeReport | null;
  status: string;
  error: string | null;
  created_at: Date;
  model: string;
  prompt_version: string;
  rubric_version: string;
};
export function reportView(row: StoredSubmission) {
  const { gradingRequestId: _requestId, ...sentence }=row.snapshot;
  return {
    ...row.report,
    submissionId: row.id,
    sentence,
    userTranslation: row.translation,
    submittedAt: row.created_at,
    model: row.model,
    promptVersion: row.prompt_version,
    rubricVersion: row.rubric_version,
  };
}
export async function statistics(userId: string) {
  const rows = await ormDataSource
    .createQueryBuilder()
    .select(["*"])
    .from(Entities.submissions, "row")
    .distinctOn(["sentence_id"])
    .where("user_id=:p1 AND status='completed'")
    .orderBy("sentence_id", "ASC")
    .addOrderBy("created_at", "DESC")
    .setParameters({ p1: userId })
    .getRawMany<StoredSubmission>();
  const topics = new Map<string, number[]>();
  for (const r of rows) {
    const key = r.snapshot.topic;
    topics.set(key, [...(topics.get(key) || []), r.report!.score]);
  }
  return {
    totalCompleted: rows.length,
    averageScore: rows.length
      ? Math.round(rows.reduce((n, r) => n + r.report!.score, 0) / rows.length)
      : 0,
    weakTopics: [...topics]
      .map(([_id, scores]) => ({
        _id,
        averageScore: Math.round(
          scores.reduce((a, b) => a + b, 0) / scores.length,
        ),
        attempts: scores.length,
      }))
      .sort((a, b) => a.averageScore - b.averageScore)
      .slice(0, 3),
  };
}
