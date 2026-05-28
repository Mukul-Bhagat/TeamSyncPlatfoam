/**
 * DiagnosticsEngine - Correlates traces and analyzes execution patterns
 * 
 * Provides operational intelligence by analyzing traces across services.
 * Identifies failure modes, performance bottlenecks, and anomalies.
 */

import { createClient } from '@supabase/supabase-js';
import { env } from '../../config/env';
import { TraceAnalyzer } from './TraceAnalyzer';
import { ExecutionDiagnostics } from './ExecutionDiagnostics';

export interface DiagnosticReport {
  traceId: string;
  summary: {
    totalSpans: number;
    totalDuration: number;
    failedSpans: number;
    successRate: number;
  };
  timeline: Array<{
    spanId: string;
    operationName: string;
    startTime: Date;
    duration: number;
    status: string;
  }>;
  failures: Array<{
    spanId: string;
    operationName: string;
    error: string;
    timestamp: Date;
  }>;
  bottlenecks: Array<{
    spanId: string;
    operationName: string;
    duration: number;
    percentage: number;
  }>;
  patterns: string[];
  recommendations: string[];
}

export class DiagnosticsEngine {
  private static instance: DiagnosticsEngine;
  private supabase;
  private traceAnalyzer: TraceAnalyzer;
  private executionDiagnostics: ExecutionDiagnostics;

  private constructor() {
    this.supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
    this.traceAnalyzer = new TraceAnalyzer(this.supabase);
    this.executionDiagnostics = new ExecutionDiagnostics(this.supabase);
  }

  static getInstance(): DiagnosticsEngine {
    if (!DiagnosticsEngine.instance) {
      DiagnosticsEngine.instance = new DiagnosticsEngine();
    }
    return DiagnosticsEngine.instance;
  }

  /**
   * Generate a diagnostic report for a trace
   */
  async generateDiagnosticReport(traceId: string): Promise<DiagnosticReport> {
    const spans = await this.traceAnalyzer.getTraceSpans(traceId);

    if (spans.length === 0) {
      throw new Error(`No spans found for trace: ${traceId}`);
    }

    const summary = this.calculateSummary(spans);
    const timeline = this.buildTimeline(spans);
    const failures = this.identifyFailures(spans);
    const bottlenecks = this.identifyBottlenecks(spans, summary.totalDuration);
    const patterns = this.analyzePatterns(spans);
    const recommendations = this.generateRecommendations(spans, failures, bottlenecks);

    return {
      traceId,
      summary,
      timeline,
      failures,
      bottlenecks,
      patterns,
      recommendations,
    };
  }

  /**
   * Calculate summary statistics
   */
  private calculateSummary(spans: any[]): {
    totalSpans: number;
    totalDuration: number;
    failedSpans: number;
    successRate: number;
  } {
    const totalSpans = spans.length;
    const totalDuration = Math.max(...spans.map((s) => s.durationMs || 0));
    const failedSpans = spans.filter((s) => s.status === 'failed').length;
    const successRate = totalSpans > 0 ? ((totalSpans - failedSpans) / totalSpans) * 100 : 100;

    return {
      totalSpans,
      totalDuration,
      failedSpans,
      successRate,
    };
  }

  /**
   * Build timeline of spans
   */
  private buildTimeline(spans: any[]): Array<{
    spanId: string;
    operationName: string;
    startTime: Date;
    duration: number;
    status: string;
  }> {
    return spans.map((span) => ({
      spanId: span.spanId,
      operationName: span.operationName,
      startTime: new Date(span.started_at),
      duration: span.durationMs || 0,
      status: span.status,
    }));
  }

  /**
   * Identify failed spans
   */
  private identifyFailures(spans: any[]): Array<{
    spanId: string;
    operationName: string;
    error: string;
    timestamp: Date;
  }> {
    return spans
      .filter((s) => s.status === 'failed')
      .map((span) => ({
        spanId: span.spanId,
        operationName: span.operationName,
        error: span.metadata?.error as string || 'Unknown error',
        timestamp: new Date(span.started_at),
      }));
  }

