import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { searchService } from '../services/search.service';
import type { SearchRequest, MemoryRequest } from '../types/search.types';

/**
 * Hook for hybrid search
 */
export function useSearch(request: SearchRequest, enabled: boolean = true) {
  return useQuery({
    queryKey: ['search', request],
    queryFn: () => searchService.search(request),
    enabled: enabled && !!request.query && !!request.organization_id,
  });
}

/**
 * Hook for semantic search
 */
export function useSemanticSearch(request: SearchRequest, enabled: boolean = true) {
  return useQuery({
    queryKey: ['semantic-search', request],
    queryFn: () => searchService.semanticSearch(request),
    enabled: enabled && !!request.query && !!request.organization_id,
  });
}

/**
 * Hook for search suggestions
 */
export function useSearchSuggestions(query: string, organizationId: string, workspaceId?: string) {
  return useQuery({
    queryKey: ['search-suggestions', query, organizationId, workspaceId],
    queryFn: () => searchService.getSuggestions(query, organizationId, workspaceId),
    enabled: query.length >= 2 && !!organizationId,
  });
}

/**
 * Hook for memories
 */
export function useMemories(request: MemoryRequest) {
  return useQuery({
    queryKey: ['memories', request],
    queryFn: () => searchService.getMemories(request),
    enabled: !!request.organization_id,
  });
}

/**
 * Hook for a specific memory
 */
export function useMemory(id: string) {
  return useQuery({
    queryKey: ['memory', id],
    queryFn: () => searchService.getMemory(id),
    enabled: !!id,
  });
}

/**
 * Hook for semantic memory search
 */
export function useMemorySearch(query: string, organizationId: string, workspaceId?: string, limit?: number) {
  return useQuery({
    queryKey: ['memory-search', query, organizationId, workspaceId, limit],
    queryFn: () => searchService.searchMemories(query, organizationId, workspaceId, limit),
    enabled: query.length >= 2 && !!organizationId,
  });
}

/**
 * Hook for deleting a memory
 */
export function useDeleteMemory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => searchService.deleteMemory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memories'] });
    },
  });
}

/**
 * Hook for search health check
 */
export function useSearchHealth() {
  return useQuery({
    queryKey: ['search-health'],
    queryFn: () => searchService.healthCheck(),
    refetchInterval: 60000, // Check every minute
  });
}
