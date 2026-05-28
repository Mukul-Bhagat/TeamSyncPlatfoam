/**
 * IndexingQueueIntegration - Integrates observability with IndexingQueue
 * 
 * Adds metrics and health monitoring to the indexing pipeline.
 */

import { ObservabilityEngine } from '../ObservabilityEngine';

export class IndexingQueueIntegration {
  private static instance: IndexingQueueIntegration;
  private observabilityEngine: ObservabilityEngine;
  private organizationId?: string;
  private workspaceId?: string;

  private constructor() {
    this.observabilityEngine = ObservabilityEngine.getInstance();
  }

  static getInstance(): IndexingQueueIntegration {
    if (!IndexingQueueIntegration.instance) {
      IndexingQueueIntegration.instance = new IndexingQueueIntegration();
    }
    return IndexingQueueIntegration.instance;
  }

  /**
   * Set organization context
   */
  setOrganizationContext(organizationId: string, workspaceId?: string): void {
    this.organizationId = organizationId;
    this.workspaceId = workspaceId;
    this.observabilityEngine.setOrganizationContext(organizationId, workspaceId);
  }

  /**
   * Wrap indexing job with observability
   */
  async traceIndexingJob(
    entityType: string,
    entityId: string,
    jobFn: () => Promise<void>
  ): Promise<void> {
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
    } catch (error) {
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
  async recordQueueSize(queued: number, processing: number): Promise<void> {
    await this.observabilityEngine.setGauge('indexing.queue.size', queued, {
      state: 'queued',
    });
    await this.observabilityEngine.setGauge('indexing.queue.size', processing, {
      state: 'processing',
    });
  }
}
