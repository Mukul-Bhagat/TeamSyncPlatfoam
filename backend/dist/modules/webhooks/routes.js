"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhookRoutes = webhookRoutes;
const service_1 = require("./service");
const errors_1 = require("../../shared/errors");
async function webhookRoutes(fastify) {
    const webhookService = new service_1.WebhookService();
    // POST /webhooks/:integrationName - Receive webhook
    fastify.post('/webhooks/:integrationName', async (request, reply) => {
        try {
            const organizationId = request.headers['x-organization-id'];
            if (!organizationId) {
                return reply.status(400).send({ error: 'Missing x-organization-id header' });
            }
            const webhookRequest = {
                integrationName: request.params.integrationName,
                headers: request.headers,
                body: request.body,
            };
            const result = await webhookService.processWebhook(webhookRequest, organizationId);
            if (result.success) {
                return reply.status(200).send({
                    success: true,
                    event_id: result.event?.id,
                });
            }
            else {
                return reply.status(400).send({
                    success: false,
                    error: result.error,
                });
            }
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                return reply.status(error.statusCode).send({ success: false, error: error.message, code: error.code });
            }
            return reply.status(500).send({
                success: false,
                error: error instanceof Error ? error.message : 'Webhook processing failed',
            });
        }
    });
    // GET /webhooks/:integrationName/config - Get webhook config (for testing)
    fastify.get('/webhooks/:integrationName/config', async (request, reply) => {
        try {
            const { getIntegrationConfig } = await Promise.resolve().then(() => __importStar(require('../../shared/database')));
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
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                return reply.status(error.statusCode).send({ error: error.message, code: error.code });
            }
            return reply.status(500).send({ error: error instanceof Error ? error.message : 'Failed to get webhook config' });
        }
    });
    // POST /webhooks/:integrationName/test - Test webhook endpoint
    fastify.post('/webhooks/:integrationName/test', async (request, reply) => {
        try {
            return reply.send({
                success: true,
                message: 'Webhook endpoint is reachable',
                integration_name: request.params.integrationName,
            });
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                return reply.status(error.statusCode).send({ error: error.message, code: error.code });
            }
            return reply.status(500).send({ error: error instanceof Error ? error.message : 'Webhook test failed' });
        }
    });
}
//# sourceMappingURL=routes.js.map