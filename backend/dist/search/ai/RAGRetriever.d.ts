import type { SearchResult } from '../engine/SearchEngine';
export interface RAGContext {
    query: string;
    results: SearchResult[];
    contextText: string;
    metadata: {
        totalResults: number;
        entityTypes: string[];
        averageScore: number;
    };
}
export declare class RAGRetriever {
    private searchEngine;
    constructor();
    /**
     * Retrieve relevant context for RAG
     */
    retrieveContext(params: {
        query: string;
        organizationId: string;
        workspaceId?: string;
        entityType?: string;
        limit?: number;
    }): Promise<RAGContext>;
    /**
     * Build context text from search results
     */
    private buildContextText;
    /**
     * Retrieve context for a specific entity
     */
    retrieveEntityContext(entityType: string, entityId: string, organizationId: string, workspaceId?: string): Promise<RAGContext>;
    /**
     * Retrieve recent activity context
     */
    retrieveRecentContext(organizationId: string, workspaceId?: string, hours?: number): Promise<RAGContext>;
}
//# sourceMappingURL=RAGRetriever.d.ts.map