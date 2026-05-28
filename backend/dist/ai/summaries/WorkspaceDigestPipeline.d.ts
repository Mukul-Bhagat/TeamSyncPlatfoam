import { SummaryPipeline } from './SummaryPipeline';
import { type GenerateSummaryOptions } from '../orchestrator/AIOrchestrator';
export declare class WorkspaceDigestPipeline extends SummaryPipeline {
    execute(options: GenerateSummaryOptions): Promise<{
        id: string;
        content: string;
        title: string;
    }>;
}
//# sourceMappingURL=WorkspaceDigestPipeline.d.ts.map