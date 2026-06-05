import type { FastifyInstance } from 'fastify';
import { searchService } from './service';
import type { SearchRequest, MemoryRequest } from './types';

export async function searchRoutes(fastify: FastifyInstance) {
  /**
   * Hybrid search (keyword + semantic)
   */
  fastify.post('/search', async (request, reply) => {
    const body = request.body as SearchRequest;
    const results = await searchService.search(body);
    return reply.send(results);
  });

  /**
   * Semantic-only search
   */
  fastify.post('/search/semantic', async (request, reply) => {
    const body = request.body as SearchRequest;
    const results = await searchService.semanticSearch(body);
    return reply.send(results);
  });

  /**
   * Search suggestions (keyword-only for faster response)
   */
  fastify.get('/search/suggestions', async (request, reply) => {
    const query = request.query as { q: string; organization_id: string; workspace_id?: string };
    const results = await searchService.search({
      query: query.q,
      organization_id: query.organization_id,
      workspace_id: query.workspace_id,
      limit: 5,
      use_semantic: false,
    });
    return reply.send(results);
  });

  /**
   * List memories
   */
  fastify.get('/memory', async (request, reply) => {
    const query = request.query as MemoryRequest;
    const memories = await searchService.getMemories(query);
    return reply.send(memories);
  });

  /**
   * Get a specific memory
   */
  fastify.get('/memory/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const memory = await searchService.getMemory(id);
    return reply.send(memory);
  });

  /**
   * Semantic search for memories
   */
  fastify.get('/memory/search', async (request, reply) => {
    const query = request.query as { q: string; organization_id: string; workspace_id?: string; limit?: string };
    const memories = await searchService.searchMemories(
      query.q,
      query.organization_id,
      query.workspace_id,
      query.limit ? parseInt(query.limit, 10) : undefined
    );
    return reply.send(memories);
  });

  /**
   * Delete a memory
   */
  fastify.delete('/memory/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    await searchService.deleteMemory(id);
    return reply.send({ success: true });
  });

  /**
   * Health check for search module
   */
  fastify.get('/search/health', async (_request, reply) => {
    return reply.send({ status: 'ok', timestamp: new Date().toISOString() });
  });
}
