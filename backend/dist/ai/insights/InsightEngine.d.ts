import { AIOrchestrator } from '../orchestrator/AIOrchestrator';
import type { ContextData } from '../context/ContextEngine';
export interface InsightRule {
    type: 'deployment_risk' | 'incident_pattern' | 'activity_spike' | 'anomaly_detected';
    condition: (context: ContextData) => boolean;
    severity: 'info' | 'warning' | 'critical';
    metadata?: Record<string, unknown>;
}
export declare class InsightEngine {
    private orchestrator;
    private ruleGenerator;
    private rules;
    constructor(orchestrator: AIOrchestrator);
    /**
     * Generate insights based on context
     */
    generateInsights(organizationId: string, workspaceId: string | undefined, context: ContextData): Promise<Array<{
        id: string;
        title: string;
        description: string;
        severity: string;
    }>>;
    /**
     * Initialize insight rules
     */
    private initializeRules;
}
//# sourceMappingURL=InsightEngine.d.ts.map