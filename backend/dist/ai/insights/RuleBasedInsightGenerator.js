"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuleBasedInsightGenerator = void 0;
class RuleBasedInsightGenerator {
    /**
     * Generate rule-based insights without AI
     * This is used for faster, deterministic insights
     */
    generateRuleBasedInsights(context) {
        const insights = [];
        // Check deployment failure rate
        const deployments = context.deployments || [];
        const failedDeployments = deployments.filter((d) => d.status === 'failed');
        if (failedDeployments.length >= 2) {
            insights.push({
                type: 'deployment_risk',
                severity: 'warning',
                title: 'High Deployment Failure Rate',
                description: `${failedDeployments.length} deployments failed recently. Review deployment logs and rollback procedures.`,
            });
        }
        // Check for critical unresolved incidents
        const incidents = context.incidents || [];
        const criticalUnresolved = incidents.filter((i) => i.severity === 'critical' && i.status !== 'resolved');
        if (criticalUnresolved.length > 0) {
            insights.push({
                type: 'anomaly_detected',
                severity: 'critical',
                title: 'Critical Incident Unresolved',
                description: `${criticalUnresolved.length} critical incident(s) remain unresolved. Immediate attention required.`,
            });
        }
        // Check for activity spike
        const messages = context.messages || [];
        if (messages.length > 100) {
            insights.push({
                type: 'activity_spike',
                severity: 'info',
                title: 'Activity Spike Detected',
                description: `Unusual message volume: ${messages.length} messages in the monitored period.`,
            });
        }
        return insights;
    }
}
exports.RuleBasedInsightGenerator = RuleBasedInsightGenerator;
//# sourceMappingURL=RuleBasedInsightGenerator.js.map