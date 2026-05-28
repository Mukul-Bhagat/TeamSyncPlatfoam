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

export class ManualTrigger implements ITrigger {
  private config: ManualTriggerConfig;
  private metadata: TriggerMetadata;

  constructor(config: ManualTriggerConfig) {
    this.config = config;
    this.metadata = {
      type: 'manual',
      config: config as Record<string, unknown>,
      enabled: true,
    };
  }

  async match(_event?: unknown, context?: Record<string, unknown>): Promise<TriggerMatchResult> {
    // Manual triggers are always matched when explicitly triggered
    // The actual authorization happens at the execution level

    // Check conditions if provided
    if (this.config.conditions && this.config.conditions.length > 0) {
      const conditionsMatch = this.evaluateConditions(context || {}, this.config.conditions);
      if (!conditionsMatch) {
        return { matched: false, reason: 'Conditions not met' };
      }
    }

    return {
      matched: true,
      context: {
        triggered_by: context?.user_id,
        triggered_at: new Date().toISOString(),
        require_confirmation: this.config.require_confirmation,
      },
    };
  }

  async evaluate(event?: unknown, context?: Record<string, unknown>): Promise<boolean> {
    const result = await this.match(event, context);
    return result.matched;
  }

  getMetadata(): TriggerMetadata {
    return this.metadata;
  }

  validate(_config: Record<string, unknown>): boolean {
    // Manual triggers have minimal validation
    return true;
  }

  private evaluateConditions(context: Record<string, unknown>, conditions: ManualCondition[]): boolean {
    for (const condition of conditions) {
      const fieldValue = this.getNestedValue(context, condition.field);
      if (!this.evaluateCondition(fieldValue, condition.operator, condition.value)) {
        return false;
      }
    }
    return true;
  }

  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce((current: unknown, key: string) => (current as Record<string, unknown>)?.[key], obj);
  }

  private evaluateCondition(value: unknown, operator: string, expected?: unknown): boolean {
    switch (operator) {
      case 'equals':
        return value === expected;
      case 'not_equals':
        return value !== expected;
      default:
        return false;
    }
  }
}
