export declare class IndexingPipeline {
    private static instance;
    private queue;
    private worker;
    private constructor();
    static getInstance(): IndexingPipeline;
    /**
     * Start the indexing pipeline
     */
    start(): void;
    /**
     * Stop the indexing pipeline
     */
    stop(): void;
    /**
     * Queue a document for indexing
     */
    queueIndexing(params: {
        entityType: string;
        entityId: string;
        organizationId: string;
        workspaceId?: string;
        priority?: number;
    }): string;
    /**
     * Get pipeline statistics
     */
    getStats(): {
        queued: number;
        processing: number;
    };
}
//# sourceMappingURL=IndexingPipeline.d.ts.map