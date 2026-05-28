import dotenv from 'dotenv';

// Load environment variables before any other imports
dotenv.config();

import Fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import { env } from './config/env';
import { eventRoutes } from './modules/events/routes';
import { integrationRoutes } from './modules/integrations/routes';
import { webhookRoutes } from './modules/webhooks/routes';
import { realtimeRoutes } from './modules/realtime/routes';
import { aiRoutes } from './modules/ai/routes';
import { searchRoutes } from './modules/search/routes';
import { workflowRoutes } from './modules/workflows/routes';
import { registerActivityFeedHandler } from './modules/events/handlers/activity-feed.handler';
import { registerRealtimeBroadcastHandler } from './modules/events/handlers/realtime-broadcast.handler';
import { registerNotificationHandler } from './modules/events/handlers/notification.handler';
import { registerSummaryTriggerHandler } from './modules/ai/handlers/summary-trigger.handler';
import { registerInsightGenerationHandler } from './modules/ai/handlers/insight-generation.handler';
import { registerIndexingHandler } from './modules/search/handlers/indexing.handler';
import { registerWorkflowEventHandlers } from './modules/workflows/handlers';
import { IndexingPipeline } from './search/indexing/IndexingPipeline';
import { AppError } from './shared/errors';
import { InternalEventBus } from './core/event-bus';

const fastify = Fastify({
  logger: true,
});

// Global error handler
fastify.setErrorHandler((error, _request, reply) => {
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      error: error.message,
      code: error.code,
    });
  }
  fastify.log.error(error);
  return reply.status(500).send({
    error: error.message || 'Internal server error',
    code: 'INTERNAL_ERROR',
  });
});

// Register plugins
async function registerPlugins() {
  await fastify.register(cors, {
    origin: true,
    credentials: true,
  });

  await fastify.register(swagger, {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'TeamSync Event Bus API',
        description: 'Ecosystem event bus and integration infrastructure',
        version: '1.0.0',
      },
      servers: [
        {
          url: `http://localhost:${env.PORT}`,
          description: 'Development server',
        },
      ],
    },
  });

  await fastify.register(swaggerUI, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
  });
}

// Wire event handlers
function wireEventHandlers() {
  registerActivityFeedHandler();
  registerRealtimeBroadcastHandler();
  registerNotificationHandler();
  registerSummaryTriggerHandler();
  registerInsightGenerationHandler();
  registerIndexingHandler();
  registerWorkflowEventHandlers();
}

// Register routes
async function registerRoutes() {
  await fastify.register(eventRoutes, { prefix: '/api' });
  await fastify.register(integrationRoutes, { prefix: '/api' });
  await fastify.register(webhookRoutes, { prefix: '/api' });
  await fastify.register(realtimeRoutes, { prefix: '/api' });
  await fastify.register(aiRoutes, { prefix: '/api' });
  await fastify.register(searchRoutes, { prefix: '/api' });
  await fastify.register(workflowRoutes, { prefix: '/api' });

  // Health check endpoint
  fastify.get('/health', async () => {
    const eventBus = InternalEventBus.getInstance();
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      event_bus: eventBus.getMetrics(),
    };
  });

  // Root endpoint
  fastify.get('/', async () => {
    return {
      name: 'TeamSync Event Bus',
      version: '1.0.0',
      description: 'Ecosystem event bus and integration infrastructure',
      endpoints: {
        health: '/health',
        docs: '/docs',
        events: '/api/events',
        events_stats: '/api/events/stats',
        integrations: '/api/integrations',
        webhooks: '/api/webhooks/:integrationName',
        realtime: '/api/realtime/events',
      },
    };
  });
}

// Start server
async function start() {
  try {
    await registerPlugins();
    wireEventHandlers();
    await registerRoutes();

    // Start indexing pipeline
    const indexingPipeline = IndexingPipeline.getInstance();
    indexingPipeline.start();

    const port = parseInt(env.PORT, 10);
    const host = env.HOST;

    await fastify.listen({ port, host });

    console.log(`🚀 TeamSync Event Bus API running on http://${host}:${port}`);
    console.log(`📚 API Documentation available at http://${host}:${port}/docs`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await fastify.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  await fastify.close();
  process.exit(0);
});

start();
