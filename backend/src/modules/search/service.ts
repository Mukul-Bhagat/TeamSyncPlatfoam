import { SearchEngine } from '../../search/engine/SearchEngine';
import { MemoryEngine } from '../../search/memory/MemoryEngine';
import type { SearchRequest, SearchResponse, MemoryRequest, MemoryResponse } from './types';

export class SearchService {
  private searchEngine: SearchEngine;
  private memoryEngine: MemoryEngine;

  constructor() {
    this.searchEngine = new SearchEngine();
    this.memoryEngine = new MemoryEngine();
  }

  /**
   * Perform hybrid search
   */
  async search(request: SearchRequest): Promise<SearchResponse> {
    const results = await this.searchEngine.search({
      query: request.query,
      organizationId: request.organization_id,
      workspaceId: request.workspace_id,
      entityType: request.entity_type,
      limit: request.limit || 10,
      useSemantic: request.use_semantic !== false,
    });

    return {
      results,
      total: results.length,
      query: request.query,
    };
  }

  /**
   * Semantic-only search
   */
  async semanticSearch(request: SearchRequest): Promise<SearchResponse> {
    const results = await this.searchEngine.search({
      query: request.query,
      organizationId: request.organization_id,
      workspaceId: request.workspace_id,
      entityType: request.entity_type,
      limit: request.limit || 10,
      useSemantic: true,
    });

    return {
      results,
      total: results.length,
      query: request.query,
    };
  }

  /**
   * Retrieve memories
   */
  async getMemories(request: MemoryRequest): Promise<MemoryResponse> {
    const memories = await this.memoryEngine.retrieveMemories(
      request.organization_id,
      request.workspace_id,
      request.memory_type,
      request.limit || 20
    );

    return {
      memories,
      total: memories.length,
    };
  }

  /**
   * Get a specific memory
   */
  async getMemory(id: string) {
    return this.memoryEngine.getMemory(id);
  }

  /**
   * Semantic search for memories
   */
  async searchMemories(query: string, organizationId: string, workspaceId?: string, limit?: number) {
    return this.memoryEngine.semanticSearchMemories(query, organizationId, workspaceId, limit);
  }

  /**
   * Delete a memory
   */
  async deleteMemory(id: string): Promise<void> {
    return this.memoryEngine.deleteMemory(id);
  }
}

export const searchService = new SearchService();