  /**
   * Identify performance bottlenecks
   */
  private identifyBottlenecks(
    spans: any[],
    totalDuration: number
  ): Array<{
    spanId: string;
    operationName: string;
    duration: number;
    percentage: number;
  }> {
    const bottlenecks = spans
      .filter((s) => s.durationMs && s.durationMs > 0)
      .map((span) => ({
        spanId: span.spanId,
        operationName: span.operationName,
        duration: span.durationMs,
        percentage: totalDuration > 0 ? (span.durationMs / totalDuration) * 100 : 0,
      }))
      .filter((b) => b.percentage > 10) // Spans taking more than 10% of total time
      .sort((a, b) => b.percentage - a.percentage);

    return bottlenecks.slice(0, 5); // Top 5 bottlenecks
  }

  /**
   * Analyze patterns in the trace
   */
  private analyzePatterns(spans: any[]): string[] {
    const patterns: string[] = [];

    // Check for retry patterns
    const operationCounts = new Map<string, number>();
    for (const span of spans) {
      const count = operationCounts.get(span.operationName) || 0;
      operationCounts.set(span.operationName, count + 1);
    }

    for (const [operation, count] of operationCounts.entries()) {
      if (count > 3) {
        patterns.push(`High retry count detected for operation: ${operation} (${count} attempts)`);
      }
    }

    // Check for timeout patterns
    const timeouts = spans.filter((s) => s.status === 'timeout');
    if (timeouts.length > 0) {
      patterns.push(`Timeout pattern detected: ${timeouts.length} spans timed out`);
    }

    // Check for cascading failures
    const failedSpans = spans.filter((s) => s.status === 'failed');
    if (failedSpans.length > 1) {
      patterns.push(`Cascading failure pattern detected: ${failedSpans.length} spans failed`);
    }

    return patterns;
  }

  /**
   * Generate recommendations based on analysis
   */
  private generateRecommendations(
    spans: any[],
    failures: any[],
    bottlenecks: any[]
  ): string[] {
    const recommendations: string[] = [];

    if (failures.length > 0) {
      recommendations.push('Review error handling for failed operations');
      recommendations.push('Consider implementing retry logic with exponential backoff');
    }

    if (bottlenecks.length > 0) {
      recommendations.push(`Optimize slow operation: ${bottlenecks[0].operationName}`);
      recommendations.push('Consider caching or parallelization for bottlenecks');
    }

    if (spans.length > 20) {
      recommendations.push('Consider reducing span complexity by breaking down operations');
    }

    return recommendations;
  }

  /**
   * Get execution diagnostics for a workflow
   */
  async getWorkflowExecutionDiagnostics(executionId: string) {
    return this.executionDiagnostics.analyzeWorkflowExecution(executionId);
  }

  /**
   * Get execution diagnostics for an AI request
   */
  async getAIRequestDiagnostics(requestId: string) {
    return this.executionDiagnostics.analyzeAIRequest(requestId);
  }

  /**
   * Search for traces matching criteria
   */
  async searchTraces(criteria: {
    serviceName?: string;
    operationName?: string;
    status?: string;
    minDuration?: number;
    maxDuration?: number;
    startTime?: Date;
    endTime?: Date;
    limit?: number;
  }) {
    let query = this.supabase.from('system_traces').select('*');

    if (criteria.serviceName) {
      query = query.eq('service_name', criteria.serviceName);
    }

    if (criteria.operationName) {
      query = query.eq('operation_name', criteria.operationName);
    }

    if (criteria.status) {
      query = query.eq('status', criteria.status);
    }

    if (criteria.minDuration) {
      query = query.gte('duration_ms', criteria.minDuration);
    }

    if (criteria.maxDuration) {
      query = query.lte('duration_ms', criteria.maxDuration);
    }

    if (criteria.startTime) {
      query = query.gte('started_at', criteria.startTime.toISOString());
    }

    if (criteria.endTime) {
      query = query.lte('started_at', criteria.endTime.toISOString());
    }

    query = query.order('started_at', { ascending: false });

    if (criteria.limit) {
      query = query.limit(criteria.limit);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to search traces: ${error.message}`);
    }

    return data || [];
  }
}
