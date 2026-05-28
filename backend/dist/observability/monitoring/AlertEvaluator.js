"use strict";
/**
 * AlertEvaluator - Evaluates alert rules against metrics
 *
 * Performs threshold evaluation and rule-based alert triggering.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertEvaluator = void 0;
class AlertEvaluator {
    supabase;
    constructor(supabase) {
        this.supabase = supabase;
    }
    /**
     * Evaluate an alert rule
     */
    async evaluate(rule) {
        // Get the latest metric value
        const { data, error } = await this.supabase
            .from('system_metrics')
            .select('value')
            .eq('metric_name', rule.metricName)
            .order('created_at', { ascending: false })
            .limit(1);
        if (error || !data || data.length === 0) {
            return false;
        }
        const value = data[0].value;
        // Evaluate condition
        return this.evaluateCondition(value, rule.condition, rule.threshold);
    }
    /**
     * Evaluate a condition against a threshold
     */
    evaluateCondition(value, condition, threshold) {
        switch (condition) {
            case 'greater_than':
                return value > threshold;
            case 'less_than':
                return value < threshold;
            case 'equals':
                return value === threshold;
            case 'not_equals':
                return value !== threshold;
            case 'greater_than_or_equals':
                return value >= threshold;
            case 'less_than_or_equals':
                return value <= threshold;
            default:
                return false;
        }
    }
    /**
     * Evaluate multiple rules at once
     */
    async evaluateMultiple(rules) {
        const results = new Map();
        for (const rule of rules) {
            const shouldTrigger = await this.evaluate(rule);
            results.set(rule.id, shouldTrigger);
        }
        return results;
    }
}
exports.AlertEvaluator = AlertEvaluator;
//# sourceMappingURL=AlertEvaluator.js.map