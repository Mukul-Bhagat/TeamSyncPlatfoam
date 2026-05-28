/**
 * TelemetryAggregator - Aggregates metrics data for dashboard visualization
 *
 * Provides time-series aggregation and summary statistics for metrics.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
export declare class TelemetryAggregator {
    private supabase;
    constructor(supabase: SupabaseClient);
    /**
     * Get aggregated metrics for a time range
     */
    getAggregatedMetrics(metricName: string, timeRange: {
        start: Date;
        end: Date;
    }, granularity?: '1m' | '5m' | '15m' | '1h', organizationId?: string, workspaceId?: string): Promise<Array<{
        timestamp: Date;
        value: number;
        count: number;
    }>>;
    /**
     * Get a single metric value (sum over time range)
     */
    getMetricValue(metricName: string, since: Date, organizationId?: string, workspaceId?: string): Promise<number | null>;
    /**
     * Aggregate metrics by time bucket
     */
    private aggregateByTime;
    /**
     * Get milliseconds for granularity
     */
    private getGranularityMs;
    /**
     * Get top metrics by value
     */
    getTopMetrics(metricName: string, limit?: number, organizationId?: string, workspaceId?: string): Promise<Array<{
        timestamp: Date;
        value: number;
        labels: Record<string, string>;
    }>>;
}
//# sourceMappingURL=TelemetryAggregator.d.ts.map