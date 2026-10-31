import { connectDb } from "../lib/db";
import { Knowledge } from "../lib/models/Knowledge";
import { knowledgeSeed } from "../data/knowledge-seed";
import { knowledgeKey, knowledgeSchema } from "../lib/knowledge-contract";

async function seedKnowledge() {
  const entries = knowledgeSeed.map((entry) => ({
    key: knowledgeKey.parse(entry.key),
    content: knowledgeSchema.parse(entry.content),
  }));
  const connection = await connectDb();
  try {
    await Knowledge.init();
    const result = await Knowledge.bulkWrite(
      entries.map((entry) => ({
        updateOne: {
          filter: { key: entry.key, revision: 1 },
          update: {
            $setOnInsert: {
              ...entry,
              revision: 1,
              editVersion: 1,
              status: "draft",
            },
          },
          upsert: true,
        },
      })),
    );
    console.info(
      `Knowledge draft seed: ${result.upsertedCount} created, existing entries unchanged. Nothing auto-published.`,
    );
  } finally {
    await connection.disconnect();
  }
}
seedKnowledge().catch(() => {
  console.error(
    "Knowledge seed failed; verify database configuration and validated content.",
  );
  process.exitCode = 1;
});
