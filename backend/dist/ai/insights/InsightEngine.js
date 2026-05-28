"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsightEngine = void 0;
const RuleBasedInsightGenerator_1 = require("./RuleBasedInsightGenerator");
class InsightEngine {
    orchestrator;
    ruleGenerator;
    rules = [];
    constructor(orchestrator) {
        this.orchestrator = orchestrator;
        this.ruleGenerator = new RuleBasedInsightGenerator_1.RuleBasedInsightGenerator();
        this.initializeRules();
    }
    /**
     * Generate insights based on context
     */
    async generateInsights(organizationId, workspaceId, context) {
        const insights = [];
        // Check rule-based insights first
        for (const rule of this.rules) {
            if (rule.condition(context)) {
                const insight = await this.orchestrator.generateInsight({
                    insightType: rule.type,
                    organizationId,
                    workspaceId,
                    contextData: context,
                    metadata: {
                        ...rule.metadata,
                        source_event_ids: context.events?.map((e) => e.id) || [],
                    },
                });
                insights.push(insight);
            }
        }
        return insights;
    }
    /**
     * Initialize insight rules
     */
    initializeRules() {
        // Rule: High deployment failure rate
        this.rules.push({
            type: 'deployment_risk',
            condition: (context) => {
                const deployments = context.deployments || [];
                const failedDeployments = deployments.filter((d) => d.status === 'failed');
                return failedDeployments.length >= 2;
            },
            severity: 'warning',
            metadata: {
                pattern_description: 'Multiple deployment failures detected',
                affected_entities: context.deployments?.map((d) => d.service).join(', ') || '',
            },
        });
        // Rule: Repeated incidents on same service
        this.rules.push({
            type: 'incident_pattern',
            condition: (context) => {
                const incidents = context.incidents || [];
                const serviceCounts = new Map();
                incidents.forEach((i) => {
                    const services = i.affected_services || [];
                    services.forEach((s) => {
                        serviceCounts.set(s, (serviceCounts.get(s) || 0) + 1);
                    });
                });
                return Array.from(serviceCounts.values()).some((count) => count >= 2);
            },
            severity: 'warning',
            metadata: {
                pattern_description: 'Repeated incidents affecting same services',
            },
        });
        // Rule: Activity spike (abnormal message volume)
        this.rules.push({
            type: 'activity_spike',
            condition: (context) => {
                const messages = context.messages || [];
                return messages.length > 100; // Threshold for spike
            },
            severity: 'info',
            metadata: {
                pattern_description: 'Unusual message activity detected',
                affected_entities: `${messages.length} messages`,
            },
        });
        // Rule: Critical incident without resolution
        this.rules.push({
            type: 'anomaly_detected',
            condition: (context) => {
                const incidents = context.incidents || [];
                return incidents.some((i) => i.severity === 'critical' && i.status !== 'resolved');
            },
            severity: 'critical',
            metadata: {
                pattern_description: 'Critical incident remains unresolved',
            },
        });
    }
}
exports.InsightEngine = InsightEngine;
//# sourceMappingURL=InsightEngine.js.map