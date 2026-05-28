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

export class CommandTrigger implements ITrigger {
  private config: CommandTriggerConfig;
  private metadata: TriggerMetadata;

  constructor(config: CommandTriggerConfig) {
    this.config = config;
    this.metadata = {
      type: 'command',
      config,
      enabled: true,
    };
  }

  async match(event?: unknown, context?: Record<string, unknown>): Promise<TriggerMatchResult> {
    if (!context) {
      return { matched: false, reason: 'No context provided' };
    }

    // Check command name
    if (context.command_name !== this.config.command_name) {
      return { matched: false, reason: 'Command name mismatch' };
    }

    // Check conditions
    if (this.config.conditions && this.config.conditions.length > 0) {
      const conditionsMatch = this.evaluateConditions(context, this.config.conditions);
      if (!conditionsMatch) {
        return { matched: false, reason: 'Conditions not met' };
      }
    }

    return {
      matched: true,
      context: {
        command_name: context.command_name,
        command_args: context.command_args,
        executed_by: context.user_id,
        triggered_at: new Date().toISOString(),
        require_capability: this.config.require_capability,
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

  validate(config: Record<string, unknown>): boolean {
    const cfg = config as CommandTriggerConfig;
    return !!(cfg.command_name && typeof cfg.command_name === 'string');
  }

  private evaluateConditions(context: Record<string, unknown>, conditions: CommandCondition[]): boolean {
    for (const condition of conditions) {
      const fieldValue = this.getNestedValue(context, condition.field);
      if (!this.evaluateCondition(fieldValue, condition.operator, condition.value)) {
        return false;
      }
    }
    return true;
  }

  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
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
      default:
        return false;
    }
  }
}
