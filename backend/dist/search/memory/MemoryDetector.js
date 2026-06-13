"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryDetector = void 0;
const database_1 = require("../../shared/database");
class MemoryDetector {
    /**
     * Detect deployment patterns (repeated failures)
     */
    async detectDeploymentPattern(deploymentId, _organizationId) {
        // Fetch recent deployments for the same service
        const { data: deployment } = await database_1.supabase
            .from('deployments')
            .select('*')
            .eq('id', deploymentId)
            .single();
        if (!deployment || deployment.status !== 'failed') {
            return null;
        }
        // Check for repeated failures in the last 7 days
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const { data: recentDeployments } = await database_1.supabase
            .from('deployments')
            .select('*')
            .eq('service', deployment.service)
            .eq('status', 'failed')
            .gte('created_at', sevenDaysAgo);
        if (!recentDeployments || recentDeployments.length < 2) {
            return null;
        }
        return {
            memoryType: 'deployment_pattern',
            sourceEntityType: 'deployment',
            sourceEntityId: deploymentId,
            title: `Recurring Deployment Failure: ${deployment.service}`,
            content: `Service ${deployment.service} has failed ${recentDeployments.length} times in the last 7 days. Pattern detected in environment ${deployment.environment}.`,
            importanceScore: 0.8,
            metadata: {
                service: deployment.service,
                environment: deployment.environment,
                failure_count: recentDeployments.length,
                time_range: '7_days',
            },
        };
    }
    /**
     * Detect important incidents (critical severity)
     */
    async detectImportantIncident(incidentId, _organizationId) {
        const { data: incident } = await database_1.supabase
            .from('incidents')
            .select('*')
            .eq('id', incidentId)
            .single();
        if (!incident || incident.severity !== 'critical') {
            return null;
        }
        return {
            memoryType: 'important_incident',
            sourceEntityType: 'incident',
            sourceEntityId: incidentId,
            title: `Critical Incident: ${incident.title}`,
            content: incident.description || 'Critical incident detected with high impact on operations.',
            importanceScore: 0.95,
            metadata: {
                severity: incident.severity,
                status: incident.status,
                affected_services: incident.affected_services,
            },
        };
    }
    /**
     * Detect recurring issues (same incident pattern)
     */
    async detectRecurringIssue(incidentId, _organizationId) {
        const { data: incident } = await database_1.supabase
            .from('incidents')
            .select('*')
            .eq('id', incidentId)
            .single();
        if (!incident) {
            return null;
        }
        // Check for similar incidents in the last 30 days
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const { data: similarIncidents } = await database_1.supabase
            .from('incidents')
            .select('*')
            .ilike('title', `%${incident.title.split(' ').slice(0, 3).join(' ')}%`)
            .neq('id', incidentId)
            .gte('created_at', thirtyDaysAgo);
        if (!similarIncidents || similarIncidents.length < 2) {
            return null;
        }
        return {
            memoryType: 'recurring_issue',
            sourceEntityType: 'incident',
            sourceEntityId: incidentId,
            title: `Recurring Issue Pattern: ${incident.title}`,
            content: `Similar incident pattern has occurred ${similarIncidents.length + 1} times in the last 30 days. This suggests a recurring operational issue.`,
            importanceScore: 0.75,
            metadata: {
                pattern_title: incident.title,
                occurrence_count: similarIncidents.length + 1,
                time_range: '30_days',
            },
        };
    }
    /**
     * Create memory from high-severity AI insight
     */
    async detectAIMemory(insightId, _organizationId) {
        const { data: insight } = await database_1.supabase
            .from('ai_insights')
            .select('*')
            .eq('id', insightId)
            .single();
        if (!insight || insight.severity !== 'critical') {
            return null;
        }
        return {
            memoryType: 'ai_generated_memory',
            sourceEntityType: 'ai_insight',
            sourceEntityId: insightId,
            title: insight.title,
            content: insight.description,
            importanceScore: 0.85,
            metadata: {
                insight_type: insight.insight_type,
                severity: insight.severity,
                source_event_ids: insight.source_event_ids,
            },
        };
    }
    /**
     * Run all detection rules for an entity
     */
    async detectMemories(entityType, entityId, organizationId) {
        const candidates = [];
        switch (entityType) {
            case 'deployment':
                const deploymentPattern = await this.detectDeploymentPattern(entityId, organizationId);
                if (deploymentPattern)
                    candidates.push(deploymentPattern);
                break;
            case 'incident':
                const importantIncident = await this.detectImportantIncident(entityId, organizationId);
                if (importantIncident)
                    candidates.push(importantIncident);
                const recurringIssue = await this.detectRecurringIssue(entityId, organizationId);
                if (recurringIssue)
                    candidates.push(recurringIssue);
                break;
            case 'ai_insight':
                const aiMemory = await this.detectAIMemory(entityId, organizationId);
                if (aiMemory)
                    candidates.push(aiMemory);
                break;
        }
        return candidates;
    }
}
exports.MemoryDetector = MemoryDetector;
//# sourceMappingURL=MemoryDetector.js.map