import { SummaryPipeline } from './SummaryPipeline';
import { AIOrchestrator, type GenerateSummaryOptions } from '../orchestrator/AIOrchestrator';

export class IncidentSummaryPipeline extends SummaryPipeline {
  async execute(options: GenerateSummaryOptions): Promise<{ id: string; content: string; title: string }> {
    const { entityId, organizationId, workspaceId, channelId, metadata } = options;

    return await this.orchestrator.generateSummary({
      summaryType: 'incident',
      entityId,
      organizationId,
      workspaceId,
      channelId,
      metadata: {
        ...metadata,
        resolved_at: (metadata?.payload as Record<string, unknown>)?.resolved_at as string,
        affected_services: (metadata?.payload as Record<string, unknown>)?.affected_services as string[],
        description: (metadata?.payload as Record<string, unknown>)?.description as string,
        resolution: (metadata?.payload as Record<string, unknown>)?.resolution as string,
      },
    });
  }
}
