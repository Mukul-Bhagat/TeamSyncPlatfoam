import { SummaryPipeline } from './SummaryPipeline';
import type { GenerateSummaryOptions } from '../orchestrator/AIOrchestrator';
export declare class IncidentSummaryPipeline extends SummaryPipeline {
    execute(options: GenerateSummaryOptions): Promise<{
        id: string;
        content: string;
        title: string;
    }>;
}
//# sourceMappingURL=IncidentSummaryPipeline.d.ts.map