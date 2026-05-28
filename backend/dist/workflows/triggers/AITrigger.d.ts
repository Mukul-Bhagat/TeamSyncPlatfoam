import type { ITrigger, TriggerMatchResult, TriggerMetadata } from './ITrigger';
export interface AITriggerConfig {
    insight_type?: string;
    confidence_threshold?: number;
    anomaly_detection?: boolean;
    conditions?: AICondition[];
}
export interface AICondition {
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
    value?: unknown;
}
export declare class AITrigger implements ITrigger {
    private config;
    private metadata;
    constructor(config: AITriggerConfig);
    match(_event?: unknown, context?: Record<string, unknown>): Promise<TriggerMatchResult>;
    evaluate(event?: unknown, context?: Record<string, unknown>): Promise<boolean>;
    getMetadata(): TriggerMetadata;
    validate(_config: Record<string, unknown>): boolean;
    private evaluateConditions;
    private getNestedValue;
    private evaluateCondition;
}
//# sourceMappingURL=AITrigger.d.ts.map