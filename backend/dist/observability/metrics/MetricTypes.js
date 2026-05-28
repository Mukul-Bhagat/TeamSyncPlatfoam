"use strict";
/**
 * MetricTypes - Type definitions for metrics system
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BUILT_IN_METRICS = void 0;
/**
 * Built-in metric definitions
 */
exports.BUILT_IN_METRICS = {
    // Workflow metrics
    WORKFLOW_EXECUTION_DURATION: 'workflow.execution.duration',
    WORKFLOW_EXECUTION_COUNT: 'workflow.execution.count',
    WORKFLOW_FAILURE_COUNT: 'workflow.failure.count',
    // AI metrics
    AI_TOKENS_USED: 'ai.tokens.used',
    AI_REQUEST_COUNT: 'ai.request.count',
    AI_REQUEST_LATENCY: 'ai.request.latency',
    // Event bus metrics
    EVENTBUS_EVENTS_PROCESSED: 'eventbus.events.processed',
    EVENTBUS_EVENTS_DROPPED: 'eventbus.events.dropped',
    EVENTBUS_PUBLISH_LATENCY: 'eventbus.publish.latency',
    // Search metrics
    SEARCH_QUERY_COUNT: 'search.query.count',
    SEARCH_QUERY_LATENCY: 'search.query.latency',
    SEARCH_RESULTS_COUNT: 'search.results.count',
    // Indexing metrics
    INDEXING_QUEUE_SIZE: 'indexing.queue.size',
    INDEXING_JOB_DURATION: 'indexing.job.duration',
    INDEXING_FAILURE_COUNT: 'indexing.failure.count',
    // Realtime metrics
    REALTIME_CONNECTIONS_ACTIVE: 'realtime.connections.active',
    REALTIME_MESSAGES_SENT: 'realtime.messages.sent',
    REALTIME_MESSAGES_RECEIVED: 'realtime.messages.received',
    // Notification metrics
    NOTIFICATION_SENT_COUNT: 'notification.sent.count',
    NOTIFICATION_DELIVERY_LATENCY: 'notification.delivery.latency',
    NOTIFICATION_FAILURE_COUNT: 'notification.failure.count',
};
//# sourceMappingURL=MetricTypes.js.map