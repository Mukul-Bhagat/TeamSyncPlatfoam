export interface StoredContext {
    id: string;
    organization_id: string;
    workspace_id?: string;
    context_type: string;
    entity_type: string;
    entity_id: string;
    content: string;
    metadata: Record<string, unknown>;
    created_at: string;
}
export declare class AIMemory {
    /**
     * Store context in ai_context_memory table
     */
    storeContext(organizationId: string, contextType: string, entityType: string, entityId: string, content: string, metadata?: Record<string, unknown>, workspaceId?: string): Promise<StoredContext>;
    /**
     * Retrieve context for an entity
     */
    retrieveContext(organizationId: string, entityType: string, entityId: string, limit?: number): Promise<StoredContext[]>;
    /**
     * Retrieve context by type
     */
    retrieveContextByType(organizationId: string, contextType: string, workspaceId?: string, limit?: number): Promise<StoredContext[]>;
    /**
     * Placeholder for semantic search (future vector DB integration)
     */
    semanticSearch(organizationId: string, query: string, limit?: number): Promise<StoredContext[]>;
    /**
     * Delete old context to manage storage
     */
    deleteOldContext(olderThanDays?: number): Promise<number>;
}
//# sourceMappingURL=AIMemory.d.ts.map