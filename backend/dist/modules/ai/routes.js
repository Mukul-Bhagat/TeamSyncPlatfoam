"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiRoutes = aiRoutes;
const service_1 = require("./service");
async function aiRoutes(fastify) {
    /**
     * Generate a summary
     */
    fastify.post('/ai/summarize', async (request, reply) => {
        const body = request.body;
        const summary = await service_1.aiService.generateSummary(body);
        return reply.send(summary);
    });
    /**
     * List summaries
     */
    fastify.get('/ai/summaries', async (request, reply) => {
        const query = request.query;
        const summaries = await service_1.aiService.listSummaries({
            organization_id: query.organization_id,
            workspace_id: query.workspace_id,
            channel_id: query.channel_id,
            summary_type: query.summary_type,
            limit: query.limit ? parseInt(query.limit, 10) : undefined,
        });
        return reply.send(summaries);
    });
    /**
     * Get a specific summary
     */
    fastify.get('/ai/summaries/:id', async (request, reply) => {
        const { id } = request.params;
        const summary = await service_1.aiService.getSummary(id);
        return reply.send(summary);
    });
    /**
     * List insights
     */
    fastify.get('/ai/insights', async (request, reply) => {
        const query = request.query;
        const insights = await service_1.aiService.listInsights({
            organization_id: query.organization_id,
            workspace_id: query.workspace_id,
            insight_type: query.insight_type,
            severity: query.severity,
            limit: query.limit ? parseInt(query.limit, 10) : undefined,
        });
        return reply.send(insights);
    });
    /**
     * Generate analysis (manual trigger)
     */
    fastify.post('/ai/analyze', async (request, reply) => {
        const body = request.body;
        const result = await service_1.aiService.generateAnalysis(body);
        return reply.send(result);
    });
    /**
     * Health check for AI module
     */
    fastify.get('/ai/health', async (_request, reply) => {
        return reply.send({ status: 'ok', timestamp: new Date().toISOString() });
    });
}
//# sourceMappingURL=routes.js.map