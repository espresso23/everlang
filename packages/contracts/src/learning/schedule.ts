export type DailyTask = {
  id: string;
  type: "review" | "draft" | "weak" | "new";
  title: string;
  reason: string;
  minutes: number;
  target?: string;
  status: "pending" | "done" | "skipped";
};
export function localDay(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  return ["year", "month", "day"]
    .map((k) => parts.find((p) => p.type === k)!.value)
    .join("-");
}
export function makePlan(
  budget: number,
  due: number,
  draftIds: string[],
  weak: string | undefined,
  newId?: string,
): DailyTask[] {
  const tasks: DailyTask[] = [];
  let remaining = budget;
  if (due) {
    const minutes = Math.min(remaining, Math.max(2, Math.ceil(due / 3)));
    tasks.push({
      id: "review",
      type: "review",
      title: `Ôn ${Math.min(due, minutes * 3)} thẻ đến hạn`,
      reason: "Giữ kiến thức trước khi học mới",
      minutes,
      status: "pending",
    });
    remaining -= minutes;
  }
  for (const id of draftIds.slice(0, 2)) {
    if (remaining < 5) break;
    tasks.push({
      id: `draft-${id}`,
      type: "draft",
      title: "Tiếp tục bài dịch đang viết",
      reason: "Hoàn thành bài còn dở",
      minutes: 5,
      target: id,
      status: "pending",
    });
    remaining -= 5;
  }
  if (weak && remaining >= 5) {
    tasks.push({
      id: "weak",
      type: "weak",
      title: `Luyện thêm: ${weak}`,
      reason: "Chủ đề có điểm thấp trong các bài gần đây",
      minutes: 5,
      status: "pending",
    });
    remaining -= 5;
  }
  if (newId && remaining >= 5)
    tasks.push({
      id: "new",
      type: "new",
      title: "Thử một bài dịch mới",
      reason: "Mở rộng kiến thức theo mục tiêu",
      minutes: Math.min(10, remaining),
      target: newId,
      status: "pending",
    });
  return tasks;
}
export function streak(days: string[], today: string) {
  const values = new Set(days);
  let count = 0;
  const cursor = new Date(`${today}T12:00:00Z`);
  if (!values.has(today)) cursor.setUTCDate(cursor.getUTCDate() - 1);
  while (values.has(cursor.toISOString().slice(0, 10))) {
    count++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return count;
}
