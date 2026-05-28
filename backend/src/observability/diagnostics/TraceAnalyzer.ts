/**
 * TraceAnalyzer - Analyzes traces for performance and failure patterns
 */

import type { SupabaseClient } from '@supabase/supabase-js';

export class TraceAnalyzer {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  /**
   * Get all spans for a trace
   */
  async getTraceSpans(traceId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('system_traces')
      .select('*')
      .eq('trace_id', traceId)
      .order('started_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch trace spans: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Build trace tree from spans
   */
  buildTraceTree(spans: any[]): any {
    const spanMap = new Map();
    const rootSpans: any[] = [];

    // Create span nodes
    for (const span of spans) {
      spanMap.set(span.span_id, {
        ...span,
        children: [],
      });
    }

    // Build parent-child relationships
    for (const span of spans) {
      const node = spanMap.get(span.span_id);
      if (span.parent_span_id) {
        const parent = spanMap.get(span.parent_span_id);
        if (parent) {
          parent.children.push(node);
        }
      } else {
        rootSpans.push(node);
      }
    }

    return rootSpans;
  }

  /**
   * Calculate trace statistics
   */
  calculateTraceStatistics(spans: any[]): {
    totalSpans: number;
    totalDuration: number;
    avgDuration: number;
    failedSpans: number;
    successRate: number;
  } {
    const totalSpans = spans.length;
    const durations = spans.map((s) => s.duration_ms || 0).filter((d) => d > 0);
    const totalDuration = Math.max(...durations, 0);
    const avgDuration = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
    const failedSpans = spans.filter((s) => s.status === 'failed').length;
    const successRate = totalSpans > 0 ? ((totalSpans - failedSpans) / totalSpans) * 100 : 100;

    return {
      totalSpans,
      totalDuration,
      avgDuration,
      failedSpans,
      successRate,
    };
  }
}
