import { AIOrchestrator, type GenerateSummaryOptions } from '../orchestrator/AIOrchestrator';
export declare abstract class SummaryPipeline {
    protected orchestrator: AIOrchestrator;
    constructor(orchestrator: AIOrchestrator);
    abstract execute(options: GenerateSummaryOptions): Promise<{
        id: string;
        content: string;
        title: string;
    }>;
    protected buildBaseOptions(organizationId: string, workspaceId?: string, channelId?: string, metadata?: Record<string, unknown>): Partial<GenerateSummaryOptions>;
}
//# sourceMappingURL=SummaryPipeline.d.ts.map