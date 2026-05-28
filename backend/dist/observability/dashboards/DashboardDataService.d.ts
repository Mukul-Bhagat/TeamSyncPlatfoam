/**
 * DashboardDataService - Aggregates telemetry data for dashboard display
 *
 * Provides unified data access for the Operations Center dashboard.
 * Aggregates metrics, health status, traces, and alerts.
 */
export interface DashboardSummary {
    systemHealth: {
        overall: string;
        overallScore: number;
        components: Record<string, {
            status: string;
            score: number;
        }>;
    };
    metrics: {
        workflowExecutions: number;
        aiRequests: number;
        eventThroughput: number;
        searchQueries: number;
    };
    alerts: {
        active: number;
        critical: number;
        warning: number;
    };
    replays: {
        active: number;
        completed: number;
        failed: number;
    };
}
export declare class DashboardDataService {
    private static instance;
    private supabase;
    private telemetryAggregator;
    private constructor();
    static getInstance(): DashboardDataService;
    /**
     * Get dashboard summary
     */
    getSummary(organizationId?: string, workspaceId?: string): Promise<DashboardSummary>;
    /**
     * Get system health summary
     */
    private getSystemHealth;
    /**
     * Get metrics summary
     */
    private getMetricsSummary;
    /**
     * Get alerts summary
     */
    private getAlertsSummary;
    /**
     * Get replays summary
     */
    private getReplaysSummary;
    /**
     * Get telemetry data for charts
     */
    getTelemetryData(metricName: string, timeRange: {
        start: Date;
        end: Date;
    }, granularity?: '1m' | '5m' | '15m' | '1h', organizationId?: string, workspaceId?: string): Promise<{
        timestamp: Date;
        value: number;
        count: number;
    }[]>;
    /**
     * Get recent traces
     */
    getRecentTraces(limit?: number, organizationId?: string, workspaceId?: string): Promise<any[]>;
    /**
     * Get recent dead letter events
     */
    getRecentDeadLetters(limit?: number, organizationId?: string, workspaceId?: string): Promise<any[]>;
}
//# sourceMappingURL=DashboardDataService.d.ts.map