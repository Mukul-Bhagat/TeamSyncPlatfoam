"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandTrigger = void 0;
class CommandTrigger {
    config;
    metadata;
    constructor(config) {
        this.config = config;
        this.metadata = {
            type: 'command',
            config: config,
            enabled: true,
        };
    }
    async match(_event, context) {
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
    async evaluate(event, context) {
        const result = await this.match(event, context);
        return result.matched;
    }
    getMetadata() {
        return this.metadata;
    }
    validate(config) {
        const cfg = config;
        return !!(cfg.command_name && typeof cfg.command_name === 'string');
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
            default:
                return false;
        }
    }
}
exports.CommandTrigger = CommandTrigger;
//# sourceMappingURL=CommandTrigger.js.map