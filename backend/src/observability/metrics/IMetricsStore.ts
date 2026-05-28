/**
 * IMetricsStore - Pluggable metrics storage interface
 * 
 * This interface allows for different storage backends (PostgreSQL, Prometheus, ClickHouse, etc.)
 * Future migration to time-series databases can be done by replacing the implementation
 * while keeping this interface unchanged.
 */

import type { MetricType, MetricLabels, MetricQueryOptions, MetricAggregation } from './MetricTypes';

export interface IMetricsStore {
  /**
   * Record a counter metric (monotonically increasing)
   */
  recordCounter(
    metricName: string,
    value: number,
    labels: MetricLabels,
    organizationId?: string,
    workspaceId?: string
  ): Promise<void>;

  /**
   * Record a gauge metric (can go up or down)
   */
  recordGauge(
    metricName: string,
    value: number,
    labels: MetricLabels,
    organizationId?: string,
    workspaceId?: string
  ): Promise<void>;

  /**
   * Record a histogram metric (distribution of values)
   */
  recordHistogram(
    metricName: string,
    value: number,
    labels: MetricLabels,
    organizationId?: string,
    workspaceId?: string
  ): Promise<void>;

  /**
   * Record a timing metric (duration in milliseconds)
   */
  recordTiming(
    metricName: string,
    durationMs: number,
    labels: MetricLabels,
    organizationId?: string,
    workspaceId?: string
  ): Promise<void>;

  /**
   * Query metrics with optional filters and aggregation
   */
  queryMetrics(options: MetricQueryOptions): Promise<MetricAggregation[]>;

  /**
   * Get the latest value for a metric
   */
  getLatestValue(
    metricName: string,
    labels?: MetricLabels,
    organizationId?: string,
    workspaceId?: string
  ): Promise<number | null>;

  /**
   * Batch record multiple metrics for performance
   */
  batchRecord(metrics: Array<{
    metricName: string;
    metricType: MetricType;
    value: number;
    labels: MetricLabels;
    organizationId?: string;
    workspaceId?: string;
  }>): Promise<void>;

  /**
   * Delete old metrics based on retention policy
   */
  cleanup(retentionDays: number): Promise<number>;
}
