/**
 * NotificationDispatcher - Dispatches alert notifications
 *
 * Sends alert notifications through various channels.
 * Foundation for notification integration (in-app, email, webhook).
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { AlertRule } from './AlertEngine';
export declare class NotificationDispatcher {
    private supabase;
    private rateLimitTracker;
    private readonly RATE_LIMIT_WINDOW_MS;
    private readonly RATE_LIMIT_MAX;
    constructor(supabase: SupabaseClient);
    /**
     * Dispatch a notification for an alert
     */
    dispatch(rule: AlertRule, incidentId: string): Promise<void>;
    /**
     * Dispatch in-app notification
     */
    private dispatchInApp;
    /**
     * Check rate limit for a rule
     */
    private checkRateLimit;
    /**
     * Clear rate limit tracker (for testing)
     */
    clearRateLimitTracker(): void;
}
//# sourceMappingURL=NotificationDispatcher.d.ts.map