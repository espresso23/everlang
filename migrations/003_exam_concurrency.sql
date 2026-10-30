CREATE UNIQUE INDEX IF NOT EXISTS one_active_exam_per_user ON exam_attempts(user_id,exam_id) WHERE submitted_at IS NULL;
