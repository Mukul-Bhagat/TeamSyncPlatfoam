/**
 * PostgresMetricsStore - PostgreSQL implementation of IMetricsStore
 *
 * This implementation uses Supabase/PostgreSQL for metrics storage.
 * It's designed to be replaceable with time-series databases in the future.
 */
import type { IMetricsStore } from './IMetricsStore';
import type { MetricType, MetricLabels, MetricQueryOptions, MetricAggregation } from './MetricTypes';
export declare class PostgresMetricsStore implements IMetricsStore {
    private supabase;
    private batchBuffer;
    private batchTimer;
    private readonly BATCH_SIZE;
    private readonly BATCH_INTERVAL_MS;
    constructor();
    recordCounter(metricName: string, value: number, labels: MetricLabels, organizationId?: string, workspaceId?: string): Promise<void>;
    recordGauge(metricName: string, value: number, labels: MetricLabels, organizationId?: string, workspaceId?: string): Promise<void>;
    recordHistogram(metricName: string, value: number, labels: MetricLabels, organizationId?: string, workspaceId?: string): Promise<void>;
    recordTiming(metricName: string, durationMs: number, labels: MetricLabels, organizationId?: string, workspaceId?: string): Promise<void>;
    private recordMetric;
    queryMetrics(options: MetricQueryOptions): Promise<MetricAggregation[]>;
    getLatestValue(metricName: string, labels?: MetricLabels, organizationId?: string, workspaceId?: string): Promise<number | null>;
    batchRecord(metrics: Array<{
        metricName: string;
        metricType: MetricType;
        value: number;
        labels: MetricLabels;
        organizationId?: string;
        workspaceId?: string;
    }>): Promise<void>;
    cleanup(retentionDays: number): Promise<number>;
    private flushBatch;
    private aggregateByTime;
    private getGranularityMs;
    /**
     * Force flush any pending batched metrics
     */
    forceFlush(): Promise<void>;
}
//# sourceMappingURL=PostgresMetricsStore.d.ts.map