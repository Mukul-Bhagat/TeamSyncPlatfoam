"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerIndexingHandler = registerIndexingHandler;
const event_bus_1 = require("../../../core/event-bus");
const IndexingPipeline_1 = require("../../../search/indexing/IndexingPipeline");
const indexingPipeline = IndexingPipeline_1.IndexingPipeline.getInstance();
function registerIndexingHandler() {
    const eventBus = event_bus_1.InternalEventBus.getInstance();
    // Index messages on message.created
    eventBus.subscribe('message.created', async (event) => {
        try {
            const payload = event.payload;
            const messageId = payload.message_id;
            const organizationId = event.organization_id;
            const workspaceId = event.workspace_id;
            if (messageId && organizationId) {
                indexingPipeline.queueIndexing({
                    entityType: 'message',
                    entityId: messageId,
                    organizationId,
                    workspaceId,
                    priority: 5,
                });
            }
        }
        catch (error) {
            console.error('[IndexingHandler] Failed to queue message indexing:', error);
        }
    });
    // Index summaries on ai.summary.generated
    eventBus.subscribe('ai.summary.generated', async (event) => {
        try {
            const payload = event.payload;
            const summaryId = payload.summary_id;
            const organizationId = event.organization_id;
            const workspaceId = event.workspace_id;
            if (summaryId && organizationId) {
                indexingPipeline.queueIndexing({
                    entityType: 'summary',
                    entityId: summaryId,
                    organizationId,
                    workspaceId,
                    priority: 7, // Higher priority for AI summaries
                });
            }
        }
        catch (error) {
            console.error('[IndexingHandler] Failed to queue summary indexing:', error);
        }
    });
    // Index incidents on incident.created
    eventBus.subscribe('incident.created', async (event) => {
        try {
            const payload = event.payload;
            const incidentId = payload.incident_id;
            const organizationId = event.organization_id;
            const workspaceId = event.workspace_id;
            if (incidentId && organizationId) {
                indexingPipeline.queueIndexing({
                    entityType: 'incident',
                    entityId: incidentId,
                    organizationId,
                    workspaceId,
                    priority: 8, // High priority for incidents
                });
            }
        }
        catch (error) {
            console.error('[IndexingHandler] Failed to queue incident indexing:', error);
        }
    });
    // Index deployments on deployment.completed
    eventBus.subscribe('deployment.completed', async (event) => {
        try {
            const payload = event.payload;
            const deploymentId = payload.deployment_id;
            const organizationId = event.organization_id;
            const workspaceId = event.workspace_id;
            if (deploymentId && organizationId) {
                indexingPipeline.queueIndexing({
                    entityType: 'deployment',
                    entityId: deploymentId,
                    organizationId,
                    workspaceId,
                    priority: 6,
                });
            }
        }
        catch (error) {
            console.error('[IndexingHandler] Failed to queue deployment indexing:', error);
        }
    });
}
//# sourceMappingURL=indexing.handler.js.map