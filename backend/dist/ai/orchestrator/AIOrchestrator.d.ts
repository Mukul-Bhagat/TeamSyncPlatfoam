import { type ContextData, type ContextOptions } from '../context/ContextEngine';
export interface OrchestratorConfig {
    maxRetries?: number;
    retryDelayMs?: number;
    rateLimitPerMinute?: number;
    maxTokensPerRequest?: number;
}
export interface GenerateSummaryOptions {
    summaryType: 'deployment' | 'incident' | 'workspace_daily' | 'activity_digest';
    entityId: string;
    organizationId: string;
    workspaceId?: string;
    channelId?: string;
    contextOptions?: ContextOptions;
    metadata?: Record<string, unknown>;
}
export interface GenerateInsightOptions {
    insightType: 'anomaly_detected' | 'deployment_risk' | 'incident_pattern' | 'activity_spike';
    organizationId: string;
    workspaceId?: string;
    contextData?: ContextData;
    metadata?: Record<string, unknown>;
}
export declare class AIOrchestrator {
    private provider;
    private contextEngine;
    private config;
    private rateLimitTracker;
    constructor(config?: OrchestratorConfig);
    /**
     * Generate an AI summary
     */
    generateSummary(options: GenerateSummaryOptions): Promise<{
        id: string;
        content: string;
        title: string;
    }>;
    /**
     * Generate an AI insight
     */
    generateInsight(options: GenerateInsightOptions): Promise<{
        id: string;
        title: string;
        description: string;
        severity: string;
    }>;
    /**
     * Generate with retry logic
     */
    private generateWithRetry;
    /**
     * Check rate limit for organization
     */
    private checkRateLimit;
    /**
     * Get API key for provider
     */
    private getApiKey;
    /**
     * Build prompt variables for deployment summary
     */
    private buildDeploymentPromptVariables;
    /**
     * Build prompt variables for incident analysis
     */
    private buildIncidentPromptVariables;
    /**
     * Build prompt variables for workspace digest
     */
    private buildWorkspaceDigestPromptVariables;
    /**
     * Build prompt variables for activity digest
     */
    private buildActivityDigestPromptVariables;
    /**
     * Build prompt variables for insights
     */
    private buildInsightPromptVariables;
    /**
     * Build context for insight generation
     */
    private buildInsightContext;
    /**
     * Generate title for summary
     */
    private generateTitle;
    /**
     * Generate title for insight
     */
    private generateInsightTitle;
    /**
     * Determine severity based on insight type and content
     */
    private determineSeverity;
}
//# sourceMappingURL=AIOrchestrator.d.ts.map