/**
 * MetricTypes - Type definitions for metrics system
 */
export type MetricType = 'counter' | 'gauge' | 'histogram' | 'timing';
export type MetricScope = 'global' | 'organization' | 'workspace';
export interface MetricLabels {
    [key: string]: string;
}
export interface MetricRecord {
    metricName: string;
    metricType: MetricType;
    value: number;
    labels: MetricLabels;
    organizationId?: string;
    workspaceId?: string;
    timestamp: Date;
}
export interface MetricQueryOptions {
    metricName: string;
    timeRange?: {
        start: Date;
        end: Date;
    };
    filters?: {
        organizationId?: string;
        workspaceId?: string;
        labels?: MetricLabels;
    };
    aggregation?: 'sum' | 'avg' | 'min' | 'max' | 'count';
    granularity?: '1m' | '5m' | '15m' | '1h' | '1d';
}
export interface MetricAggregation {
    timestamp: Date;
    value: number;
    count: number;
}
/**
 * Built-in metric definitions
 */
export declare const BUILT_IN_METRICS: {
    readonly WORKFLOW_EXECUTION_DURATION: "workflow.execution.duration";
    readonly WORKFLOW_EXECUTION_COUNT: "workflow.execution.count";
    readonly WORKFLOW_FAILURE_COUNT: "workflow.failure.count";
    readonly AI_TOKENS_USED: "ai.tokens.used";
    readonly AI_REQUEST_COUNT: "ai.request.count";
    readonly AI_REQUEST_LATENCY: "ai.request.latency";
    readonly EVENTBUS_EVENTS_PROCESSED: "eventbus.events.processed";
    readonly EVENTBUS_EVENTS_DROPPED: "eventbus.events.dropped";
    readonly EVENTBUS_PUBLISH_LATENCY: "eventbus.publish.latency";
    readonly SEARCH_QUERY_COUNT: "search.query.count";
    readonly SEARCH_QUERY_LATENCY: "search.query.latency";
    readonly SEARCH_RESULTS_COUNT: "search.results.count";
    readonly INDEXING_QUEUE_SIZE: "indexing.queue.size";
    readonly INDEXING_JOB_DURATION: "indexing.job.duration";
    readonly INDEXING_FAILURE_COUNT: "indexing.failure.count";
    readonly REALTIME_CONNECTIONS_ACTIVE: "realtime.connections.active";
    readonly REALTIME_MESSAGES_SENT: "realtime.messages.sent";
    readonly REALTIME_MESSAGES_RECEIVED: "realtime.messages.received";
    readonly NOTIFICATION_SENT_COUNT: "notification.sent.count";
    readonly NOTIFICATION_DELIVERY_LATENCY: "notification.delivery.latency";
    readonly NOTIFICATION_FAILURE_COUNT: "notification.failure.count";
};
//# sourceMappingURL=MetricTypes.d.ts.map