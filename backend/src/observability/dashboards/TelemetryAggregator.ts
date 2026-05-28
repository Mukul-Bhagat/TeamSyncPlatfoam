/**
 * TelemetryAggregator - Aggregates metrics data for dashboard visualization
 * 
 * Provides time-series aggregation and summary statistics for metrics.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

export class TelemetryAggregator {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  /**
   * Get aggregated metrics for a time range
   */
  async getAggregatedMetrics(
    metricName: string,
    timeRange: { start: Date; end: Date },
    granularity: '1m' | '5m' | '15m' | '1h' = '5m',
    organizationId?: string,
    workspaceId?: string
  ): Promise<Array<{ timestamp: Date; value: number; count: number }>> {
    let query = this.supabase
      .from('system_metrics')
      .select('*')
      .eq('metric_name', metricName)
      .gte('created_at', timeRange.start.toISOString())
      .lte('created_at', timeRange.end.toISOString())
      .order('created_at', { ascending: true });

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    if (workspaceId) {
      query = query.eq('workspace_id', workspaceId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch aggregated metrics: ${error.message}`);
    }

    return this.aggregateByTime(data || [], granularity);
  }

  /**
   * Get a single metric value (sum over time range)
   */
  async getMetricValue(
    metricName: string,
    since: Date,
    organizationId?: string,
    workspaceId?: string
  ): Promise<number | null> {
    let query = this.supabase
      .from('system_metrics')
      .select('value')
      .eq('metric_name', metricName)
      .gte('created_at', since.toISOString());

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    if (workspaceId) {
      query = query.eq('workspace_id', workspaceId);
    }

    const { data, error } = await query;

    if (error) {
      return null;
    }

    if (!data || data.length === 0) {
      return null;
    }

    // Sum all values
    return data.reduce((sum, row) => sum + (row.value || 0), 0);
  }

  /**
   * Aggregate metrics by time bucket
   */
  private aggregateByTime(
    metrics: any[],
    granularity: '1m' | '5m' | '15m' | '1h'
  ): Array<{ timestamp: Date; value: number; count: number }> {
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

    const result: Array<{ timestamp: Date; value: number; count: number }> = [];
    for (const [bucketTime, { sum, count }] of buckets.entries()) {
      result.push({
        timestamp: new Date(bucketTime),
        value: sum,
        count,
      });
    }

    return result.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  /**
   * Get milliseconds for granularity
   */
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
      default:
        return 5 * 60 * 1000;
    }
  }

  /**
   * Get top metrics by value
   */
  async getTopMetrics(
    metricName: string,
    limit: number = 10,
    organizationId?: string,
    workspaceId?: string
  ): Promise<Array<{ timestamp: Date; value: number; labels: Record<string, string> }>> {
    let query = this.supabase
      .from('system_metrics')
      .select('*')
      .eq('metric_name', metricName)
      .order('value', { ascending: false })
      .limit(limit);

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    if (workspaceId) {
      query = query.eq('workspace_id', workspaceId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch top metrics: ${error.message}`);
    }

    return (data || []).map((row) => ({
      timestamp: new Date(row.created_at),
      value: row.value,
      labels: row.labels,
    }));
  }
}
