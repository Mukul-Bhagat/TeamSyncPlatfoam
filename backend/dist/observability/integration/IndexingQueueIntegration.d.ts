/**
 * IndexingQueueIntegration - Integrates observability with IndexingQueue
 *
 * Adds metrics and health monitoring to the indexing pipeline.
 */
export declare class IndexingQueueIntegration {
    private static instance;
    private observabilityEngine;
    private organizationId?;
    private workspaceId?;
    private constructor();
    static getInstance(): IndexingQueueIntegration;
    /**
     * Set organization context
     */
    setOrganizationContext(organizationId: string, workspaceId?: string): void;
    /**
     * Wrap indexing job with observability
     */
    traceIndexingJob(entityType: string, entityId: string, jobFn: () => Promise<void>): Promise<void>;
    /**
     * Record queue size metric
     */
    recordQueueSize(queued: number, processing: number): Promise<void>;
}
//# sourceMappingURL=IndexingQueueIntegration.d.ts.map