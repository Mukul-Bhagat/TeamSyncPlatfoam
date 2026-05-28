import { api } from '@/lib/api';
import type {
  SearchRequest,
  SearchResponse,
  MemoryRequest,
  MemoryResponse,
  MemoryEntity,
} from '../types/search.types';

export const searchService = {
  /**
   * Perform hybrid search
   */
  async search(request: SearchRequest): Promise<SearchResponse> {
    return api.post('/search', request);
  },

  /**
   * Semantic-only search
   */
  async semanticSearch(request: SearchRequest): Promise<SearchResponse> {
    return api.post('/search/semantic', request);
  },

  /**
   * Search suggestions (keyword-only)
   */
  async getSuggestions(query: string, organizationId: string, workspaceId?: string): Promise<SearchResponse> {
    const params = new URLSearchParams({
      q: query,
      organization_id: organizationId,
    });
    if (workspaceId) {
      params.append('workspace_id', workspaceId);
    }
    return api.get(`/search/suggestions?${params.toString()}`);
  },

  /**
   * Retrieve memories
   */
  async getMemories(request: MemoryRequest): Promise<MemoryResponse> {
    const params = new URLSearchParams();
    Object.entries(request).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, String(value));
      }
    });
    return api.get(`/memory?${params.toString()}`);
  },

  /**
   * Get a specific memory
   */
  async getMemory(id: string): Promise<MemoryEntity> {
    return api.get(`/memory/${id}`);
  },

  /**
   * Semantic search for memories
   */
  async searchMemories(query: string, organizationId: string, workspaceId?: string, limit?: number): Promise<MemoryEntity[]> {
    const params = new URLSearchParams({
      q: query,
      organization_id: organizationId,
    });
    if (workspaceId) {
      params.append('workspace_id', workspaceId);
    }
    if (limit) {
      params.append('limit', String(limit));
    }
    return api.get(`/memory/search?${params.toString()}`);
  },

  /**
   * Delete a memory
   */
  async deleteMemory(id: string): Promise<{ success: boolean }> {
    return api.delete(`/memory/${id}`);
  },

  /**
   * Health check for search module
   */
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return api.get('/search/health');
  },
};
