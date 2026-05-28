/**
 * AIOrchestratorIntegration - Integrates observability with AIOrchestrator
 *
 * Adds tracing, metrics, and token usage tracking to AI requests.
 */
export declare class AIOrchestratorIntegration {
    private static instance;
    private observabilityEngine;
    private organizationId?;
    private workspaceId?;
    private constructor();
    static getInstance(): AIOrchestratorIntegration;
    /**
     * Set organization context
     */
    setOrganizationContext(organizationId: string, workspaceId?: string): void;
    /**
     * Wrap AI request with observability
     */
    traceAIRequest(requestType: 'summary' | 'insight', requestFn: () => Promise<{
        tokenUsage?: number;
    }>, metadata?: Record<string, string>): Promise<{
        tokenUsage?: number;
    }>;
}
//# sourceMappingURL=AIOrchestratorIntegration.d.ts.map