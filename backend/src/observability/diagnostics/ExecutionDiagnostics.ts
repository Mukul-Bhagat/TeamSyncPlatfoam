/**
 * ExecutionDiagnostics - Analyzes workflow and AI execution patterns
 */

import type { SupabaseClient } from '@supabase/supabase-js';

export class ExecutionDiagnostics {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  /**
   * Analyze workflow execution
   */
  async analyzeWorkflowExecution(executionId: string): Promise<{
    execution: any;
    steps: any[];
    timeline: any[];
    bottlenecks: any[];
    recommendations: string[];
  }> {
    const { data: execution, error } = await this.supabase
      .from('workflow_executions')
      .select('*')
      .eq('id', executionId)
      .single();

    if (error || !execution) {
      throw new Error(`Workflow execution not found: ${executionId}`);
    }

    // Get related traces
    const { data: traces } = await this.supabase
      .from('system_traces')
      .select('*')
      .eq('metadata->>execution_id', executionId)
      .order('started_at', { ascending: true });

    const timeline = (traces || []).map((trace) => ({
      spanId: trace.span_id,
      operationName: trace.operation_name,
      startTime: new Date(trace.started_at),
      duration: trace.duration_ms || 0,
      status: trace.status,
    }));

    const bottlenecks = this.identifyBottlenecks(traces || []);
    const recommendations = this.generateRecommendations(execution, traces || []);

    return {
      execution,
      steps: [],
      timeline,
      bottlenecks,
      recommendations,
    };
  }

  /**
   * Analyze AI request
   */
  async analyzeAIRequest(requestId: string): Promise<{
    request: any;
    timeline: any[];
    tokenUsage: number;
    latency: number;
    recommendations: string[];
  }> {
    // Placeholder for AI request analysis
    // In production, this would query AI-specific tables
    return {
      request: null,
      timeline: [],
      tokenUsage: 0,
      latency: 0,
      recommendations: [],
    };
  }

  /**
   * Identify bottlenecks in execution
   */
  private identifyBottlenecks(traces: any[]): any[] {
    const durations = traces
      .filter((t) => t.duration_ms && t.duration_ms > 0)
      .map((t) => ({
        spanId: t.span_id,
        operationName: t.operation_name,
        duration: t.duration_ms,
      }))
      .sort((a, b) => b.duration - a.duration);

    return durations.slice(0, 5);
  }

  /**
   * Generate recommendations based on execution analysis
   */
  private generateRecommendations(execution: any, traces: any[]): string[] {
    const recommendations: string[] = [];

    if (execution.status === 'failed') {
      recommendations.push('Review error handling and retry logic');
      recommendations.push('Consider implementing circuit breaker pattern');
    }

    const avgDuration = traces.length > 0
      ? traces.reduce((sum, t) => sum + (t.duration_ms || 0), 0) / traces.length
      : 0;

    if (avgDuration > 5000) {
      recommendations.push('Consider optimizing slow operations');
      recommendations.push('Review database queries and external API calls');
    }

    return recommendations;
  }
}
