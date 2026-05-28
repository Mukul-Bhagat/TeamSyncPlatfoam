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

export class EventTrigger implements ITrigger {
  private config: EventTriggerConfig;
  private metadata: TriggerMetadata;

  constructor(config: EventTriggerConfig) {
    this.config = config;
    this.metadata = {
      type: 'event',
      config,
      enabled: true,
    };
  }

  async match(event?: EcosystemEvent, context?: Record<string, unknown>): Promise<TriggerMatchResult> {
    if (!event) {
      return { matched: false, reason: 'No event provided' };
    }

    // Check event type
    if (event.event_type !== this.config.event_type) {
      return { matched: false, reason: 'Event type mismatch' };
    }

    // Check event filter
    if (this.config.event_filter) {
      const filterMatch = this.matchFilter(event.payload, this.config.event_filter);
      if (!filterMatch) {
        return { matched: false, reason: 'Event filter not matched' };
      }
    }

    // Check conditions
    if (this.config.conditions && this.config.conditions.length > 0) {
      const conditionsMatch = this.evaluateConditions(event, this.config.conditions);
      if (!conditionsMatch) {
        return { matched: false, reason: 'Conditions not met' };
      }
    }

    return {
      matched: true,
      context: {
        event_id: event.id,
        event_type: event.event_type,
        payload: event.payload,
        metadata: event.metadata,
      },
    };
  }

  async evaluate(event?: EcosystemEvent, context?: Record<string, unknown>): Promise<boolean> {
    const result = await this.match(event, context);
    return result.matched;
  }

  getMetadata(): TriggerMetadata {
    return this.metadata;
  }

  validate(config: Record<string, unknown>): boolean {
    const cfg = config as EventTriggerConfig;
    return !!(cfg.event_type && typeof cfg.event_type === 'string');
  }

  private matchFilter(payload: Record<string, unknown>, filter: Record<string, unknown>): boolean {
    for (const [key, value] of Object.entries(filter)) {
      if (payload[key] !== value) {
        return false;
      }
    }
    return true;
  }

  private evaluateConditions(event: EcosystemEvent, conditions: EventCondition[]): boolean {
    for (const condition of conditions) {
      const fieldValue = this.getNestedValue(event, condition.field);
      if (!this.evaluateCondition(fieldValue, condition.operator, condition.value)) {
        return false;
      }
    }
    return true;
  }

  private getNestedValue(obj: any, path: string): unknown {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private evaluateCondition(value: unknown, operator: string, expected?: unknown): boolean {
    switch (operator) {
      case 'equals':
        return value === expected;
      case 'not_equals':
        return value !== expected;
      case 'contains':
        return typeof value === 'string' && value.includes(expected as string);
      case 'greater_than':
        return typeof value === 'number' && value > (expected as number);
      case 'less_than':
        return typeof value === 'number' && value < (expected as number);
      case 'exists':
        return value !== undefined && value !== null;
      default:
        return false;
    }
  }
}
