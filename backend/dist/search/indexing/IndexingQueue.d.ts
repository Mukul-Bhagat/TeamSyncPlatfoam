export interface IndexingJob {
    id: string;
    entityType: string;
    entityId: string;
    organizationId: string;
    workspaceId?: string;
    priority: number;
    createdAt: Date;
    retryCount: number;
    maxRetries: number;
}
export declare class IndexingQueue {
    private queue;
    private processing;
    private listeners;
    /**
     * Add a job to the queue
     */
    enqueue(job: Omit<IndexingJob, 'id' | 'createdAt' | 'retryCount'>): string;
    /**
     * Get the next job from the queue (highest priority first)
     */
    dequeue(): IndexingJob | null;
    /**
     * Mark a job as completed
     */
    complete(jobId: string): void;
    /**
     * Mark a job as failed and requeue if retries remain
     */
    fail(jobId: string, error?: Error): boolean;
    /**
     * Get queue statistics
     */
    getStats(): {
        queued: number;
        processing: number;
    };
    /**
     * Register a listener for new jobs
     */
    onJob(listener: (job: IndexingJob) => void): () => void;
    /**
     * Notify all listeners of a new job
     */
    private notifyListeners;
    /**
     * Clear the queue (for testing/shutdown)
     */
    clear(): void;
}
//# sourceMappingURL=IndexingQueue.d.ts.map