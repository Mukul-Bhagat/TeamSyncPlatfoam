"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AITrigger = void 0;
class AITrigger {
    config;
    metadata;
    constructor(config) {
        this.config = config;
        this.metadata = {
            type: 'AI',
            config: config,
            enabled: true,
        };
    }
    async match(_event, context) {
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
    async evaluate(event, context) {
        const result = await this.match(event, context);
        return result.matched;
    }
    getMetadata() {
        return this.metadata;
    }
    validate(_config) {
        // AI triggers have minimal validation
        return true;
    }
    evaluateConditions(context, conditions) {
        for (const condition of conditions) {
            const fieldValue = this.getNestedValue(context, condition.field);
            if (!this.evaluateCondition(fieldValue, condition.operator, condition.value)) {
                return false;
            }
        }
        return true;
    }
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }
    evaluateCondition(value, operator, expected) {
        switch (operator) {
            case 'equals':
                return value === expected;
            case 'not_equals':
                return value !== expected;
            case 'contains':
                return typeof value === 'string' && value.includes(expected);
            case 'greater_than':
                return typeof value === 'number' && value > expected;
            case 'less_than':
                return typeof value === 'number' && value < expected;
            default:
                return false;
        }
    }
}
exports.AITrigger = AITrigger;
//# sourceMappingURL=AITrigger.js.map