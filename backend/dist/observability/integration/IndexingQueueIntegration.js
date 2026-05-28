"use strict";
/**
 * IndexingQueueIntegration - Integrates observability with IndexingQueue
 *
 * Adds metrics and health monitoring to the indexing pipeline.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndexingQueueIntegration = void 0;
const ObservabilityEngine_1 = require("../ObservabilityEngine");
class IndexingQueueIntegration {
    static instance;
    observabilityEngine;
    organizationId;
    workspaceId;
    constructor() {
        this.observabilityEngine = ObservabilityEngine_1.ObservabilityEngine.getInstance();
    }
    static getInstance() {
        if (!IndexingQueueIntegration.instance) {
            IndexingQueueIntegration.instance = new IndexingQueueIntegration();
        }
        return IndexingQueueIntegration.instance;
    }
    /**
     * Set organization context
     */
    setOrganizationContext(organizationId, workspaceId) {
        this.organizationId = organizationId;
        this.workspaceId = workspaceId;
        this.observabilityEngine.setOrganizationContext(organizationId, workspaceId);
    }
    /**
     * Wrap indexing job with observability
     */
    async traceIndexingJob(entityType, entityId, jobFn) {
        const spanId = this.observabilityEngine.startSpan(`indexing.job.${entityType}`);
        const startTime = Date.now();
        try {
            await jobFn();
            const duration = Date.now() - startTime;
            await this.observabilityEngine.endSpan(spanId, 'success', {
                entityType,
                entityId,
            });
            await this.observabilityEngine.recordIndexingJob(duration, {
                entity_type: entityType,
            });
        }
        catch (error) {
            const duration = Date.now() - startTime;
            await this.observabilityEngine.endSpan(spanId, 'failed', {
                entityType,
                entityId,
                error: error instanceof Error ? error.message : String(error),
            });
            await this.observabilityEngine.recordIndexingFailure({
                entity_type: entityType,
            });
            throw error;
        }
    }
    /**
     * Record queue size metric
     */
    async recordQueueSize(queued, processing) {
        await this.observabilityEngine.setGauge('indexing.queue.size', queued, {
            state: 'queued',
        });
        await this.observabilityEngine.setGauge('indexing.queue.size', processing, {
            state: 'processing',
        });
    }
}
exports.IndexingQueueIntegration = IndexingQueueIntegration;
//# sourceMappingURL=IndexingQueueIntegration.js.map