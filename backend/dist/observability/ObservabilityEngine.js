"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObservabilityEngine = void 0;
const LightweightTracer_1 = require("./tracing/LightweightTracer");
const PostgresMetricsStore_1 = require("./metrics/PostgresMetricsStore");
const MetricsCollector_1 = require("./metrics/MetricsCollector");
const HealthMonitor_1 = require("./health/HealthMonitor");
class ObservabilityEngine {
    static instance;
    tracer;
    metricsStore;
    metricsCollector;
    healthMonitor;
    organizationId;
    workspaceId;
    initialized = false;
    constructor() {
        this.tracer = LightweightTracer_1.LightweightTracer.getInstance();
        this.metricsStore = new PostgresMetricsStore_1.PostgresMetricsStore();
        this.metricsCollector = MetricsCollector_1.MetricsCollector.getInstance(this.metricsStore);
        this.healthMonitor = HealthMonitor_1.HealthMonitor.getInstance();
    }
    static getInstance() {
        if (!ObservabilityEngine.instance) {
            ObservabilityEngine.instance = new ObservabilityEngine();
        }
        return ObservabilityEngine.instance;
    }
    /**
     * Initialize the observability engine
     */
    async initialize(organizationId, workspaceId) {
        if (this.initialized) {
            return;
        }
        if (organizationId) {
            this.organizationId = organizationId;
            this.workspaceId = workspaceId;
            // Set organization context on all components
            this.tracer.setOrganizationContext(organizationId, workspaceId);
            this.metricsCollector.setOrganizationContext(organizationId, workspaceId);
        }
        // Start periodic health checks
        this.healthMonitor.startPeriodicChecks();
        this.initialized = true;
    }
    /**
     * Shutdown the observability engine
     */
    async shutdown() {
        // Stop periodic health checks
        this.healthMonitor.stopPeriodicChecks();
        // Flush any pending metrics
        await this.metricsCollector.flush();
        this.initialized = false;
    }
    /**
     * Set organization context
     */
    setOrganizationContext(organizationId, workspaceId) {
        this.organizationId = organizationId;
        this.workspaceId = workspaceId;
        this.tracer.setOrganizationContext(organizationId, workspaceId);
        this.metricsCollector.setOrganizationContext(organizationId, workspaceId);
    }
    // ===== TRACING =====
    /**
     * Start a trace span
     */
    startSpan(operationName, parentContext) {
        return this.tracer.startSpan(operationName, parentContext);
    }
    /**
     * End a trace span
     */
    async endSpan(spanId, status, metadata) {
        await this.tracer.endSpan(spanId, status, metadata);
    }
    /**
     * Get current trace context
     */
    getCurrentTraceContext() {
        return this.tracer.getCurrentTraceContext();
    }
    /**
     * Inject trace context into headers
     */
    injectTraceContext(context, headers) {
        this.tracer.injectContext(context, headers);
    }
    /**
     * Extract trace context from headers
     */
    extractTraceContext(headers) {
        return this.tracer.extractContext(headers);
    }
    /**
     * Trace an async operation
     */
    async traceAsync(operationName, fn, parentContext) {
        return this.tracer.traceAsync(operationName, fn, parentContext);
    }
    /**
     * Get trace spans
     */
    async getTraceSpans(traceId) {
        return this.tracer.getTraceSpans(traceId);
    }
    // ===== METRICS =====
    /**
     * Record a counter metric
     */
    async incrementCounter(metricName, value = 1, labels = {}) {
        await this.metricsCollector.incrementCounter(metricName, value, labels);
    }
    /**
     * Record a gauge metric
     */
    async setGauge(metricName, value, labels = {}) {
        await this.metricsCollector.setGauge(metricName, value, labels);
    }
    /**
     * Record a histogram metric
     */
    async recordHistogram(metricName, value, labels = {}) {
        await this.metricsCollector.recordHistogram(metricName, value, labels);
    }
    /**
     * Record a timing metric
     */
    async recordTiming(metricName, durationMs, labels = {}) {
        await this.metricsCollector.recordTiming(metricName, durationMs, labels);
    }
    /**
     * Time an async operation
     */
    async timeOperation(metricName, operation, labels = {}) {
        return this.metricsCollector.timeOperation(metricName, operation, labels);
    }
    // ===== HEALTH =====
    /**
     * Check all health
     */
    async checkHealth() {
        return this.healthMonitor.checkAll();
    }
    /**
     * Check component health
     */
    async checkComponentHealth(componentName) {
        return this.healthMonitor.checkComponent(componentName);
    }
    /**
     * Check subsystem health
     */
    async checkSubsystemHealth(subsystemName) {
        return this.healthMonitor.checkSubsystem(subsystemName);
    }
    /**
     * Get health history
     */
    async getHealthHistory(componentName, subsystemName, hours = 24) {
        return this.healthMonitor.getHealthHistory(componentName, subsystemName, hours);
    }
    // ===== CONVENIENCE METHODS =====
    /**
     * Record workflow execution
     */
    async recordWorkflowExecution(durationMs, labels = {}) {
        await this.metricsCollector.recordWorkflowExecution(durationMs, labels);
    }
    /**
     * Record workflow failure
     */
    async recordWorkflowFailure(labels = {}) {
        await this.metricsCollector.recordWorkflowFailure(labels);
    }
    /**
     * Record AI request
     */
    async recordAIRequest(durationMs, labels = {}) {
        await this.metricsCollector.recordAIRequest(durationMs, labels);
    }
    /**
     * Record AI token usage
     */
    async recordAITokenUsage(tokens, labels = {}) {
        await this.metricsCollector.recordAITokenUsage(tokens, labels);
    }
    /**
     * Record event bus publish
     */
    async recordEventBusPublish(durationMs, labels = {}) {
        await this.metricsCollector.recordEventBusPublish(durationMs, labels);
    }
    /**
     * Record event bus drop
     */
    async recordEventBusDrop(labels = {}) {
        await this.metricsCollector.recordEventBusDrop(labels);
    }
    /**
     * Record search query
     */
    async recordSearchQuery(durationMs, resultCount, labels = {}) {
        await this.metricsCollector.recordSearchQuery(durationMs, resultCount, labels);
    }
    /**
     * Record indexing job
     */
    async recordIndexingJob(durationMs, labels = {}) {
        await this.metricsCollector.recordIndexingJob(durationMs, labels);
    }
    /**
     * Record indexing failure
     */
    async recordIndexingFailure(labels = {}) {
        await this.metricsCollector.recordIndexingFailure(labels);
    }
    /**
     * Record realtime connections
     */
    async recordRealtimeConnections(count, labels = {}) {
        await this.metricsCollector.recordRealtimeConnections(count, labels);
    }
    /**
     * Record notification sent
     */
    async recordNotificationSent(durationMs, labels = {}) {
        await this.metricsCollector.recordNotificationSent(durationMs, labels);
    }
    /**
     * Record notification failure
     */
    async recordNotificationFailure(labels = {}) {
        await this.metricsCollector.recordNotificationFailure(labels);
    }
    // ===== GETTERS =====
    /**
     * Get the tracer instance
     */
    getTracer() {
        return this.tracer;
    }
    /**
     * Get the metrics collector instance
     */
    getMetricsCollector() {
        return this.metricsCollector;
    }
    /**
     * Get the health monitor instance
     */
    getHealthMonitor() {
        return this.healthMonitor;
    }
    /**
     * Get the metrics store instance
     */
    getMetricsStore() {
        return this.metricsStore;
    }
    /**
     * Check if initialized
     */
    isInitialized() {
        return this.initialized;
    }
}
exports.ObservabilityEngine = ObservabilityEngine;
//# sourceMappingURL=ObservabilityEngine.js.map