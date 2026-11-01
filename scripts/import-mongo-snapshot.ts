import { readFileSync } from "node:fs";
import { initializeOrm, closeOrm } from "@everlang/backend/orm";
import { importContentSnapshot, type MongoSnapshot } from "@everlang/backend/content-import";
import { installProcessErrorHandlers } from "@everlang/backend/process-errors";
installProcessErrorHandlers("mongo-snapshot-import");
const [file, confirm] = process.argv.slice(2);
if (!file || confirm !== "--confirm-snapshot")
    throw new Error("Provide private snapshot path and --confirm-snapshot; back up target first");
try {
    const source = await initializeOrm();
    const result = await importContentSnapshot(source, JSON.parse(readFileSync(file, "utf8").replace(/^\uFEFF/, "")) as MongoSnapshot);
    console.info(JSON.stringify({ result: "PASS", collections: result }));
}
finally {
    await closeOrm();
}
