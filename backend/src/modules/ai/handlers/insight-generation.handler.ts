import { InternalEventBus } from '../../../core/event-bus';
import type { EcosystemEvent } from '../../../types';
import { AIOrchestrator } from '../../../ai/orchestrator/AIOrchestrator';
import { InsightEngine } from '../../../ai/insights/InsightEngine';
import { ContextEngine } from '../../../ai/context/ContextEngine';

const orchestrator = new AIOrchestrator();
const insightEngine = new InsightEngine(orchestrator);
const contextEngine = new ContextEngine();

export function registerInsightGenerationHandler() {
  const eventBus = InternalEventBus.getInstance();

  // Generate insights on deployment.failed
  eventBus.subscribe('deployment.failed', async (event: EcosystemEvent) => {
    try {
      const organizationId = event.organization_id;
      const workspaceId = event.workspace_id;

      if (organizationId) {
        // Build context for the workspace
        const context = await contextEngine.buildWorkspaceDigestContext(
          workspaceId || '',
          new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        );

        // Generate insights
        await insightEngine.generateInsights(organizationId, workspaceId, context);
      }
    } catch (error) {
      console.error('[InsightGenerationHandler] Failed to generate insights:', error);
    }
  });

  // Generate insights on incident.created (for critical incidents)
  eventBus.subscribe('incident.created', async (event: EcosystemEvent) => {
    try {
      const payload = event.payload as Record<string, unknown>;
      const severity = payload.severity as string;
      const organizationId = event.organization_id;
      const workspaceId = event.workspace_id;

      // Only generate insights for critical incidents
      if (severity === 'critical' && organizationId) {
        const context = await contextEngine.buildWorkspaceDigestContext(
          workspaceId || '',
          new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        );

        await insightEngine.generateInsights(organizationId, workspaceId, context);
      }
    } catch (error) {
      console.error('[InsightGenerationHandler] Failed to generate insights:', error);
    }
  });
}
