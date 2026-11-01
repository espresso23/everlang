import { Queue, type JobsOptions } from 'bullmq';
import { correlationId, requestContext } from './logger';
/** Preserve the originating HTTP correlation across the durable Redis handoff. */
export class CorrelatedQueue extends Queue {
  override add(name: string, data: Record<string, unknown>, options?: JobsOptions) {
    return super.add(name, { ...data, trace: { requestId: requestContext.getStore()?.requestId || correlationId() } }, options);
  }
}
