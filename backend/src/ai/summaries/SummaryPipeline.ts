import { AIOrchestrator, type GenerateSummaryOptions } from '../orchestrator/AIOrchestrator';

export abstract class SummaryPipeline {
  protected orchestrator: AIOrchestrator;

  constructor(orchestrator: AIOrchestrator) {
    this.orchestrator = orchestrator;
  }

  abstract execute(options: GenerateSummaryOptions): Promise<{ id: string; content: string; title: string }>;

  protected buildBaseOptions(
    organizationId: string,
    workspaceId?: string,
    channelId?: string,
    metadata?: Record<string, unknown>
  ): Partial<GenerateSummaryOptions> {
    return {
      organizationId,
      workspaceId,
      channelId,
      metadata,
    };
  }
}
