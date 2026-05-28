"use strict";
/**
 * DashboardDataService - Aggregates telemetry data for dashboard display
 *
 * Provides unified data access for the Operations Center dashboard.
 * Aggregates metrics, health status, traces, and alerts.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardDataService = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const env_1 = require("../../config/env");
const TelemetryAggregator_1 = require("./TelemetryAggregator");
class DashboardDataService {
    static instance;
    supabase;
    telemetryAggregator;
    constructor() {
        this.supabase = (0, supabase_js_1.createClient)(env_1.env.SUPABASE_URL, env_1.env.SUPABASE_SERVICE_ROLE_KEY);
        this.telemetryAggregator = new TelemetryAggregator_1.TelemetryAggregator(this.supabase);
    }
    static getInstance() {
        if (!DashboardDataService.instance) {
            DashboardDataService.instance = new DashboardDataService();
        }
        return DashboardDataService.instance;
    }
    /**
     * Get dashboard summary
     */
    async getSummary(organizationId, workspaceId) {
        const [systemHealth, metrics, alerts, replays] = await Promise.all([
            this.getSystemHealth(organizationId, workspaceId),
            this.getMetricsSummary(organizationId, workspaceId),
            this.getAlertsSummary(organizationId, workspaceId),
            this.getReplaysSummary(organizationId, workspaceId),
        ]);
        return {
            systemHealth,
            metrics,
            alerts,
            replays,
        };
    }
    /**
     * Get system health summary
     */
    async getSystemHealth(organizationId, workspaceId) {
        let query = this.supabase
            .from('system_health')
            .select('*')
            .gte('last_check_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // Last 5 minutes
            .order('last_check_at', { ascending: false });
        if (organizationId) {
            query = query.eq('organization_id', organizationId);
        }
        const { data, error } = await query;
        if (error) {
            return {
                overall: 'unknown',
                overallScore: 0,
                components: {},
            };
        }
        const components = {};
        let totalScore = 0;
        let count = 0;
        for (const health of data || []) {
            const key = health.subsystem_name ? `${health.component_name}:${health.subsystem_name}` : health.component_name;
            components[key] = {
                status: health.status,
                score: health.health_score,
            };
            totalScore += health.health_score;
            count++;
        }
        const overallScore = count > 0 ? Math.round(totalScore / count) : 100;
        let overall = 'healthy';
        if (overallScore < 50)
            overall = 'critical';
        else if (overallScore < 70)
            overall = 'degraded';
        return { overall, overallScore, components };
    }
    /**
     * Get metrics summary
     */
    async getMetricsSummary(organizationId, workspaceId) {
        const timeRange = new Date(Date.now() - 60 * 60 * 1000); // Last hour
        const [workflowMetrics, aiMetrics, eventMetrics, searchMetrics] = await Promise.all([
            this.telemetryAggregator.getMetricValue('workflow.execution.count', timeRange, organizationId, workspaceId),
            this.telemetryAggregator.getMetricValue('ai.request.count', timeRange, organizationId, workspaceId),
            this.telemetryAggregator.getMetricValue('eventbus.events.processed', timeRange, organizationId, workspaceId),
            this.telemetryAggregator.getMetricValue('search.query.count', timeRange, organizationId, workspaceId),
        ]);
        return {
            workflowExecutions: workflowMetrics || 0,
            aiRequests: aiMetrics || 0,
            eventThroughput: eventMetrics || 0,
            searchQueries: searchMetrics || 0,
        };
    }
    /**
     * Get alerts summary
     */
    async getAlertsSummary(organizationId, workspaceId) {
        let query = this.supabase
            .from('alert_incidents')
            .select('status, rule_id')
            .eq('status', 'active');
        if (organizationId) {
            query = query.eq('organization_id', organizationId);
        }
        if (workspaceId) {
            query = query.eq('workspace_id', workspaceId);
        }
        const { data, error } = await query;
        if (error) {
            return { active: 0, critical: 0, warning: 0 };
        }
        const incidents = data || [];
        const active = incidents.length;
        // Get rule severities
        const ruleIds = incidents.map((i) => i.rule_id);
        let critical = 0;
        let warning = 0;
        if (ruleIds.length > 0) {
            const { data: rules } = await this.supabase
                .from('alert_rules')
                .select('severity')
                .in('id', ruleIds);
            for (const rule of rules || []) {
                if (rule.severity === 'critical')
                    critical++;
                if (rule.severity === 'warning')
                    warning++;
            }
        }
        return { active, critical, warning };
    }
    /**
     * Get replays summary
     */
    async getReplaysSummary(organizationId, workspaceId) {
        let query = this.supabase
            .from('replay_jobs')
            .select('status')
            .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // Last 24 hours
        if (organizationId) {
            query = query.eq('organization_id', organizationId);
        }
        if (workspaceId) {
            query = query.eq('workspace_id', workspaceId);
        }
        const { data, error } = await query;
        if (error) {
            return { active: 0, completed: 0, failed: 0 };
        }
        const jobs = data || [];
        const active = jobs.filter((j) => j.status === 'running' || j.status === 'pending').length;
        const completed = jobs.filter((j) => j.status === 'completed').length;
        const failed = jobs.filter((j) => j.status === 'failed').length;
        return { active, completed, failed };
    }
    /**
     * Get telemetry data for charts
     */
    async getTelemetryData(metricName, timeRange, granularity = '5m', organizationId, workspaceId) {
        return this.telemetryAggregator.getAggregatedMetrics(metricName, timeRange, granularity, organizationId, workspaceId);
    }
    /**
     * Get recent traces
     */
    async getRecentTraces(limit = 20, organizationId, workspaceId) {
        let query = this.supabase
            .from('system_traces')
            .select('*')
            .order('started_at', { ascending: false })
            .limit(limit);
        if (organizationId) {
            query = query.eq('organization_id', organizationId);
        }
        if (workspaceId) {
            query = query.eq('workspace_id', workspaceId);
        }
        const { data, error } = await query;
        if (error) {
            throw new Error(`Failed to fetch recent traces: ${error.message}`);
        }
        return data || [];
    }
    /**
     * Get recent dead letter events
     */
    async getRecentDeadLetters(limit = 20, organizationId, workspaceId) {
        let query = this.supabase
            .from('dead_letter_events')
            .select('*')
            .order('failed_at', { ascending: false })
            .limit(limit);
        if (organizationId) {
            query = query.eq('organization_id', organizationId);
        }
        if (workspaceId) {
            query = query.eq('workspace_id', workspaceId);
        }
        const { data, error } = await query;
        if (error) {
            throw new Error(`Failed to fetch dead letter events: ${error.message}`);
        }
        return data || [];
    }
}
exports.DashboardDataService = DashboardDataService;
//# sourceMappingURL=DashboardDataService.js.map