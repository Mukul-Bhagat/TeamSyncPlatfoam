import type { ITrigger, TriggerMatchResult, TriggerMetadata } from './ITrigger';
export interface CommandTriggerConfig {
    command_name: string;
    require_capability?: string;
    conditions?: CommandCondition[];
}
export interface CommandCondition {
    field: string;
    operator: 'equals' | 'not_equals' | 'contains';
    value?: unknown;
}
export declare class CommandTrigger implements ITrigger {
    private config;
    private metadata;
    constructor(config: CommandTriggerConfig);
    match(event?: unknown, context?: Record<string, unknown>): Promise<TriggerMatchResult>;
    evaluate(event?: unknown, context?: Record<string, unknown>): Promise<boolean>;
    getMetadata(): TriggerMetadata;
    validate(config: Record<string, unknown>): boolean;
    private evaluateConditions;
    private getNestedValue;
    private evaluateCondition;
}
//# sourceMappingURL=CommandTrigger.d.ts.map