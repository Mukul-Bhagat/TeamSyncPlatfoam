/**
 * TraceAnalyzer - Analyzes traces for performance and failure patterns
 */
import type { SupabaseClient } from '@supabase/supabase-js';
export declare class TraceAnalyzer {
    private supabase;
    constructor(supabase: SupabaseClient);
    /**
     * Get all spans for a trace
     */
    getTraceSpans(traceId: string): Promise<any[]>;
    /**
     * Build trace tree from spans
     */
    buildTraceTree(spans: any[]): any;
    /**
     * Calculate trace statistics
     */
    calculateTraceStatistics(spans: any[]): {
        totalSpans: number;
        totalDuration: number;
        avgDuration: number;
        failedSpans: number;
        successRate: number;
    };
}
//# sourceMappingURL=TraceAnalyzer.d.ts.map