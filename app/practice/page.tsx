import Practice from "@/components/practice";
import { TOPICS } from "@/lib/types";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ sentence?: string; topic?: string }>;
}) {
  const p = await searchParams;
  return (
    <Practice
      selectedId={p.sentence}
      initialTopic={
        TOPICS.includes(p.topic as (typeof TOPICS)[number]) ? p.topic : "ALL"
      }
    />
  );
}
