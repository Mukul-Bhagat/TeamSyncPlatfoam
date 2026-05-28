"use strict";
/**
 * EventBusIntegration - Integrates observability with InternalEventBus
 *
 * Adds tracing, metrics, and dead letter persistence to the event bus.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventBusIntegration = void 0;
const ObservabilityEngine_1 = require("../ObservabilityEngine");
const DeadLetterManager_1 = require("../dead-letter/DeadLetterManager");
class EventBusIntegration {
    static instance;
    observabilityEngine;
    deadLetterManager;
    organizationId;
    workspaceId;
    constructor() {
        this.observabilityEngine = ObservabilityEngine_1.ObservabilityEngine.getInstance();
        this.deadLetterManager = DeadLetterManager_1.DeadLetterManager.getInstance();
    }
    static getInstance() {
        if (!EventBusIntegration.instance) {
            EventBusIntegration.instance = new EventBusIntegration();
        }
        return EventBusIntegration.instance;
    }
    /**
     * Set organization context
     */
    setOrganizationContext(organizationId, workspaceId) {
        this.organizationId = organizationId;
        this.workspaceId = workspaceId;
        this.observabilityEngine.setOrganizationContext(organizationId, workspaceId);
    }
    /**
     * Wrap event publish with observability
     */
    async tracePublish(eventType, publishFn, event) {
        const spanId = this.observabilityEngine.startSpan(`eventbus.publish.${eventType}`);
        const startTime = Date.now();
        try {
            await publishFn();
            const duration = Date.now() - startTime;
            await this.observabilityEngine.endSpan(spanId, 'success', { eventType });
            await this.observabilityEngine.recordEventBusPublish(duration, {
                event_type: eventType,
                source_app: event.source_app,
            });
        }
        catch (error) {
            const duration = Date.now() - startTime;
            await this.observabilityEngine.endSpan(spanId, 'failed', {
                eventType,
                error: error instanceof Error ? error.message : String(error),
            });
            await this.observabilityEngine.recordEventBusDrop({
                event_type: eventType,
                source_app: event.source_app,
            });
            // Add to dead letter manager
            await this.deadLetterManager.addDeadLetter('EventBus', event, error instanceof Error ? error.message : String(error), this.organizationId, this.workspaceId);
            throw error;
        }
    }
    /**
     * Get observability-enhanced event bus metrics
     */
    async getEnhancedMetrics() {
        const deadLetterStats = await this.deadLetterManager.getStatistics({
            organizationId: this.organizationId,
            workspaceId: this.workspaceId,
        });
        return {
            deadLetters: deadLetterStats,
        };
    }
}
exports.EventBusIntegration = EventBusIntegration;
//# sourceMappingURL=EventBusIntegration.js.map