/**
 * DiagnosticsEngine - Correlates traces and analyzes execution patterns
 *
 * Provides operational intelligence by analyzing traces across services.
 * Identifies failure modes, performance bottlenecks, and anomalies.
 */
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
export declare class DiagnosticsEngine {
    private static instance;
    private supabase;
    private traceAnalyzer;
    private executionDiagnostics;
    private constructor();
    static getInstance(): DiagnosticsEngine;
    /**
     * Generate a diagnostic report for a trace
     */
    generateDiagnosticReport(traceId: string): Promise<DiagnosticReport>;
    /**
     * Calculate summary statistics
     */
    private calculateSummary;
    /**
     * Build timeline of spans
     */
    private buildTimeline;
    /**
     * Identify failed spans
     */
    private identifyFailures;
    /**
     * Identify performance bottlenecks
     */
    private identifyBottlenecks;
    /**
     * Analyze patterns in the trace
     */
    private analyzePatterns;
    /**
     * Generate recommendations based on analysis
     */
    private generateRecommendations;
    /**
     * Get execution diagnostics for a workflow
     */
    getWorkflowExecutionDiagnostics(executionId: string): Promise<{
        execution: any;
        steps: any[];
        timeline: any[];
        bottlenecks: any[];
        recommendations: string[];
    }>;
    /**
     * Get execution diagnostics for an AI request
     */
    getAIRequestDiagnostics(requestId: string): Promise<{
        request: any;
        timeline: any[];
        tokenUsage: number;
        latency: number;
        recommendations: string[];
    }>;
    /**
     * Search for traces matching criteria
     */
    searchTraces(criteria: {
        serviceName?: string;
        operationName?: string;
        status?: string;
        minDuration?: number;
        maxDuration?: number;
        startTime?: Date;
        endTime?: Date;
        limit?: number;
    }): Promise<any[]>;
}
//# sourceMappingURL=DiagnosticsEngine.d.ts.map