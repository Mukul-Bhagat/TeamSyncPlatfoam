import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { WebhookService } from './service';
import { AppError } from '../../shared/errors';
import type { WebhookRequest } from './types';

export async function webhookRoutes(fastify: FastifyInstance) {
  const webhookService = new WebhookService();

  // POST /webhooks/:integrationName - Receive webhook
  fastify.post('/webhooks/:integrationName', async (request: FastifyRequest<{ Params: { integrationName: string } }>, reply: FastifyReply) => {
    try {
      const organizationId = request.headers['x-organization-id'] as string;
      
      if (!organizationId) {
        return reply.status(400).send({ error: 'Missing x-organization-id header' });
      }

      const webhookRequest: WebhookRequest = {
        integrationName: request.params.integrationName,
        headers: request.headers as Record<string, string>,
        body: request.body as string,
      };

      const result = await webhookService.processWebhook(webhookRequest, organizationId);

      if (result.success) {
        return reply.status(200).send({
          success: true,
          event_id: result.event?.id,
        });
      } else {
        return reply.status(400).send({
          success: false,
          error: result.error,
        });
      }
    } catch (error) {
      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({ success: false, error: error.message, code: error.code });
      }
      return reply.status(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Webhook processing failed',
      });
    }
  });

  // GET /webhooks/:integrationName/config - Get webhook config (for testing)
  fastify.get('/webhooks/:integrationName/config', async (request: FastifyRequest<{ Params: { integrationName: string }; Querystring: { organization_id: string } }>, reply: FastifyReply) => {
    try {
      const { getIntegrationConfig } = await import('../../shared/database');
      const integration = await getIntegrationConfig(request.query.organization_id, request.params.integrationName);
      
      if (!integration) {
        return reply.status(404).send({ error: 'Integration not found' });
      }

      return reply.send({
        integration_name: integration.integration_name,
        enabled: integration.enabled,
        webhook_url: integration.webhook_url,
        health_status: integration.health_status,
        last_heartbeat: integration.last_heartbeat,
      });
    } catch (error) {
      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({ error: error.message, code: error.code });
      }
      return reply.status(500).send({ error: error instanceof Error ? error.message : 'Failed to get webhook config' });
    }
  });

  // POST /webhooks/:integrationName/test - Test webhook endpoint
  fastify.post('/webhooks/:integrationName/test', async (request: FastifyRequest<{ Params: { integrationName: string }; Querystring: { organization_id: string } }>, reply: FastifyReply) => {
    try {
      return reply.send({
        success: true,
        message: 'Webhook endpoint is reachable',
        integration_name: request.params.integrationName,
      });
    } catch (error) {
      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({ error: error.message, code: error.code });
      }
      return reply.status(500).send({ error: error instanceof Error ? error.message : 'Webhook test failed' });
    }
  });
}
