import { SummaryPipeline } from './SummaryPipeline';
import { AIOrchestrator, type GenerateSummaryOptions } from '../orchestrator/AIOrchestrator';

export class WorkspaceDigestPipeline extends SummaryPipeline {
  async execute(options: GenerateSummaryOptions): Promise<{ id: string; content: string; title: string }> {
    const { organizationId, workspaceId, metadata } = options;

    if (!workspaceId) {
      throw new Error('Workspace ID is required for workspace digest');
    }

    const timeRange = metadata?.timeRange as string || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    return await this.orchestrator.generateSummary({
      summaryType: 'workspace_daily',
      entityId: workspaceId,
      organizationId,
      workspaceId,
      metadata: {
        ...metadata,
        timeRange,
        date: new Date().toISOString().split('T')[0],
      },
    });
  }
}
