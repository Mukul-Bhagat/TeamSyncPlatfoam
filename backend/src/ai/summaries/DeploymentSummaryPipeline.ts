import { SummaryPipeline } from './SummaryPipeline';
import type { GenerateSummaryOptions } from '../orchestrator/AIOrchestrator';

export class DeploymentSummaryPipeline extends SummaryPipeline {
  async execute(options: GenerateSummaryOptions): Promise<{ id: string; content: string; title: string }> {
    const { entityId, organizationId, workspaceId, metadata } = options;

    return await this.orchestrator.generateSummary({
      summaryType: 'deployment',
      entityId,
      organizationId,
      workspaceId,
      metadata: {
        ...metadata,
        version: (metadata?.payload as Record<string, unknown>)?.version as string,
        completed_at: (metadata?.payload as Record<string, unknown>)?.completed_at as string,
        error_message: (metadata?.payload as Record<string, unknown>)?.error_message as string,
      },
    });
  }
}
