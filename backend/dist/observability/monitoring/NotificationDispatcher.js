"use strict";
/**
 * NotificationDispatcher - Dispatches alert notifications
 *
 * Sends alert notifications through various channels.
 * Foundation for notification integration (in-app, email, webhook).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationDispatcher = void 0;
class NotificationDispatcher {
    supabase;
    rateLimitTracker = new Map();
    RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
    RATE_LIMIT_MAX = 10;
    constructor(supabase) {
        this.supabase = supabase;
    }
    /**
     * Dispatch a notification for an alert
     */
    async dispatch(rule, incidentId) {
        // Check rate limit
        if (!this.checkRateLimit(rule.id)) {
            return;
        }
        // Dispatch to in-app notification
        await this.dispatchInApp(rule, incidentId);
        // Future: Dispatch to email, webhook, etc.
    }
    /**
     * Dispatch in-app notification
     */
    async dispatchInApp(rule, incidentId) {
        try {
            // Create notification record
            const { error } = await this.supabase.from('notifications').insert({
                type: 'alert',
                title: `Alert: ${rule.ruleName}`,
                body: `Metric ${rule.metricName} has triggered alert condition ${rule.condition} ${rule.threshold}`,
                severity: rule.severity,
                organization_id: rule.organizationId,
                workspace_id: rule.workspaceId,
                metadata: {
                    ruleId: rule.id,
                    incidentId,
                    metricName: rule.metricName,
                    threshold: rule.threshold,
                },
            });
            if (error) {
                throw error;
            }
        }
        catch (error) {
            // Log but don't throw - notification failures shouldn't crash the dispatcher
        }
    }
    /**
     * Check rate limit for a rule
     */
    checkRateLimit(ruleId) {
        const now = Date.now();
        const windowStart = now - this.RATE_LIMIT_WINDOW_MS;
        const timestamps = this.rateLimitTracker.get(ruleId) || [];
        const recentTimestamps = timestamps.filter((ts) => ts > windowStart);
        if (recentTimestamps.length >= this.RATE_LIMIT_MAX) {
            return false;
        }
        recentTimestamps.push(now);
        this.rateLimitTracker.set(ruleId, recentTimestamps);
        return true;
    }
    /**
     * Clear rate limit tracker (for testing)
     */
    clearRateLimitTracker() {
        this.rateLimitTracker.clear();
    }
}
exports.NotificationDispatcher = NotificationDispatcher;
//# sourceMappingURL=NotificationDispatcher.js.map