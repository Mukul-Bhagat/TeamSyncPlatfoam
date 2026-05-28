"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventTrigger = void 0;
class EventTrigger {
    config;
    metadata;
    constructor(config) {
        this.config = config;
        this.metadata = {
            type: 'event',
            config,
            enabled: true,
        };
    }
    async match(event, context) {
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
    async evaluate(event, context) {
        const result = await this.match(event, context);
        return result.matched;
    }
    getMetadata() {
        return this.metadata;
    }
    validate(config) {
        const cfg = config;
        return !!(cfg.event_type && typeof cfg.event_type === 'string');
    }
    matchFilter(payload, filter) {
        for (const [key, value] of Object.entries(filter)) {
            if (payload[key] !== value) {
                return false;
            }
        }
        return true;
    }
    evaluateConditions(event, conditions) {
        for (const condition of conditions) {
            const fieldValue = this.getNestedValue(event, condition.field);
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
            case 'exists':
                return value !== undefined && value !== null;
            default:
                return false;
        }
    }
}
exports.EventTrigger = EventTrigger;
//# sourceMappingURL=EventTrigger.js.map