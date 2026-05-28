import { IndexingQueue } from './IndexingQueue';
import { IndexingWorker } from './IndexingWorker';

export class IndexingPipeline {
  private static instance: IndexingPipeline;
  private queue: IndexingQueue;
  private worker: IndexingWorker;

  private constructor() {
    this.queue = new IndexingQueue();
    this.worker = new IndexingWorker(this.queue);
  }

  static getInstance(): IndexingPipeline {
    if (!IndexingPipeline.instance) {
      IndexingPipeline.instance = new IndexingPipeline();
    }
    return IndexingPipeline.instance;
  }

  /**
   * Start the indexing pipeline
   */
  start(): void {
    this.worker.start();
  }

  /**
   * Stop the indexing pipeline
   */
  stop(): void {
    this.worker.stop();
  }

  /**
   * Queue a document for indexing
   */
  queueIndexing(params: {
    entityType: string;
    entityId: string;
    organizationId: string;
    workspaceId?: string;
    priority?: number;
  }): string {
    return this.queue.enqueue({
      entityType: params.entityType,
      entityId: params.entityId,
      organizationId: params.organizationId,
      workspaceId: params.workspaceId,
      priority: params.priority || 5,
      maxRetries: 3,
    });
  }

  /**
   * Get pipeline statistics
   */
  getStats(): { queued: number; processing: number } {
    return this.queue.getStats();
  }
}
