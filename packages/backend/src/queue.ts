import { Queue, type QueueOptions, type JobsOptions } from "bullmq";
import { correlationId, requestContext } from "./logger";
import { logError } from "./logger";
import { HttpError } from "./http";
/** Preserve the originating HTTP correlation across the durable Redis handoff. */
export class CorrelatedQueue extends Queue {
  constructor(name: string, options?: QueueOptions) {
    super(name, options);
    this.on("error", () => logError("queue.connection.failed", new Error("Queue connection unavailable"), { queue: this.name }));
  }
  override async add(
    name: string,
    data: Record<string, unknown>,
    options?: JobsOptions,
  ) {
    try {
      const status = (this.opts.connection as { status?: string })?.status;
      if (status && ["reconnecting", "end", "close"].includes(status))
        throw new Error("Queue connection unavailable");
      return await super.add(
        name,
        {
          ...data,
          trace: {
            requestId: requestContext.getStore()?.requestId || correlationId(),
          },
        },
        options,
      );
    } catch (error) {
      logError("queue.enqueue.failed", error, { queue: this.name });
      throw new HttpError(
        503,
        "Hàng đợi đang tạm gián đoạn. Dữ liệu đã lưu được giữ lại; hãy thử lại sau.",
        "QUEUE_UNAVAILABLE",
      );
    }
  }
}
