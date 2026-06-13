"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchRoutes = searchRoutes;
const service_1 = require("./service");
async function searchRoutes(fastify) {
    /**
     * Hybrid search (keyword + semantic)
     */
    fastify.post('/search', async (request, reply) => {
        const body = request.body;
        const results = await service_1.searchService.search(body);
        return reply.send(results);
    });
    /**
     * Semantic-only search
     */
    fastify.post('/search/semantic', async (request, reply) => {
        const body = request.body;
        const results = await service_1.searchService.semanticSearch(body);
        return reply.send(results);
    });
    /**
     * Search suggestions (keyword-only for faster response)
     */
    fastify.get('/search/suggestions', async (request, reply) => {
        const query = request.query;
        const results = await service_1.searchService.search({
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
        const query = request.query;
        const memories = await service_1.searchService.getMemories(query);
        return reply.send(memories);
    });
    /**
     * Get a specific memory
     */
    fastify.get('/memory/:id', async (request, reply) => {
        const { id } = request.params;
        const memory = await service_1.searchService.getMemory(id);
        return reply.send(memory);
    });
    /**
     * Semantic search for memories
     */
    fastify.get('/memory/search', async (request, reply) => {
        const query = request.query;
        const memories = await service_1.searchService.searchMemories(query.q, query.organization_id, query.workspace_id, query.limit ? parseInt(query.limit, 10) : undefined);
        return reply.send(memories);
    });
    /**
     * Delete a memory
     */
    fastify.delete('/memory/:id', async (request, reply) => {
        const { id } = request.params;
        await service_1.searchService.deleteMemory(id);
        return reply.send({ success: true });
    });
    /**
     * Health check for search module
     */
    fastify.get('/search/health', async (_request, reply) => {
        return reply.send({ status: 'ok', timestamp: new Date().toISOString() });
    });
}
//# sourceMappingURL=routes.js.map