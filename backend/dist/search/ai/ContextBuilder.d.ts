import { type RAGContext } from './RAGRetriever';
export interface BuiltContext {
    ragContext: RAGContext;
    memoryContext?: any[];
    combinedContext: string;
    metadata: {
        ragResults: number;
        memoryResults: number;
        contextLength: number;
    };
}
export declare class ContextBuilder {
    private ragRetriever;
    private memoryEngine;
    constructor();
    /**
     * Build comprehensive context for AI operations
     */
    buildContext(params: {
        query: string;
        organizationId: string;
        workspaceId?: string;
        entityType?: string;
        includeMemories?: boolean;
        limit?: number;
    }): Promise<BuiltContext>;
    /**
     * Combine RAG and memory contexts
     */
    private combineContexts;
    /**
     * Build context for a specific entity (e.g., deployment, incident)
     */
    buildEntityContext(entityType: string, entityId: string, organizationId: string, workspaceId?: string): Promise<BuiltContext>;
    /**
     * Build recent activity context
     */
    buildRecentContext(organizationId: string, workspaceId?: string, hours?: number): Promise<BuiltContext>;
}
//# sourceMappingURL=ContextBuilder.d.ts.map