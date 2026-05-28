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

export class AITrigger implements ITrigger {
  private config: AITriggerConfig;
  private metadata: TriggerMetadata;

  constructor(config: AITriggerConfig) {
    this.config = config;
    this.metadata = {
      type: 'AI',
      config: config as Record<string, unknown>,
      enabled: true,
    };
  }

  async match(_event?: unknown, context?: Record<string, unknown>): Promise<TriggerMatchResult> {
    if (!context) {
      return { matched: false, reason: 'No context provided' };
    }

    // Check if this is an AI-generated insight
    const isAIInsight = context.ai_generated === true;
    if (!isAIInsight) {
      return { matched: false, reason: 'Not an AI-generated insight' };
    }

    // Check insight type if specified
    if (this.config.insight_type && context.insight_type !== this.config.insight_type) {
      return { matched: false, reason: 'Insight type mismatch' };
    }

    // Check confidence threshold if specified
    if (this.config.confidence_threshold && typeof context.confidence === 'number') {
      if (context.confidence < this.config.confidence_threshold) {
        return { matched: false, reason: 'Confidence below threshold' };
      }
    }

    // Check anomaly detection
    if (this.config.anomaly_detection && !context.is_anomaly) {
      return { matched: false, reason: 'Not an anomaly' };
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
        insight_type: context.insight_type,
        confidence: context.confidence,
        is_anomaly: context.is_anomaly,
        ai_model: context.ai_model,
        triggered_at: new Date().toISOString(),
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
    // AI triggers have minimal validation
    return true;
  }

  private evaluateConditions(context: Record<string, unknown>, conditions: AICondition[]): boolean {
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
      case 'contains':
        return typeof value === 'string' && value.includes(expected as string);
      case 'greater_than':
        return typeof value === 'number' && value > (expected as number);
      case 'less_than':
        return typeof value === 'number' && value < (expected as number);
      default:
        return false;
    }
  }
}
