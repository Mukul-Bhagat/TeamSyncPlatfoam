/**
 * MetricsCollector - Central metrics collection point
 * 
 * Provides a unified API for recording metrics across the system.
 * Handles organization/workspace scoping and metric validation.
 */

import type { IMetricsStore } from './IMetricsStore';
import type { MetricLabels } from './MetricTypes';
import { BUILT_IN_METRICS } from './MetricTypes';

export class MetricsCollector {
  private static instance: MetricsCollector;
  private store: IMetricsStore;
  private organizationId?: string;
  private workspaceId?: string;

  constructor(store: IMetricsStore) {
    this.store = store;
  }

  static getInstance(store?: IMetricsStore): MetricsCollector {
    if (!MetricsCollector.instance) {
      if (!store) {
        throw new Error('MetricsCollector requires a store on first initialization');
      }
      MetricsCollector.instance = new MetricsCollector(store);
    }
    return MetricsCollector.instance;
  }

  /**
   * Set organization context for all metrics
   */
  setOrganizationContext(organizationId: string, workspaceId?: string): void {
    this.organizationId = organizationId;
    this.workspaceId = workspaceId;
  }

  /**
   * Record a counter metric
   */
  async incrementCounter(
    metricName: string,
    value: number = 1,
    labels: MetricLabels = {}
  ): Promise<void> {
    await this.store.recordCounter(metricName, value, labels, this.organizationId, this.workspaceId);
  }

  /**
   * Record a gauge metric
   */
  async setGauge(
    metricName: string,
    value: number,
    labels: MetricLabels = {}
  ): Promise<void> {
    await this.store.recordGauge(metricName, value, labels, this.organizationId, this.workspaceId);
  }

  /**
   * Record a histogram metric
   */
  async recordHistogram(
    metricName: string,
    value: number,
    labels: MetricLabels = {}
  ): Promise<void> {
    await this.store.recordHistogram(metricName, value, labels, this.organizationId, this.workspaceId);
  }

  /**
   * Record a timing metric
   */
  async recordTiming(
    metricName: string,
    durationMs: number,
    labels: MetricLabels = {}
  ): Promise<void> {
    await this.store.recordTiming(metricName, durationMs, labels, this.organizationId, this.workspaceId);
  }

  /**
   * Time an async operation and record the duration
   */
  async timeOperation<T>(
    metricName: string,
    operation: () => Promise<T>,
    labels: MetricLabels = {}
  ): Promise<T> {
    const startTime = Date.now();
    try {
      const result = await operation();
      const duration = Date.now() - startTime;
      await this.recordTiming(metricName, duration, labels);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      await this.recordTiming(metricName, duration, { ...labels, success: 'false' });
      throw error;
    }
  }

  /**
   * Convenience method for workflow execution duration
   */
  async recordWorkflowExecution(durationMs: number, labels: MetricLabels = {}): Promise<void> {
    await this.recordTiming(BUILT_IN_METRICS.WORKFLOW_EXECUTION_DURATION, durationMs, labels);
    await this.incrementCounter(BUILT_IN_METRICS.WORKFLOW_EXECUTION_COUNT, 1, labels);
  }

  /**
   * Convenience method for workflow failure
   */
  async recordWorkflowFailure(labels: MetricLabels = {}): Promise<void> {
    await this.incrementCounter(BUILT_IN_METRICS.WORKFLOW_FAILURE_COUNT, 1, labels);
  }

  /**
   * Convenience method for AI token usage
   */
  async recordAITokenUsage(tokens: number, labels: MetricLabels = {}): Promise<void> {
    await this.recordHistogram(BUILT_IN_METRICS.AI_TOKENS_USED, tokens, labels);
  }

  /**
   * Convenience method for AI request
   */
  async recordAIRequest(durationMs: number, labels: MetricLabels = {}): Promise<void> {
    await this.recordTiming(BUILT_IN_METRICS.AI_REQUEST_LATENCY, durationMs, labels);
    await this.incrementCounter(BUILT_IN_METRICS.AI_REQUEST_COUNT, 1, labels);
  }

  /**
   * Convenience method for event bus publish
   */
  async recordEventBusPublish(durationMs: number, labels: MetricLabels = {}): Promise<void> {
    await this.recordTiming(BUILT_IN_METRICS.EVENTBUS_PUBLISH_LATENCY, durationMs, labels);
    await this.incrementCounter(BUILT_IN_METRICS.EVENTBUS_EVENTS_PROCESSED, 1, labels);
  }

  /**
   * Convenience method for event bus drop
   */
  async recordEventBusDrop(labels: MetricLabels = {}): Promise<void> {
    await this.incrementCounter(BUILT_IN_METRICS.EVENTBUS_EVENTS_DROPPED, 1, labels);
  }

  /**
   * Convenience method for search query
   */
  async recordSearchQuery(durationMs: number, resultCount: number, labels: MetricLabels = {}): Promise<void> {
    await this.recordTiming(BUILT_IN_METRICS.SEARCH_QUERY_LATENCY, durationMs, labels);
    await this.incrementCounter(BUILT_IN_METRICS.SEARCH_QUERY_COUNT, 1, labels);
    await this.recordHistogram(BUILT_IN_METRICS.SEARCH_RESULTS_COUNT, resultCount, labels);
  }

  /**
   * Convenience method for indexing job
   */
  async recordIndexingJob(durationMs: number, labels: MetricLabels = {}): Promise<void> {
    await this.recordTiming(BUILT_IN_METRICS.INDEXING_JOB_DURATION, durationMs, labels);
  }

  /**
   * Convenience method for indexing failure
   */
  async recordIndexingFailure(labels: MetricLabels = {}): Promise<void> {
    await this.incrementCounter(BUILT_IN_METRICS.INDEXING_FAILURE_COUNT, 1, labels);
  }

  /**
   * Convenience method for realtime connections
   */
  async recordRealtimeConnections(count: number, labels: MetricLabels = {}): Promise<void> {
    await this.setGauge(BUILT_IN_METRICS.REALTIME_CONNECTIONS_ACTIVE, count, labels);
  }

  /**
   * Convenience method for notification sent
   */
  async recordNotificationSent(durationMs: number, labels: MetricLabels = {}): Promise<void> {
    await this.recordTiming(BUILT_IN_METRICS.NOTIFICATION_DELIVERY_LATENCY, durationMs, labels);
    await this.incrementCounter(BUILT_IN_METRICS.NOTIFICATION_SENT_COUNT, 1, labels);
  }

  /**
   * Convenience method for notification failure
   */
  async recordNotificationFailure(labels: MetricLabels = {}): Promise<void> {
    await this.incrementCounter(BUILT_IN_METRICS.NOTIFICATION_FAILURE_COUNT, 1, labels);
  }

  /**
   * Get the metrics store
   */
  getStore(): IMetricsStore {
    return this.store;
  }

  /**
   * Force flush any pending batched metrics
   */
  async flush(): Promise<void> {
    if ('forceFlush' in this.store) {
      await (this.store as any).forceFlush();
    }
  }
}
