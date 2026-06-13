import { SummaryPipeline } from './SummaryPipeline';
import type { GenerateSummaryOptions } from '../orchestrator/AIOrchestrator';
export declare class DeploymentSummaryPipeline extends SummaryPipeline {
    execute(options: GenerateSummaryOptions): Promise<{
        id: string;
        content: string;
        title: string;
    }>;
}
//# sourceMappingURL=DeploymentSummaryPipeline.d.ts.map