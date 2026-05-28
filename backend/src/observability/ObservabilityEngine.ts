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

export class ObservabilityEngine {
  private static instance: ObservabilityEngine;
  private tracer: LightweightTracer;
  private metricsStore: PostgresMetricsStore;
  private metricsCollector: MetricsCollector;
  private healthMonitor: HealthMonitor;
  private organizationId?: string;
  private workspaceId?: string;
  private initialized: boolean = false;

  private constructor() {
    this.tracer = LightweightTracer.getInstance();
    this.metricsStore = new PostgresMetricsStore();
    this.metricsCollector = MetricsCollector.getInstance(this.metricsStore);
    this.healthMonitor = HealthMonitor.getInstance();
  }

  static getInstance(): ObservabilityEngine {
    if (!ObservabilityEngine.instance) {
      ObservabilityEngine.instance = new ObservabilityEngine();
    }
    return ObservabilityEngine.instance;
  }

  /**
   * Initialize the observability engine
   */
  async initialize(organizationId?: string, workspaceId?: string): Promise<void> {
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
  async shutdown(): Promise<void> {
    // Stop periodic health checks
    this.healthMonitor.stopPeriodicChecks();

    // Flush any pending metrics
    await this.metricsCollector.flush();

    this.initialized = false;
  }

  /**
   * Set organization context
   */
  setOrganizationContext(organizationId: string, workspaceId?: string): void {
    this.organizationId = organizationId;
    this.workspaceId = workspaceId;
    this.tracer.setOrganizationContext(organizationId, workspaceId);
    this.metricsCollector.setOrganizationContext(organizationId, workspaceId);
  }

  // ===== TRACING =====

  /**
   * Start a trace span
   */
  startSpan(operationName: string, parentContext?: TraceContext): string {
    return this.tracer.startSpan(operationName, parentContext);
  }

  /**
   * End a trace span
   */
  async endSpan(spanId: string, status: SpanStatus, metadata?: Record<string, unknown>): Promise<void> {
    await this.tracer.endSpan(spanId, status, metadata);
  }

  /**
   * Get current trace context
   */
  getCurrentTraceContext(): TraceContext | null {
    return this.tracer.getCurrentTraceContext();
  }

  /**
   * Inject trace context into headers
   */
  injectTraceContext(context: TraceContext, headers: Record<string, string>): void {
    this.tracer.injectContext(context, headers);
  }

  /**
   * Extract trace context from headers
   */
  extractTraceContext(headers: Record<string, string>): TraceContext | null {
    return this.tracer.extractContext(headers);
  }

  /**
   * Trace an async operation
   */
  async traceAsync<T>(
    operationName: string,
    fn: () => Promise<T>,
    parentContext?: TraceContext
  ): Promise<T> {
    return this.tracer.traceAsync(operationName, fn, parentContext);
  }

  /**
   * Get trace spans
   */
  async getTraceSpans(traceId: string) {
    return this.tracer.getTraceSpans(traceId);
  }

  // ===== METRICS =====

  /**
   * Record a counter metric
   */
  async incrementCounter(metricName: string, value: number = 1, labels: MetricLabels = {}): Promise<void> {
    await this.metricsCollector.incrementCounter(metricName, value, labels);
  }

  /**
   * Record a gauge metric
   */
  async setGauge(metricName: string, value: number, labels: MetricLabels = {}): Promise<void> {
    await this.metricsCollector.setGauge(metricName, value, labels);
  }

  /**
   * Record a histogram metric
   */
  async recordHistogram(metricName: string, value: number, labels: MetricLabels = {}): Promise<void> {
    await this.metricsCollector.recordHistogram(metricName, value, labels);
  }

  /**
   * Record a timing metric
   */
  async recordTiming(metricName: string, durationMs: number, labels: MetricLabels = {}): Promise<void> {
    await this.metricsCollector.recordTiming(metricName, durationMs, labels);
  }

  /**
   * Time an async operation
   */
  async timeOperation<T>(
    metricName: string,
    operation: () => Promise<T>,
    labels: MetricLabels = {}
  ): Promise<T> {
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
  async checkComponentHealth(componentName: string) {
    return this.healthMonitor.checkComponent(componentName);
  }

  /**
   * Check subsystem health
   */
  async checkSubsystemHealth(subsystemName: string) {
    return this.healthMonitor.checkSubsystem(subsystemName);
  }

  /**
   * Get health history
   */
  async getHealthHistory(componentName: string, subsystemName: string | null, hours: number = 24) {
    return this.healthMonitor.getHealthHistory(componentName, subsystemName, hours);
  }

  // ===== CONVENIENCE METHODS =====

  /**
   * Record workflow execution
   */
  async recordWorkflowExecution(durationMs: number, labels: MetricLabels = {}): Promise<void> {
    await this.metricsCollector.recordWorkflowExecution(durationMs, labels);
  }

  /**
   * Record workflow failure
   */
  async recordWorkflowFailure(labels: MetricLabels = {}): Promise<void> {
    await this.metricsCollector.recordWorkflowFailure(labels);
  }

  /**
   * Record AI request
   */
  async recordAIRequest(durationMs: number, labels: MetricLabels = {}): Promise<void> {
    await this.metricsCollector.recordAIRequest(durationMs, labels);
  }

  /**
   * Record AI token usage
   */
  async recordAITokenUsage(tokens: number, labels: MetricLabels = {}): Promise<void> {
    await this.metricsCollector.recordAITokenUsage(tokens, labels);
  }

  /**
   * Record event bus publish
   */
  async recordEventBusPublish(durationMs: number, labels: MetricLabels = {}): Promise<void> {
    await this.metricsCollector.recordEventBusPublish(durationMs, labels);
  }

  /**
   * Record event bus drop
   */
  async recordEventBusDrop(labels: MetricLabels = {}): Promise<void> {
    await this.metricsCollector.recordEventBusDrop(labels);
  }

  /**
   * Record search query
   */
  async recordSearchQuery(durationMs: number, resultCount: number, labels: MetricLabels = {}): Promise<void> {
    await this.metricsCollector.recordSearchQuery(durationMs, resultCount, labels);
  }

  /**
   * Record indexing job
   */
  async recordIndexingJob(durationMs: number, labels: MetricLabels = {}): Promise<void> {
    await this.metricsCollector.recordIndexingJob(durationMs, labels);
  }

  /**
   * Record indexing failure
   */
  async recordIndexingFailure(labels: MetricLabels = {}): Promise<void> {
    await this.metricsCollector.recordIndexingFailure(labels);
  }

  /**
   * Record realtime connections
   */
  async recordRealtimeConnections(count: number, labels: MetricLabels = {}): Promise<void> {
    await this.metricsCollector.recordRealtimeConnections(count, labels);
  }

  /**
   * Record notification sent
   */
  async recordNotificationSent(durationMs: number, labels: MetricLabels = {}): Promise<void> {
    await this.metricsCollector.recordNotificationSent(durationMs, labels);
  }

  /**
   * Record notification failure
   */
  async recordNotificationFailure(labels: MetricLabels = {}): Promise<void> {
    await this.metricsCollector.recordNotificationFailure(labels);
  }

  // ===== GETTERS =====

  /**
   * Get the tracer instance
   */
  getTracer(): LightweightTracer {
    return this.tracer;
  }

  /**
   * Get the metrics collector instance
   */
  getMetricsCollector(): MetricsCollector {
    return this.metricsCollector;
  }

  /**
   * Get the health monitor instance
   */
  getHealthMonitor(): HealthMonitor {
    return this.healthMonitor;
  }

  /**
   * Get the metrics store instance
   */
  getMetricsStore(): PostgresMetricsStore {
    return this.metricsStore;
  }

  /**
   * Check if initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}
