import { initializeOrm, closeOrm } from "@everlang/backend/orm";
import { knowledgeStore } from "@everlang/backend/content-store";
import { knowledgeSeed } from "../data/knowledge-seed";
import { knowledgeKey, knowledgeSchema } from "@everlang/contracts/knowledge-contract";
async function seedKnowledge() {
    await initializeOrm();
    try {
        let count = 0;
        for (const entry of knowledgeSeed) {
            const result = await knowledgeStore.create({ key: knowledgeKey.parse(entry.key), content: knowledgeSchema.parse(entry.content), revision: 1, editVersion: 1, status: "draft" }, true);
            if (result.inserted)
                count++;
        }
        console.info(`Knowledge draft seed: ${count} created; existing entries unchanged; nothing auto-published.`);
    }
    finally {
        await closeOrm();
    }
}
seedKnowledge().catch(() => { console.error("Knowledge seed failed; verify database configuration and content."); process.exitCode = 1; });
