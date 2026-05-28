/**
 * PostgresMetricsStore - PostgreSQL implementation of IMetricsStore
 * 
 * This implementation uses Supabase/PostgreSQL for metrics storage.
 * It's designed to be replaceable with time-series databases in the future.
 */

import { createClient } from '@supabase/supabase-js';
import { env } from '../../config/env';
import type { IMetricsStore } from './IMetricsStore';
import type { MetricType, MetricLabels, MetricQueryOptions, MetricAggregation } from './MetricTypes';

export class PostgresMetricsStore implements IMetricsStore {
  private supabase;
  private batchBuffer: Array<{
    metricName: string;
    metricType: MetricType;
    value: number;
    labels: MetricLabels;
    organizationId?: string;
    workspaceId?: string;
  }> = [];
  private batchTimer: number | null = null;
  private readonly BATCH_SIZE = 100;
  private readonly BATCH_INTERVAL_MS = 5000;

  constructor() {
    this.supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  }

  async recordCounter(
    metricName: string,
    value: number,
    labels: MetricLabels,
    organizationId?: string,
    workspaceId?: string
  ): Promise<void> {
    await this.recordMetric('counter', metricName, value, labels, organizationId, workspaceId);
  }

  async recordGauge(
    metricName: string,
    value: number,
    labels: MetricLabels,
    organizationId?: string,
    workspaceId?: string
  ): Promise<void> {
    await this.recordMetric('gauge', metricName, value, labels, organizationId, workspaceId);
  }

  async recordHistogram(
    metricName: string,
    value: number,
    labels: MetricLabels,
    organizationId?: string,
    workspaceId?: string
  ): Promise<void> {
    await this.recordMetric('histogram', metricName, value, labels, organizationId, workspaceId);
  }

  async recordTiming(
    metricName: string,
    durationMs: number,
    labels: MetricLabels,
    organizationId?: string,
    workspaceId?: string
  ): Promise<void> {
    await this.recordMetric('timing', metricName, durationMs, labels, organizationId, workspaceId);
  }

  private async recordMetric(
    metricType: MetricType,
    metricName: string,
    value: number,
    labels: MetricLabels,
    organizationId?: string,
    workspaceId?: string
  ): Promise<void> {
    this.batchBuffer.push({
      metricName,
      metricType,
      value,
      labels,
      organizationId,
      workspaceId,
    });

    if (this.batchBuffer.length >= this.BATCH_SIZE) {
      await this.flushBatch();
    } else if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => this.flushBatch(), this.BATCH_INTERVAL_MS);
    }
  }

  async queryMetrics(options: MetricQueryOptions): Promise<MetricAggregation[]> {
    const { metricName, timeRange, filters, aggregation = 'sum', granularity = '5m' } = options;

    let query = this.supabase
      .from('system_metrics')
      .select('*')
      .eq('metric_name', metricName);

    if (filters?.organizationId) {
      query = query.eq('organization_id', filters.organizationId);
    }

    if (filters?.workspaceId) {
      query = query.eq('workspace_id', filters.workspaceId);
    }

    if (filters?.labels) {
      for (const [key, value] of Object.entries(filters.labels)) {
        query = query.filter('labels', 'cs', `"${key}":"${value}"`);
      }
    }

    if (timeRange) {
      query = query.gte('created_at', timeRange.start.toISOString()).lte('created_at', timeRange.end.toISOString());
    }

    query = query.order('created_at', { ascending: true });

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to query metrics: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Aggregate by time bucket based on granularity
    return this.aggregateByTime(data, aggregation, granularity);
  }

  async getLatestValue(
    metricName: string,
    labels?: MetricLabels,
    organizationId?: string,
    workspaceId?: string
  ): Promise<number | null> {
    let query = this.supabase
      .from('system_metrics')
      .select('value')
      .eq('metric_name', metricName)
      .order('created_at', { ascending: false })
      .limit(1);

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    if (workspaceId) {
      query = query.eq('workspace_id', workspaceId);
    }

    if (labels) {
      for (const [key, value] of Object.entries(labels)) {
        query = query.filter('labels', 'cs', `"${key}":"${value}"`);
      }
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to get latest metric: ${error.message}`);
    }

    return data && data.length > 0 ? data[0].value : null;
  }

  async batchRecord(metrics: Array<{
    metricName: string;
    metricType: MetricType;
    value: number;
    labels: MetricLabels;
    organizationId?: string;
    workspaceId?: string;
  }>): Promise<void> {
    this.batchBuffer.push(...metrics);

    if (this.batchBuffer.length >= this.BATCH_SIZE) {
      await this.flushBatch();
    }
  }

  async cleanup(retentionDays: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const { error } = await this.supabase
      .from('system_metrics')
      .delete()
      .lt('created_at', cutoffDate.toISOString());

    if (error) {
      throw new Error(`Failed to cleanup metrics: ${error.message}`);
    }

    return 0; // Supabase doesn't return count on delete
  }

  private async flushBatch(): Promise<void> {
    if (this.batchBuffer.length === 0) return;

    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    const batch = [...this.batchBuffer];
    this.batchBuffer = [];

    try {
      const records = batch.map((metric) => ({
        metric_name: metric.metricName,
        metric_type: metric.metricType,
        value: metric.value,
        labels: metric.labels,
        organization_id: metric.organizationId,
        workspace_id: metric.workspaceId,
      }));

      const { error } = await this.supabase.from('system_metrics').insert(records);

      if (error) {
        throw error;
      }
    } catch (error) {
      // Re-add failed metrics to buffer
      this.batchBuffer.unshift(...batch);
      throw error;
    }
  }

  private aggregateByTime(
    metrics: any[],
    aggregation: string,
    granularity: string
  ): MetricAggregation[] {
    const bucketMs = this.getGranularityMs(granularity);
    const buckets = new Map<number, { sum: number; count: number }>();

    for (const metric of metrics) {
      const timestamp = new Date(metric.created_at).getTime();
      const bucketTime = Math.floor(timestamp / bucketMs) * bucketMs;

      if (!buckets.has(bucketTime)) {
        buckets.set(bucketTime, { sum: 0, count: 0 });
      }

      const bucket = buckets.get(bucketTime)!;
      bucket.sum += metric.value;
      bucket.count += 1;
    }

    const result: MetricAggregation[] = [];
    for (const [bucketTime, { sum, count }] of buckets.entries()) {
      let value: number;
      switch (aggregation) {
        case 'sum':
          value = sum;
          break;
        case 'avg':
          value = sum / count;
          break;
        case 'count':
          value = count;
          break;
        default:
          value = sum;
      }

      result.push({
        timestamp: new Date(bucketTime),
        value,
        count,
      });
    }

    return result.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  private getGranularityMs(granularity: string): number {
    switch (granularity) {
      case '1m':
        return 60 * 1000;
      case '5m':
        return 5 * 60 * 1000;
      case '15m':
        return 15 * 60 * 1000;
      case '1h':
        return 60 * 60 * 1000;
      case '1d':
        return 24 * 60 * 60 * 1000;
      default:
        return 5 * 60 * 1000;
    }
  }

  /**
   * Force flush any pending batched metrics
   */
  async forceFlush(): Promise<void> {
    await this.flushBatch();
  }
}
