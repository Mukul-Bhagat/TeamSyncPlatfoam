import { InternalEventBus } from '../../../core/event-bus';
import type { EcosystemEvent } from '../../../types';
import { AIOrchestrator } from '../../../ai/orchestrator/AIOrchestrator';
import { DeploymentSummaryPipeline } from '../../../ai/summaries/DeploymentSummaryPipeline';
import { IncidentSummaryPipeline } from '../../../ai/summaries/IncidentSummaryPipeline';

const orchestrator = new AIOrchestrator();
const deploymentPipeline = new DeploymentSummaryPipeline(orchestrator);
const incidentPipeline = new IncidentSummaryPipeline(orchestrator);

export function registerSummaryTriggerHandler() {
  const eventBus = InternalEventBus.getInstance();

  // Trigger deployment summary on deployment.completed
  eventBus.subscribe('deployment.completed', async (event: EcosystemEvent) => {
    try {
      const payload = event.payload as Record<string, unknown>;
      const deploymentId = payload.deployment_id as string;
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
    } catch (error) {
      console.error('[SummaryTriggerHandler] Failed to generate deployment summary:', error);
    }
  });

  // Trigger incident summary on incident.resolved
  eventBus.subscribe('incident.resolved', async (event: EcosystemEvent) => {
    try {
      const payload = event.payload as Record<string, unknown>;
      const incidentId = payload.incident_id as string;
      const organizationId = event.organization_id;
      const workspaceId = event.workspace_id;
      const channelId = payload.channel_id as string;

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
    } catch (error) {
      console.error('[SummaryTriggerHandler] Failed to generate incident summary:', error);
    }
  });
}
