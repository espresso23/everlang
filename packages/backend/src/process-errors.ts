import { logError } from "./logger";

/** Last boundary for standalone workers. Recoverable failures belong in local catches. */
export function installProcessErrorHandlers(service: string) {
  const fatal = (event: string, error: unknown) => {
    logError(event, error, { component: service });
    process.exit(1);
  };
  const exception = (error: Error) =>
    fatal("process.uncaught_exception", error);
  const rejection = (error: unknown) =>
    fatal("process.unhandled_rejection", error);
  process.on("uncaughtException", exception);
  process.on("unhandledRejection", rejection);
  return () => {
    process.off("uncaughtException", exception);
    process.off("unhandledRejection", rejection);
  };
}

/** EventEmitter does not await async listeners. Keep rejections inside this boundary. */
export function guardedTask(event: string, task: () => Promise<unknown>) {
  return Promise.resolve().then(task).catch((error) => {
    logError(event, error);
  });
}
