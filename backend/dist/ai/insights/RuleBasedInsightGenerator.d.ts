import type { ContextData } from '../context/ContextEngine';
export declare class RuleBasedInsightGenerator {
    /**
     * Generate rule-based insights without AI
     * This is used for faster, deterministic insights
     */
    generateRuleBasedInsights(context: ContextData): Array<{
        type: string;
        severity: 'info' | 'warning' | 'critical';
        title: string;
        description: string;
    }>;
}
//# sourceMappingURL=RuleBasedInsightGenerator.d.ts.map