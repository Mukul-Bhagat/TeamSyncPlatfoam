import type { FastifyInstance } from 'fastify';
import { aiService } from './service';
import type { CreateSummaryRequest, GenerateAnalysisRequest } from './types';

export async function aiRoutes(fastify: FastifyInstance) {
  /**
   * Generate a summary
   */
  fastify.post('/ai/summarize', async (request, reply) => {
    const body = request.body as CreateSummaryRequest;
    const summary = await aiService.generateSummary(body);
    return reply.send(summary);
  });

  /**
   * List summaries
   */
  fastify.get('/ai/summaries', async (request, reply) => {
    const query = request.query as {
      organization_id: string;
      workspace_id?: string;
      channel_id?: string;
      summary_type?: string;
      limit?: string;
    };
    const summaries = await aiService.listSummaries({
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
    const { id } = request.params as { id: string };
    const summary = await aiService.getSummary(id);
    return reply.send(summary);
  });

  /**
   * List insights
   */
  fastify.get('/ai/insights', async (request, reply) => {
    const query = request.query as {
      organization_id: string;
      workspace_id?: string;
      insight_type?: string;
      severity?: string;
      limit?: string;
    };
    const insights = await aiService.listInsights({
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
    const body = request.body as GenerateAnalysisRequest;
    const result = await aiService.generateAnalysis(body);
    return reply.send(result);
  });

  /**
   * Health check for AI module
   */
  fastify.get('/ai/health', async (_request, reply) => {
    return reply.send({ status: 'ok', timestamp: new Date().toISOString() });
  });
}
