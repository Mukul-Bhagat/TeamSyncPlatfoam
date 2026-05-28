import type { ITrigger, TriggerMatchResult, TriggerMetadata } from './ITrigger';
export interface ScheduleTriggerConfig {
    schedule_expression: string;
    timezone?: string;
    conditions?: ScheduleCondition[];
}
export interface ScheduleCondition {
    field: string;
    operator: 'equals' | 'not_equals' | 'contains';
    value?: unknown;
}
export declare class ScheduleTrigger implements ITrigger {
    private config;
    private metadata;
    private lastTriggerTime;
    constructor(config: ScheduleTriggerConfig);
    match(event?: unknown, context?: Record<string, unknown>): Promise<TriggerMatchResult>;
    evaluate(event?: unknown, context?: Record<string, unknown>): Promise<boolean>;
    getMetadata(): TriggerMetadata;
    validate(config: Record<string, unknown>): boolean;
    /**
     * Simple schedule evaluation
     * In production, use a proper cron library like node-cron
     */
    private evaluateSchedule;
    private matchesCronPart;
    private evaluateConditions;
    private getNestedValue;
    private evaluateCondition;
}
//# sourceMappingURL=ScheduleTrigger.d.ts.map