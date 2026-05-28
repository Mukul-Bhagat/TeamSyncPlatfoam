/**
 * ObservabilityEngine - Core orchestration layer for all observability components
 *
 * This is the central hub that integrates:
 * - Tracing
 * - Metrics collection
 * - Health monitoring
 * - Replay operations
 * - Diagnostics
 * - Alerting
 *
 * Provides a unified API for the entire observability infrastructure.
 */
import { LightweightTracer } from './tracing/LightweightTracer';
import { PostgresMetricsStore } from './metrics/PostgresMetricsStore';
import { MetricsCollector } from './metrics/MetricsCollector';
import { HealthMonitor } from './health/HealthMonitor';
import type { TraceContext, SpanStatus } from './tracing/ITracer';
import type { MetricLabels } from './metrics/MetricTypes';
export declare class ObservabilityEngine {
    private static instance;
    private tracer;
    private metricsStore;
    private metricsCollector;
    private healthMonitor;
    private organizationId?;
    private workspaceId?;
    private initialized;
    private constructor();
    static getInstance(): ObservabilityEngine;
    /**
     * Initialize the observability engine
     */
    initialize(organizationId?: string, workspaceId?: string): Promise<void>;
    /**
     * Shutdown the observability engine
     */
    shutdown(): Promise<void>;
    /**
     * Set organization context
     */
    setOrganizationContext(organizationId: string, workspaceId?: string): void;
    /**
     * Start a trace span
     */
    startSpan(operationName: string, parentContext?: TraceContext): string;
    /**
     * End a trace span
     */
    endSpan(spanId: string, status: SpanStatus, metadata?: Record<string, unknown>): Promise<void>;
    /**
     * Get current trace context
     */
    getCurrentTraceContext(): TraceContext | null;
    /**
     * Inject trace context into headers
     */
    injectTraceContext(context: TraceContext, headers: Record<string, string>): void;
    /**
     * Extract trace context from headers
     */
    extractTraceContext(headers: Record<string, string>): TraceContext | null;
    /**
     * Trace an async operation
     */
    traceAsync<T>(operationName: string, fn: () => Promise<T>, parentContext?: TraceContext): Promise<T>;
    /**
     * Get trace spans
     */
    getTraceSpans(traceId: string): Promise<import("./tracing/ITracer").Span[]>;
    /**
     * Record a counter metric
     */
    incrementCounter(metricName: string, value?: number, labels?: MetricLabels): Promise<void>;
    /**
     * Record a gauge metric
     */
    setGauge(metricName: string, value: number, labels?: MetricLabels): Promise<void>;
    /**
     * Record a histogram metric
     */
    recordHistogram(metricName: string, value: number, labels?: MetricLabels): Promise<void>;
    /**
     * Record a timing metric
     */
    recordTiming(metricName: string, durationMs: number, labels?: MetricLabels): Promise<void>;
    /**
     * Time an async operation
     */
    timeOperation<T>(metricName: string, operation: () => Promise<T>, labels?: MetricLabels): Promise<T>;
    /**
     * Check all health
     */
    checkHealth(): Promise<{
        components: Map<string, import("./health/IHealthChecker").HealthCheckResult>;
        subsystems: Map<string, import("./health/IHealthChecker").HealthCheckResult>;
        overall: import("./health/IHealthChecker").HealthStatus;
        overallScore: number;
    }>;
    /**
     * Check component health
     */
    checkComponentHealth(componentName: string): Promise<import("./health/IHealthChecker").HealthCheckResult | null>;
    /**
     * Check subsystem health
     */
    checkSubsystemHealth(subsystemName: string): Promise<import("./health/IHealthChecker").HealthCheckResult | null>;
    /**
     * Get health history
     */
    getHealthHistory(componentName: string, subsystemName: string | null, hours?: number): Promise<import("./health/IHealthChecker").HealthCheckResult[]>;
    /**
     * Record workflow execution
     */
    recordWorkflowExecution(durationMs: number, labels?: MetricLabels): Promise<void>;
    /**
     * Record workflow failure
     */
    recordWorkflowFailure(labels?: MetricLabels): Promise<void>;
    /**
     * Record AI request
     */
    recordAIRequest(durationMs: number, labels?: MetricLabels): Promise<void>;
    /**
     * Record AI token usage
     */
    recordAITokenUsage(tokens: number, labels?: MetricLabels): Promise<void>;
    /**
     * Record event bus publish
     */
    recordEventBusPublish(durationMs: number, labels?: MetricLabels): Promise<void>;
    /**
     * Record event bus drop
     */
    recordEventBusDrop(labels?: MetricLabels): Promise<void>;
    /**
     * Record search query
     */
    recordSearchQuery(durationMs: number, resultCount: number, labels?: MetricLabels): Promise<void>;
    /**
     * Record indexing job
     */
    recordIndexingJob(durationMs: number, labels?: MetricLabels): Promise<void>;
    /**
     * Record indexing failure
     */
    recordIndexingFailure(labels?: MetricLabels): Promise<void>;
    /**
     * Record realtime connections
     */
    recordRealtimeConnections(count: number, labels?: MetricLabels): Promise<void>;
    /**
     * Record notification sent
     */
    recordNotificationSent(durationMs: number, labels?: MetricLabels): Promise<void>;
    /**
     * Record notification failure
     */
    recordNotificationFailure(labels?: MetricLabels): Promise<void>;
    /**
     * Get the tracer instance
     */
    getTracer(): LightweightTracer;
    /**
     * Get the metrics collector instance
     */
    getMetricsCollector(): MetricsCollector;
    /**
     * Get the health monitor instance
     */
    getHealthMonitor(): HealthMonitor;
    /**
     * Get the metrics store instance
     */
    getMetricsStore(): PostgresMetricsStore;
    /**
     * Check if initialized
     */
    isInitialized(): boolean;
}
//# sourceMappingURL=ObservabilityEngine.d.ts.map