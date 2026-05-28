import type { CreateSummaryRequest, SummaryResponse, InsightResponse, GenerateAnalysisRequest } from './types';
export declare class AIService {
    private orchestrator;
    private insightEngine;
    private contextEngine;
    constructor();
    /**
     * Generate a summary
     */
    generateSummary(request: CreateSummaryRequest): Promise<SummaryResponse>;
    /**
     * List summaries with filters
     */
    listSummaries(filters: {
        organization_id: string;
        workspace_id?: string;
        channel_id?: string;
        summary_type?: string;
        limit?: number;
    }): Promise<SummaryResponse[]>;
    /**
     * Get a specific summary
     */
    getSummary(id: string): Promise<SummaryResponse>;
    /**
     * List insights with filters
     */
    listInsights(filters: {
        organization_id: string;
        workspace_id?: string;
        insight_type?: string;
        severity?: string;
        limit?: number;
    }): Promise<InsightResponse[]>;
    /**
     * Generate an analysis (manual trigger for summary/insight)
     */
    generateAnalysis(request: GenerateAnalysisRequest): Promise<{
        summary?: SummaryResponse;
        insights?: InsightResponse[];
    }>;
}
export declare const aiService: AIService;
//# sourceMappingURL=service.d.ts.map