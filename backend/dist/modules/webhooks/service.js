"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookService = void 0;
const verifier_1 = require("./verifier");
const EventNormalizer_1 = require("../../core/normalization/EventNormalizer");
const database_1 = require("../../shared/database");
const event_bus_1 = require("../../core/event-bus");
const errors_1 = require("../../shared/errors");
class WebhookService {
    eventBus;
    rateLimits = new Map();
    rateLimitWindowMs = 60000; // 1 minute
    rateLimitMaxRequests = 100;
    constructor() {
        this.eventBus = event_bus_1.InternalEventBus.getInstance();
    }
    async processWebhook(request, organizationId) {
        try {
            // Rate limit check
            const rateLimitKey = `${organizationId}:${request.integrationName}`;
            if (this.isRateLimited(rateLimitKey)) {
                throw new errors_1.RateLimitError();
            }
            this.recordRequest(rateLimitKey);
            // Fetch integration config
            const integration = await (0, database_1.getIntegrationConfig)(organizationId, request.integrationName);
            if (!integration) {
                return { success: false, error: 'Integration not found or not configured' };
            }
            if (!integration.enabled) {
                return { success: false, error: 'Integration is disabled' };
            }
            // Verify webhook signature
            const verification = await verifier_1.WebhookVerifier.verify(request.body, request.headers, integration);
            if (!verification.valid) {
                await (0, database_1.updateIntegrationHealth)(integration.id, 'unhealthy');
                return { success: false, error: verification.error || 'Webhook verification failed' };
            }
            // Parse payload
            let payload;
            try {
                payload = JSON.parse(request.body);
            }
            catch {
                return { success: false, error: 'Invalid JSON payload' };
            }
            // Normalize event
            const normalizedEvent = EventNormalizer_1.EventNormalizer.normalize({ event_type: payload.event_type, event_version: payload.event_version, payload: payload.data }, {
                source_app: request.integrationName,
                organization_id: organizationId,
                severity: this.determineSeverity(payload.event_type),
            });
            // Create ecosystem event in database
            const ecosystemEvent = await (0, database_1.createEcosystemEvent)({
                source_app: normalizedEvent.source_app,
                organization_id: normalizedEvent.organization_id,
                workspace_id: normalizedEvent.workspace_id,
                channel_id: normalizedEvent.channel_id,
                event_type: normalizedEvent.event_type,
                event_version: normalizedEvent.event_version,
                payload: normalizedEvent.payload,
                metadata: normalizedEvent.metadata,
                severity: normalizedEvent.severity,
                correlation_id: normalizedEvent.correlation_id,
                triggered_by: normalizedEvent.triggered_by,
            });
            // Publish to event bus
            await this.eventBus.publish(ecosystemEvent);
            // Update integration health
            await (0, database_1.updateIntegrationHealth)(integration.id, 'healthy');
            return { success: true, event: ecosystemEvent };
        }
        catch (error) {
            if (error instanceof errors_1.AppError) {
                throw error;
            }
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
        }
    }
    isRateLimited(key) {
        const now = Date.now();
        const entry = this.rateLimits.get(key);
        if (!entry)
            return false;
        if (now - entry.windowStart > this.rateLimitWindowMs) {
            this.rateLimits.delete(key);
            return false;
        }
        return entry.count >= this.rateLimitMaxRequests;
    }
    recordRequest(key) {
        const now = Date.now();
        const entry = this.rateLimits.get(key);
        if (!entry || now - entry.windowStart > this.rateLimitWindowMs) {
            this.rateLimits.set(key, { count: 1, windowStart: now });
        }
        else {
            entry.count++;
        }
    }
    determineSeverity(eventType) {
        const criticalEvents = [
            'deployment.failed',
            'incident.created',
            'incident.escalated',
            'pipeline.failed',
            'analytics.alert',
        ];
        const warningEvents = [
            'deployment.started',
            'incident.resolved',
            'metrics.threshold',
        ];
        if (criticalEvents.includes(eventType))
            return 'critical';
        if (warningEvents.includes(eventType))
            return 'warning';
        return 'info';
    }
}
exports.WebhookService = WebhookService;
//# sourceMappingURL=service.js.map