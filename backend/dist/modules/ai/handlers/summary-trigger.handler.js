"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSummaryTriggerHandler = registerSummaryTriggerHandler;
const event_bus_1 = require("../../../core/event-bus");
const AIOrchestrator_1 = require("../../../ai/orchestrator/AIOrchestrator");
const DeploymentSummaryPipeline_1 = require("../../../ai/summaries/DeploymentSummaryPipeline");
const IncidentSummaryPipeline_1 = require("../../../ai/summaries/IncidentSummaryPipeline");
const orchestrator = new AIOrchestrator_1.AIOrchestrator();
const deploymentPipeline = new DeploymentSummaryPipeline_1.DeploymentSummaryPipeline(orchestrator);
const incidentPipeline = new IncidentSummaryPipeline_1.IncidentSummaryPipeline(orchestrator);
function registerSummaryTriggerHandler() {
    const eventBus = event_bus_1.InternalEventBus.getInstance();
    // Trigger deployment summary on deployment.completed
    eventBus.subscribe('deployment.completed', async (event) => {
        try {
            const payload = event.payload;
            const deploymentId = payload.deployment_id;
            const organizationId = event.organization_id;
            const workspaceId = event.workspace_id;
            if (deploymentId && organizationId) {
                await deploymentPipeline.execute({
                    summaryType: 'deployment',
                    entityId: deploymentId,
                    organizationId,
                    workspaceId,
                    metadata: { payload },
                });
            }
        }
        catch (error) {
            console.error('[SummaryTriggerHandler] Failed to generate deployment summary:', error);
        }
    });
    // Trigger incident summary on incident.resolved
    eventBus.subscribe('incident.resolved', async (event) => {
        try {
            const payload = event.payload;
            const incidentId = payload.incident_id;
            const organizationId = event.organization_id;
            const workspaceId = event.workspace_id;
            const channelId = payload.channel_id;
            if (incidentId && organizationId) {
                await incidentPipeline.execute({
                    summaryType: 'incident',
                    entityId: incidentId,
                    organizationId,
                    workspaceId,
                    channelId,
                    metadata: { payload },
                });
            }
        }
        catch (error) {
            console.error('[SummaryTriggerHandler] Failed to generate incident summary:', error);
        }
    });
}
//# sourceMappingURL=summary-trigger.handler.js.map