import { IndexingQueue } from './IndexingQueue';
export declare class IndexingWorker {
    private queue;
    private isRunning;
    private processingInterval;
    private embeddingProvider;
    constructor(queue: IndexingQueue);
    /**
     * Start the worker
     */
    start(): void;
    /**
     * Stop the worker
     */
    stop(): void;
    /**
     * Process the next job in the queue
     */
    private processNextJob;
    /**
     * Process a single indexing job
     */
    private processJob;
    /**
     * Fetch document content based on entity type
     */
    private fetchDocument;
    /**
     * Fetch message content
     */
    private fetchMessage;
    /**
     * Fetch summary content
     */
    private fetchSummary;
    /**
     * Fetch incident content
     */
    private fetchIncident;
    /**
     * Fetch deployment content
     */
    private fetchDeployment;
    /**
     * Store document and embedding
     */
    private storeDocument;
}
//# sourceMappingURL=IndexingWorker.d.ts.map