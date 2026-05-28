/**
 * AlertEvaluator - Evaluates alert rules against metrics
 *
 * Performs threshold evaluation and rule-based alert triggering.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { AlertRule } from './AlertEngine';
export declare class AlertEvaluator {
    private supabase;
    constructor(supabase: SupabaseClient);
    /**
     * Evaluate an alert rule
     */
    evaluate(rule: AlertRule): Promise<boolean>;
    /**
     * Evaluate a condition against a threshold
     */
    private evaluateCondition;
    /**
     * Evaluate multiple rules at once
     */
    evaluateMultiple(rules: AlertRule[]): Promise<Map<string, boolean>>;
}
//# sourceMappingURL=AlertEvaluator.d.ts.map