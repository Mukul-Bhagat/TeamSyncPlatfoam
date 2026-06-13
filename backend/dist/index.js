"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables before any other imports
dotenv_1.default.config();
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const swagger_1 = __importDefault(require("@fastify/swagger"));
const swagger_ui_1 = __importDefault(require("@fastify/swagger-ui"));
const env_1 = require("./config/env");
const routes_1 = require("./modules/events/routes");
const routes_2 = require("./modules/integrations/routes");
const routes_3 = require("./modules/webhooks/routes");
const routes_4 = require("./modules/realtime/routes");
const routes_5 = require("./modules/ai/routes");
const routes_6 = require("./modules/search/routes");
const routes_7 = require("./modules/workflows/routes");
const routes_8 = require("./modules/collaboration/routes");
const activity_feed_handler_1 = require("./modules/events/handlers/activity-feed.handler");
const realtime_broadcast_handler_1 = require("./modules/events/handlers/realtime-broadcast.handler");
const notification_handler_1 = require("./modules/events/handlers/notification.handler");
const summary_trigger_handler_1 = require("./modules/ai/handlers/summary-trigger.handler");
const insight_generation_handler_1 = require("./modules/ai/handlers/insight-generation.handler");
const indexing_handler_1 = require("./modules/search/handlers/indexing.handler");
const handlers_1 = require("./modules/workflows/handlers");
const IndexingPipeline_1 = require("./search/indexing/IndexingPipeline");
const errors_1 = require("./shared/errors");
const event_bus_1 = require("./core/event-bus");
const fastify = (0, fastify_1.default)({
    logger: true,
});
// Global error handler
fastify.setErrorHandler((error, _request, reply) => {
    if (error instanceof errors_1.AppError) {
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
    await fastify.register(cors_1.default, {
        origin: true,
        credentials: true,
    });
    await fastify.register(swagger_1.default, {
        openapi: {
            openapi: '3.0.0',
            info: {
                title: 'TeamSync Event Bus API',
                description: 'Ecosystem event bus and integration infrastructure',
                version: '1.0.0',
            },
            servers: [
                {
                    url: `http://localhost:${env_1.env.PORT}`,
                    description: 'Development server',
                },
            ],
        },
    });
    await fastify.register(swagger_ui_1.default, {
        routePrefix: '/docs',
        uiConfig: {
            docExpansion: 'list',
            deepLinking: true,
        },
    });
}
// Wire event handlers
function wireEventHandlers() {
    (0, activity_feed_handler_1.registerActivityFeedHandler)();
    (0, realtime_broadcast_handler_1.registerRealtimeBroadcastHandler)();
    (0, notification_handler_1.registerNotificationHandler)();
    (0, summary_trigger_handler_1.registerSummaryTriggerHandler)();
    (0, insight_generation_handler_1.registerInsightGenerationHandler)();
    (0, indexing_handler_1.registerIndexingHandler)();
    (0, handlers_1.registerWorkflowEventHandlers)();
}
// Register routes
async function registerRoutes() {
    await fastify.register(routes_1.eventRoutes, { prefix: '/api' });
    await fastify.register(routes_2.integrationRoutes, { prefix: '/api' });
    await fastify.register(routes_3.webhookRoutes, { prefix: '/api' });
    await fastify.register(routes_4.realtimeRoutes, { prefix: '/api' });
    await fastify.register(routes_5.aiRoutes, { prefix: '/api' });
    await fastify.register(routes_6.searchRoutes, { prefix: '/api' });
    await fastify.register(routes_7.workflowRoutes, { prefix: '/api' });
    await fastify.register(routes_8.collaborationRoutes, { prefix: '/api' });
    // Health check endpoint
    fastify.get('/health', async () => {
        const eventBus = event_bus_1.InternalEventBus.getInstance();
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
        const indexingPipeline = IndexingPipeline_1.IndexingPipeline.getInstance();
        indexingPipeline.start();
        const port = parseInt(env_1.env.PORT, 10);
        const host = env_1.env.HOST;
        await fastify.listen({ port, host });
        console.log(`🚀 TeamSync Event Bus API running on http://${host}:${port}`);
        console.log(`📚 API Documentation available at http://${host}:${port}/docs`);
    }
    catch (err) {
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
//# sourceMappingURL=index.js.map