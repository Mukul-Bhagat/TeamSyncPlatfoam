"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerInsightGenerationHandler = registerInsightGenerationHandler;
const event_bus_1 = require("../../../core/event-bus");
const AIOrchestrator_1 = require("../../../ai/orchestrator/AIOrchestrator");
const InsightEngine_1 = require("../../../ai/insights/InsightEngine");
const ContextEngine_1 = require("../../../ai/context/ContextEngine");
const orchestrator = new AIOrchestrator_1.AIOrchestrator();
const insightEngine = new InsightEngine_1.InsightEngine(orchestrator);
const contextEngine = new ContextEngine_1.ContextEngine();
function registerInsightGenerationHandler() {
    const eventBus = event_bus_1.InternalEventBus.getInstance();
    // Generate insights on deployment.failed
    eventBus.subscribe('deployment.failed', async (event) => {
        try {
            const organizationId = event.organization_id;
            const workspaceId = event.workspace_id;
            if (organizationId) {
                // Build context for the workspace
                const context = await contextEngine.buildWorkspaceDigestContext(workspaceId || '', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
                // Generate insights
                await insightEngine.generateInsights(organizationId, workspaceId, context);
            }
        }
        catch (error) {
            console.error('[InsightGenerationHandler] Failed to generate insights:', error);
        }
    });
    // Generate insights on incident.created (for critical incidents)
    eventBus.subscribe('incident.created', async (event) => {
        try {
            const payload = event.payload;
            const severity = payload.severity;
            const organizationId = event.organization_id;
            const workspaceId = event.workspace_id;
            // Only generate insights for critical incidents
            if (severity === 'critical' && organizationId) {
                const context = await contextEngine.buildWorkspaceDigestContext(workspaceId || '', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
                await insightEngine.generateInsights(organizationId, workspaceId, context);
            }
        }
        catch (error) {
            console.error('[InsightGenerationHandler] Failed to generate insights:', error);
        }
    });
}
//# sourceMappingURL=insight-generation.handler.js.map