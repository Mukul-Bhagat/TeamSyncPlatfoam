/**
 * ExecutionDiagnostics - Analyzes workflow and AI execution patterns
 */
import type { SupabaseClient } from '@supabase/supabase-js';
export declare class ExecutionDiagnostics {
    private supabase;
    constructor(supabase: SupabaseClient);
    /**
     * Analyze workflow execution
     */
    analyzeWorkflowExecution(executionId: string): Promise<{
        execution: any;
        steps: any[];
        timeline: any[];
        bottlenecks: any[];
        recommendations: string[];
    }>;
    /**
     * Analyze AI request
     */
    analyzeAIRequest(requestId: string): Promise<{
        request: any;
        timeline: any[];
        tokenUsage: number;
        latency: number;
        recommendations: string[];
    }>;
    /**
     * Identify bottlenecks in execution
     */
    private identifyBottlenecks;
    /**
     * Generate recommendations based on execution analysis
     */
    private generateRecommendations;
}
//# sourceMappingURL=ExecutionDiagnostics.d.ts.map