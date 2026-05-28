/**
 * MetricsCollector - Central metrics collection point
 *
 * Provides a unified API for recording metrics across the system.
 * Handles organization/workspace scoping and metric validation.
 */
import type { IMetricsStore } from './IMetricsStore';
import type { MetricLabels } from './MetricTypes';
export declare class MetricsCollector {
    private static instance;
    private store;
    private organizationId?;
    private workspaceId?;
    constructor(store: IMetricsStore);
    static getInstance(store?: IMetricsStore): MetricsCollector;
    /**
     * Set organization context for all metrics
     */
    setOrganizationContext(organizationId: string, workspaceId?: string): void;
    /**
     * Record a counter metric
     */
    incrementCounter(metricName: string, value?: number, labels?: MetricLabels): Promise<void>;
    /**
     * Record a gauge metric
     */
    setGauge(metricName: string, value: number, labels?: MetricLabels): Promise<void>;
    /**
     * Record a histogram metric
     */
    recordHistogram(metricName: string, value: number, labels?: MetricLabels): Promise<void>;
    /**
     * Record a timing metric
     */
    recordTiming(metricName: string, durationMs: number, labels?: MetricLabels): Promise<void>;
    /**
     * Time an async operation and record the duration
     */
    timeOperation<T>(metricName: string, operation: () => Promise<T>, labels?: MetricLabels): Promise<T>;
    /**
     * Convenience method for workflow execution duration
     */
    recordWorkflowExecution(durationMs: number, labels?: MetricLabels): Promise<void>;
    /**
     * Convenience method for workflow failure
     */
    recordWorkflowFailure(labels?: MetricLabels): Promise<void>;
    /**
     * Convenience method for AI token usage
     */
    recordAITokenUsage(tokens: number, labels?: MetricLabels): Promise<void>;
    /**
     * Convenience method for AI request
     */
    recordAIRequest(durationMs: number, labels?: MetricLabels): Promise<void>;
    /**
     * Convenience method for event bus publish
     */
    recordEventBusPublish(durationMs: number, labels?: MetricLabels): Promise<void>;
    /**
     * Convenience method for event bus drop
     */
    recordEventBusDrop(labels?: MetricLabels): Promise<void>;
    /**
     * Convenience method for search query
     */
    recordSearchQuery(durationMs: number, resultCount: number, labels?: MetricLabels): Promise<void>;
    /**
     * Convenience method for indexing job
     */
    recordIndexingJob(durationMs: number, labels?: MetricLabels): Promise<void>;
    /**
     * Convenience method for indexing failure
     */
    recordIndexingFailure(labels?: MetricLabels): Promise<void>;
    /**
     * Convenience method for realtime connections
     */
    recordRealtimeConnections(count: number, labels?: MetricLabels): Promise<void>;
    /**
     * Convenience method for notification sent
     */
    recordNotificationSent(durationMs: number, labels?: MetricLabels): Promise<void>;
    /**
     * Convenience method for notification failure
     */
    recordNotificationFailure(labels?: MetricLabels): Promise<void>;
    /**
     * Get the metrics store
     */
    getStore(): IMetricsStore;
    /**
     * Force flush any pending batched metrics
     */
    flush(): Promise<void>;
}
//# sourceMappingURL=MetricsCollector.d.ts.map