import type { SearchRequest, SearchResponse, MemoryRequest, MemoryResponse } from './types';
export declare class SearchService {
    private searchEngine;
    private memoryEngine;
    constructor();
    /**
     * Perform hybrid search
     */
    search(request: SearchRequest): Promise<SearchResponse>;
    /**
     * Semantic-only search
     */
    semanticSearch(request: SearchRequest): Promise<SearchResponse>;
    /**
     * Retrieve memories
     */
    getMemories(request: MemoryRequest): Promise<MemoryResponse>;
    /**
     * Get a specific memory
     */
    getMemory(id: string): Promise<any>;
    /**
     * Semantic search for memories
     */
    searchMemories(query: string, organizationId: string, workspaceId?: string, limit?: number): Promise<any[]>;
    /**
     * Delete a memory
     */
    deleteMemory(id: string): Promise<void>;
}
export declare const searchService: SearchService;
//# sourceMappingURL=service.d.ts.map