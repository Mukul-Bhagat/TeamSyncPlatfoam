"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndexingPipeline = void 0;
const IndexingQueue_1 = require("./IndexingQueue");
const IndexingWorker_1 = require("./IndexingWorker");
class IndexingPipeline {
    static instance;
    queue;
    worker;
    constructor() {
        this.queue = new IndexingQueue_1.IndexingQueue();
        this.worker = new IndexingWorker_1.IndexingWorker(this.queue);
    }
    static getInstance() {
        if (!IndexingPipeline.instance) {
            IndexingPipeline.instance = new IndexingPipeline();
        }
        return IndexingPipeline.instance;
    }
    /**
     * Start the indexing pipeline
     */
    start() {
        this.worker.start();
    }
    /**
     * Stop the indexing pipeline
     */
    stop() {
        this.worker.stop();
    }
    /**
     * Queue a document for indexing
     */
    queueIndexing(params) {
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
    getStats() {
        return this.queue.getStats();
    }
}
exports.IndexingPipeline = IndexingPipeline;
//# sourceMappingURL=IndexingPipeline.js.map