export interface SearchQuery {
    query: string;
    organizationId: string;
    workspaceId?: string;
    entityType?: string;
    limit?: number;
    useSemantic?: boolean;
}
export interface SearchResult {
    id: string;
    entityType: string;
    entityId: string;
    title: string;
    content: string;
    score: number;
    metadata: Record<string, unknown>;
    createdAt: string;
}
export declare class SearchEngine {
    private embeddingProvider;
    private vectorProvider;
    /**
     * Perform hybrid search (keyword + semantic)
     */
    search(query: SearchQuery): Promise<SearchResult[]>;
    /**
     * Keyword-only search using trigram matching
     */
    keywordSearch(query: string, organizationId: string, workspaceId?: string, entityType?: string, limit?: number): Promise<SearchResult[]>;
    /**
     * Semantic search using vector similarity
     */
    semanticSearch(query: string, organizationId: string, workspaceId?: string, entityType?: string, limit?: number): Promise<SearchResult[]>;
    /**
     * Merge and rank keyword and semantic results
     */
    private mergeAndRank;
    /**
     * Index a document
     */
    indexDocument(params: {
        entityType: string;
        entityId: string;
        organizationId: string;
        workspaceId?: string;
        title: string;
        content: string;
        searchableText: string;
        metadata?: Record<string, unknown>;
    }): Promise<void>;
    /**
     * Delete a document from search index
     */
    deleteDocument(entityType: string, entityId: string): Promise<void>;
}
//# sourceMappingURL=SearchEngine.d.ts.map