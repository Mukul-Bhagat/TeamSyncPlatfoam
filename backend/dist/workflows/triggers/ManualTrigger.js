"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManualTrigger = void 0;
class ManualTrigger {
    config;
    metadata;
    constructor(config) {
        this.config = config;
        this.metadata = {
            type: 'manual',
            config,
            enabled: true,
        };
    }
    async match(event, context) {
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
    async evaluate(event, context) {
        const result = await this.match(event, context);
        return result.matched;
    }
    getMetadata() {
        return this.metadata;
    }
    validate(config) {
        // Manual triggers have minimal validation
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
            default:
                return false;
        }
    }
}
exports.ManualTrigger = ManualTrigger;
//# sourceMappingURL=ManualTrigger.js.map