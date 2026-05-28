import type { MemoryCandidate } from './MemoryDetector';
export declare class MemoryStorage {
    private embeddingProvider;
    /**
     * Store a memory entity
     */
    storeMemory(candidate: MemoryCandidate, organizationId: string, workspaceId?: string): Promise<string>;
    /**
     * Retrieve memories for an organization
     */
    retrieveMemories(organizationId: string, workspaceId?: string, memoryType?: string, limit?: number): Promise<any[]>;
    /**
     * Get a specific memory by ID
     */
    getMemory(id: string): Promise<any>;
    /**
     * Delete a memory
     */
    deleteMemory(id: string): Promise<void>;
    /**
     * Semantic search for memories
     */
    semanticSearchMemories(query: string, organizationId: string, workspaceId?: string, limit?: number): Promise<any[]>;
}
//# sourceMappingURL=MemoryStorage.d.ts.map