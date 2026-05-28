"use strict";
/**
 * PostgresMetricsStore - PostgreSQL implementation of IMetricsStore
 *
 * This implementation uses Supabase/PostgreSQL for metrics storage.
 * It's designed to be replaceable with time-series databases in the future.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresMetricsStore = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const env_1 = require("../../config/env");
class PostgresMetricsStore {
    supabase;
    batchBuffer = [];
    batchTimer = null;
    BATCH_SIZE = 100;
    BATCH_INTERVAL_MS = 5000;
    constructor() {
        this.supabase = (0, supabase_js_1.createClient)(env_1.env.SUPABASE_URL, env_1.env.SUPABASE_SERVICE_ROLE_KEY);
    }
    async recordCounter(metricName, value, labels, organizationId, workspaceId) {
        await this.recordMetric('counter', metricName, value, labels, organizationId, workspaceId);
    }
    async recordGauge(metricName, value, labels, organizationId, workspaceId) {
        await this.recordMetric('gauge', metricName, value, labels, organizationId, workspaceId);
    }
    async recordHistogram(metricName, value, labels, organizationId, workspaceId) {
        await this.recordMetric('histogram', metricName, value, labels, organizationId, workspaceId);
    }
    async recordTiming(metricName, durationMs, labels, organizationId, workspaceId) {
        await this.recordMetric('timing', metricName, durationMs, labels, organizationId, workspaceId);
    }
    async recordMetric(metricType, metricName, value, labels, organizationId, workspaceId) {
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
        }
        else if (!this.batchTimer) {
            this.batchTimer = setTimeout(() => this.flushBatch(), this.BATCH_INTERVAL_MS);
        }
    }
    async queryMetrics(options) {
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
    async getLatestValue(metricName, labels, organizationId, workspaceId) {
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
    async batchRecord(metrics) {
        this.batchBuffer.push(...metrics);
        if (this.batchBuffer.length >= this.BATCH_SIZE) {
            await this.flushBatch();
        }
    }
    async cleanup(retentionDays) {
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
    async flushBatch() {
        if (this.batchBuffer.length === 0)
            return;
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
        }
        catch (error) {
            // Re-add failed metrics to buffer
            this.batchBuffer.unshift(...batch);
            throw error;
        }
    }
    aggregateByTime(metrics, aggregation, granularity) {
        const bucketMs = this.getGranularityMs(granularity);
        const buckets = new Map();
        for (const metric of metrics) {
            const timestamp = new Date(metric.created_at).getTime();
            const bucketTime = Math.floor(timestamp / bucketMs) * bucketMs;
            if (!buckets.has(bucketTime)) {
                buckets.set(bucketTime, { sum: 0, count: 0 });
            }
            const bucket = buckets.get(bucketTime);
            bucket.sum += metric.value;
            bucket.count += 1;
        }
        const result = [];
        for (const [bucketTime, { sum, count }] of buckets.entries()) {
            let value;
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
    getGranularityMs(granularity) {
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
    async forceFlush() {
        await this.flushBatch();
    }
}
exports.PostgresMetricsStore = PostgresMetricsStore;
//# sourceMappingURL=PostgresMetricsStore.js.map