import type { ITrigger, TriggerMatchResult, TriggerMetadata } from './ITrigger';
import type { EcosystemEvent } from '../../../types';
export interface EventTriggerConfig {
    event_type: string;
    event_filter?: Record<string, unknown>;
    conditions?: EventCondition[];
}
export interface EventCondition {
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'exists';
    value?: unknown;
}
export declare class EventTrigger implements ITrigger {
    private config;
    private metadata;
    constructor(config: EventTriggerConfig);
    match(event?: EcosystemEvent, context?: Record<string, unknown>): Promise<TriggerMatchResult>;
    evaluate(event?: EcosystemEvent, context?: Record<string, unknown>): Promise<boolean>;
    getMetadata(): TriggerMetadata;
    validate(config: Record<string, unknown>): boolean;
    private matchFilter;
    private evaluateConditions;
    private getNestedValue;
    private evaluateCondition;
}
//# sourceMappingURL=EventTrigger.d.ts.map