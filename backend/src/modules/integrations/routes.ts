import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { IntegrationService } from './service';
import { AppError } from '../../shared/errors';
import type { CreateIntegrationRequest, UpdateIntegrationRequest } from './types';

export async function integrationRoutes(fastify: FastifyInstance) {
  const integrationService = new IntegrationService();

  // GET /integrations - List integrations
  fastify.get('/integrations', async (request: FastifyRequest<{ Querystring: { organization_id: string } }>, reply: FastifyReply) => {
    try {
      const integrations = await integrationService.listIntegrations(request.query.organization_id);
      return reply.send(integrations);
    } catch (error) {
      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({ error: error.message, code: error.code });
      }
      return reply.status(500).send({ error: error instanceof Error ? error.message : 'Failed to list integrations' });
    }
  });

  // GET /integrations/:name - Get specific integration
  fastify.get('/integrations/:name', async (request: FastifyRequest<{ Params: { name: string }; Querystring: { organization_id: string } }>, reply: FastifyReply) => {
    try {
      const integration = await integrationService.getIntegration(request.query.organization_id, request.params.name);
      if (!integration) {
        return reply.status(404).send({ error: 'Integration not found' });
      }
      return reply.send(integration);
    } catch (error) {
      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({ error: error.message, code: error.code });
      }
      return reply.status(500).send({ error: error instanceof Error ? error.message : 'Failed to get integration' });
    }
  });

  // POST /integrations - Create integration
  fastify.post('/integrations', async (request: FastifyRequest<{ Body: CreateIntegrationRequest }>, reply: FastifyReply) => {
    try {
      const integration = await integrationService.createIntegration(request.body);
      return reply.status(201).send(integration);
    } catch (error) {
      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({ error: error.message, code: error.code });
      }
      return reply.status(500).send({ error: error instanceof Error ? error.message : 'Failed to create integration' });
    }
  });

  // PUT /integrations/:id - Update integration
  fastify.put('/integrations/:id', async (request: FastifyRequest<{ Params: { id: string }; Body: UpdateIntegrationRequest }>, reply: FastifyReply) => {
    try {
      const integration = await integrationService.updateIntegration(request.params.id, request.body);
      return reply.send(integration);
    } catch (error) {
      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({ error: error.message, code: error.code });
      }
      return reply.status(500).send({ error: error instanceof Error ? error.message : 'Failed to update integration' });
    }
  });

  // DELETE /integrations/:id - Delete integration
  fastify.delete('/integrations/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      await integrationService.deleteIntegration(request.params.id);
      return reply.status(204).send();
    } catch (error) {
      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({ error: error.message, code: error.code });
      }
      return reply.status(500).send({ error: error instanceof Error ? error.message : 'Failed to delete integration' });
    }
  });

  // GET /integrations/:id/health - Get integration health
  fastify.get('/integrations/:id/health', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const health = await integrationService.getIntegrationHealthById(request.params.id);
      if (!health) {
        return reply.status(404).send({ error: 'Integration not found' });
      }
      return reply.send(health);
    } catch (error) {
      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({ error: error.message, code: error.code });
      }
      return reply.status(500).send({ error: error instanceof Error ? error.message : 'Failed to get integration health' });
    }
  });

  // POST /integrations/:name/heartbeat - Heartbeat endpoint
  fastify.post('/integrations/:name/heartbeat', async (request: FastifyRequest<{ Params: { name: string }; Querystring: { organization_id: string } }>, reply: FastifyReply) => {
    try {
      const result = await integrationService.heartbeat(request.query.organization_id, request.params.name);
      if (!result) {
        return reply.status(404).send({ error: 'Integration not found' });
      }
      return reply.send({ success: true, health_status: result.health_status, last_heartbeat: result.last_heartbeat });
    } catch (error) {
      if (error instanceof AppError) {
        return reply.status(error.statusCode).send({ error: error.message, code: error.code });
      }
      return reply.status(500).send({ error: error instanceof Error ? error.message : 'Failed to process heartbeat' });
    }
  });
}
