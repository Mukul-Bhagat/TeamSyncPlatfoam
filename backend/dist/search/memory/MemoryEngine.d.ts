export declare class MemoryEngine {
    private detector;
    private storage;
    constructor();
    /**
     * Detect and store memories for an entity
     */
    processEntity(entityType: string, entityId: string, organizationId: string, workspaceId?: string): Promise<string[]>;
    /**
     * Retrieve memories for an organization
     */
    retrieveMemories(organizationId: string, workspaceId?: string, memoryType?: string, limit?: number): Promise<any[]>;
    /**
     * Get a specific memory
     */
    getMemory(id: string): Promise<any>;
    /**
     * Semantic search for memories
     */
    semanticSearchMemories(query: string, organizationId: string, workspaceId?: string, limit?: number): Promise<any[]>;
    /**
     * Delete a memory
     */
    deleteMemory(id: string): Promise<void>;
}
//# sourceMappingURL=MemoryEngine.d.ts.map