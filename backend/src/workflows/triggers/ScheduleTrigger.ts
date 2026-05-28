import type { ITrigger, TriggerMatchResult, TriggerMetadata } from './ITrigger';

export interface ScheduleTriggerConfig {
  schedule_expression: string; // cron expression
  timezone?: string;
  conditions?: ScheduleCondition[];
}

export interface ScheduleCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains';
  value?: unknown;
}

export class ScheduleTrigger implements ITrigger {
  private config: ScheduleTriggerConfig;
  private metadata: TriggerMetadata;
  private lastTriggerTime: Date | null = null;

  constructor(config: ScheduleTriggerConfig) {
    this.config = config;
    this.metadata = {
      type: 'schedule',
      config,
      enabled: true,
    };
  }

  async match(event?: unknown, context?: Record<string, unknown>): Promise<TriggerMatchResult> {
    const now = new Date();
    const timezone = this.config.timezone || 'UTC';

    // Simple cron-like evaluation (can be replaced with a proper cron library)
    const shouldTrigger = this.evaluateSchedule(now, this.config.schedule_expression);

    if (!shouldTrigger) {
      return { matched: false, reason: 'Schedule not due' };
    }

    // Check conditions
    if (this.config.conditions && this.config.conditions.length > 0) {
      const conditionsMatch = this.evaluateConditions(context || {}, this.config.conditions);
      if (!conditionsMatch) {
        return { matched: false, reason: 'Conditions not met' };
      }
    }

    this.lastTriggerTime = now;

    return {
      matched: true,
      context: {
        triggered_at: now.toISOString(),
        timezone,
        schedule_expression: this.config.schedule_expression,
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
    const cfg = config as ScheduleTriggerConfig;
    return !!(cfg.schedule_expression && typeof cfg.schedule_expression === 'string');
  }

  /**
   * Simple schedule evaluation
   * In production, use a proper cron library like node-cron
   */
  private evaluateSchedule(now: Date, expression: string): boolean {
    // Parse simple cron expressions: "*/5 * * * *" (every 5 minutes)
    const parts = expression.split(' ');
    if (parts.length !== 5) {
      return false;
    }

    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

    // Check minute
    if (minute !== '*' && !this.matchesCronPart(now.getMinutes(), minute)) {
      return false;
    }

    // Check hour
    if (hour !== '*' && !this.matchesCronPart(now.getHours(), hour)) {
      return false;
    }

    // Check day of month
    if (dayOfMonth !== '*' && !this.matchesCronPart(now.getDate(), dayOfMonth)) {
      return false;
    }

    // Check month
    if (month !== '*' && !this.matchesCronPart(now.getMonth() + 1, month)) {
      return false;
    }

    // Check day of week
    if (dayOfWeek !== '*' && !this.matchesCronPart(now.getDay(), dayOfWeek)) {
      return false;
    }

    return true;
  }

  private matchesCronPart(value: number, cronPart: string): boolean {
    if (cronPart === '*') return true;

    // Handle */n pattern (every n)
    if (cronPart.startsWith('*/')) {
      const interval = parseInt(cronPart.substring(2), 10);
      return value % interval === 0;
    }

    // Handle comma-separated values
    if (cronPart.includes(',')) {
      const values = cronPart.split(',').map((v) => parseInt(v.trim(), 10));
      return values.includes(value);
    }

    // Handle range
    if (cronPart.includes('-')) {
      const [start, end] = cronPart.split('-').map((v) => parseInt(v.trim(), 10));
      return value >= start && value <= end;
    }

    // Handle single value
    return value === parseInt(cronPart, 10);
  }

  private evaluateConditions(context: Record<string, unknown>, conditions: ScheduleCondition[]): boolean {
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
