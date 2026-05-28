import type { ITrigger, TriggerMatchResult, TriggerMetadata } from './ITrigger';
export interface ManualTriggerConfig {
    require_confirmation?: boolean;
    allowed_roles?: string[];
    conditions?: ManualCondition[];
}
export interface ManualCondition {
    field: string;
    operator: 'equals' | 'not_equals';
    value?: unknown;
}
export declare class ManualTrigger implements ITrigger {
    private config;
    private metadata;
    constructor(config: ManualTriggerConfig);
    match(_event?: unknown, context?: Record<string, unknown>): Promise<TriggerMatchResult>;
    evaluate(event?: unknown, context?: Record<string, unknown>): Promise<boolean>;
    getMetadata(): TriggerMetadata;
    validate(_config: Record<string, unknown>): boolean;
    private evaluateConditions;
    private getNestedValue;
    private evaluateCondition;
}
//# sourceMappingURL=ManualTrigger.d.ts.map