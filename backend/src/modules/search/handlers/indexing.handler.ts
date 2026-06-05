import { InternalEventBus } from '../../../core/event-bus';
import type { EcosystemEvent } from '../../../types';
import { IndexingPipeline } from '../../../search/indexing/IndexingPipeline';

const indexingPipeline = IndexingPipeline.getInstance();

export function registerIndexingHandler() {
  const eventBus = InternalEventBus.getInstance();

  // Index messages on message.created
  eventBus.subscribe('message.created', async (event: EcosystemEvent) => {
    try {
      const payload = event.payload as Record<string, unknown>;
      const messageId = payload.message_id as string;
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
    } catch (error) {
      console.error('[IndexingHandler] Failed to queue message indexing:', error);
    }
  });

  // Index summaries on ai.summary.generated
  eventBus.subscribe('ai.summary.generated', async (event: EcosystemEvent) => {
    try {
      const payload = event.payload as Record<string, unknown>;
      const summaryId = payload.summary_id as string;
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
    } catch (error) {
      console.error('[IndexingHandler] Failed to queue summary indexing:', error);
    }
  });

  // Index incidents on incident.created
  eventBus.subscribe('incident.created', async (event: EcosystemEvent) => {
    try {
      const payload = event.payload as Record<string, unknown>;
      const incidentId = payload.incident_id as string;
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
    } catch (error) {
      console.error('[IndexingHandler] Failed to queue incident indexing:', error);
    }
  });

  // Index deployments on deployment.completed
  eventBus.subscribe('deployment.completed', async (event: EcosystemEvent) => {
    try {
      const payload = event.payload as Record<string, unknown>;
      const deploymentId = payload.deployment_id as string;
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
    } catch (error) {
      console.error('[IndexingHandler] Failed to queue deployment indexing:', error);
    }
  });
}
