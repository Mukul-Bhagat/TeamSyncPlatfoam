export interface ContextData {
    messages?: Array<{
        id: string;
        content: string;
        author: string;
        timestamp: string;
    }>;
    events?: Array<{
        id: string;
        event_type: string;
        payload: Record<string, unknown>;
        timestamp: string;
    }>;
    incidents?: Array<{
        id: string;
        title: string;
        severity: string;
        status: string;
        created_at: string;
    }>;
    deployments?: Array<{
        id: string;
        service: string;
        environment: string;
        status: string;
        created_at: string;
    }>;
    activity?: Array<{
        id: string;
        event_type: string;
        title: string;
        description?: string;
        created_at: string;
    }>;
    workspace?: {
        id: string;
        name: string;
        description?: string;
    };
    channel?: {
        id: string;
        name: string;
        type: string;
    };
}
export interface ContextOptions {
    maxMessages?: number;
    maxEvents?: number;
    maxIncidents?: number;
    maxDeployments?: number;
    maxActivity?: number;
    timeRange?: string;
}
export declare class ContextEngine {
    /**
     * Build context for deployment summary
     */
    buildDeploymentContext(deploymentId: string, options?: ContextOptions): Promise<ContextData>;
    /**
     * Build context for incident analysis
     */
    buildIncidentContext(incidentId: string, options?: ContextOptions): Promise<ContextData>;
    /**
     * Build context for workspace daily digest
     */
    buildWorkspaceDigestContext(workspaceId: string, timeRange: string, options?: ContextOptions): Promise<ContextData>;
    /**
     * Build context for activity digest
     */
    buildActivityDigestContext(organizationId: string, filters: {
        workspace_id?: string;
        channel_id?: string;
        timeRange: string;
    }, options?: ContextOptions): Promise<ContextData>;
    /**
     * Helper: Get workspace context
     */
    private getWorkspaceContext;
    /**
     * Format context as structured text for AI prompts
     */
    formatContextForPrompt(context: ContextData): string;
}
//# sourceMappingURL=ContextEngine.d.ts.map