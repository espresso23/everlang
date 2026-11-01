import { initializeOrm, closeOrm } from "@everlang/backend/orm";
import { migrateOrm } from "@everlang/backend/orm-migrations";
import { installProcessErrorHandlers } from "@everlang/backend/process-errors";
installProcessErrorHandlers("orm-migrate");
try {
  const source = await initializeOrm();
  const executed = await migrateOrm(source);
  console.info(`TypeORM migrations ready; ${executed.length} applied.`);
} finally {
  await closeOrm();
}
