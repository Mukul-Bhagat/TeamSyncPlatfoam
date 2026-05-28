"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleTrigger = void 0;
class ScheduleTrigger {
    config;
    metadata;
    _lastTriggerTime = null;
    constructor(config) {
        this.config = config;
        this.metadata = {
            type: 'schedule',
            config: config,
            enabled: true,
        };
    }
    async match(_event, context) {
        const now = new Date();
        const timezone = this.config.timezone || 'UTC';
        // Simple cron-like evaluation (can be replaced with a proper cron library)
        const shouldTrigger = this.evaluateSchedule(now, this.config.schedule_expression);
        if (!shouldTrigger) {
            return { matched: false, reason: 'Schedule not due' };
        }
        // Prevent too frequent triggers
        if (this._lastTriggerTime) {
            const timeSinceLastTrigger = now.getTime() - this._lastTriggerTime.getTime();
            if (timeSinceLastTrigger < 1000) {
                return { matched: false, reason: 'Triggered too recently' };
            }
        }
        // Check conditions
        if (this.config.conditions && this.config.conditions.length > 0) {
            const conditionsMatch = this.evaluateConditions(context || {}, this.config.conditions);
            if (!conditionsMatch) {
                return { matched: false, reason: 'Conditions not met' };
            }
        }
        this._lastTriggerTime = now;
        return {
            matched: true,
            context: {
                triggered_at: now.toISOString(),
                timezone,
                schedule_expression: this.config.schedule_expression,
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
        return !!(cfg.schedule_expression && typeof cfg.schedule_expression === 'string');
    }
    /**
     * Simple schedule evaluation
     * In production, use a proper cron library like node-cron
     */
    evaluateSchedule(now, expression) {
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
    matchesCronPart(value, cronPart) {
        if (cronPart === '*')
            return true;
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
exports.ScheduleTrigger = ScheduleTrigger;
//# sourceMappingURL=ScheduleTrigger.js.map