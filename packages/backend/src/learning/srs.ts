import { DefaultScheduler } from "ts-fsrs";
export const ALGORITHM = "ts-fsrs@6.0.0/FSRS-7/retention-0.9";
const schedulerPromise = DefaultScheduler({
  version: "FSRS-7",
  desiredRetention: 0.9,
  enableFuzz: false,
  learningSteps: ["1m", "10m"],
  relearningSteps: ["10m"],
});
export async function newCard(id: string, now = new Date()) {
  return (await schedulerPromise).newCard({ cardId: id, now });
}
export async function reviewCard(
  card: unknown,
  rating: number,
  now = new Date(),
) {
  const scheduler = await schedulerPromise;
  const stored = card as Awaited<ReturnType<typeof newCard>>;
  const parsed = {
    ...stored,
    dueAt: new Date(stored.dueAt),
    lastReviewAt: stored.lastReviewAt ? new Date(stored.lastReviewAt) : null,
  };
  return scheduler.review({
    card: parsed,
    grade: rating as 1 | 2 | 3 | 4,
    now,
  });
}
