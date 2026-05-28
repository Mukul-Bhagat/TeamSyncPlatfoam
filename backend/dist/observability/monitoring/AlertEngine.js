"use strict";
/**
 * AlertEngine - Manages alert rules and incidents
 *
 * Handles alert rule lifecycle, incident creation, and alert triggering.
 * Foundation for operational alerting infrastructure.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertEngine = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const env_1 = require("../../config/env");
const AlertEvaluator_1 = require("./AlertEvaluator");
const NotificationDispatcher_1 = require("./NotificationDispatcher");
class AlertEngine {
    static instance;
    supabase;
    evaluator;
    dispatcher;
    evaluationInterval = null;
    EVALUATION_INTERVAL_MS = 60000; // 1 minute
    constructor() {
        this.supabase = (0, supabase_js_1.createClient)(env_1.env.SUPABASE_URL, env_1.env.SUPABASE_SERVICE_ROLE_KEY);
        this.evaluator = new AlertEvaluator_1.AlertEvaluator(this.supabase);
        this.dispatcher = new NotificationDispatcher_1.NotificationDispatcher(this.supabase);
    }
    static getInstance() {
        if (!AlertEngine.instance) {
            AlertEngine.instance = new AlertEngine();
        }
        return AlertEngine.instance;
    }
    /**
     * Create an alert rule
     */
    async createRule(rule) {
        const { data, error } = await this.supabase
            .from('alert_rules')
            .insert({
            rule_name: rule.ruleName,
            metric_name: rule.metricName,
            condition: rule.condition,
            threshold: rule.threshold,
            severity: rule.severity,
            enabled: rule.enabled,
            organization_id: rule.organizationId,
            workspace_id: rule.workspaceId,
            created_by: rule.createdBy,
        })
            .select()
            .single();
        if (error) {
            throw new Error(`Failed to create alert rule: ${error.message}`);
        }
        return {
            id: data.id,
            ruleName: data.rule_name,
            metricName: data.metric_name,
            condition: data.condition,
            threshold: data.threshold,
            severity: data.severity,
            enabled: data.enabled,
            organizationId: data.organization_id,
            workspaceId: data.workspace_id,
            createdBy: data.created_by,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
        };
    }
    /**
     * Update an alert rule
     */
    async updateRule(id, updates) {
        const updateData = {};
        if (updates.ruleName !== undefined)
            updateData.rule_name = updates.ruleName;
        if (updates.metricName !== undefined)
            updateData.metric_name = updates.metricName;
        if (updates.condition !== undefined)
            updateData.condition = updates.condition;
        if (updates.threshold !== undefined)
            updateData.threshold = updates.threshold;
        if (updates.severity !== undefined)
            updateData.severity = updates.severity;
        if (updates.enabled !== undefined)
            updateData.enabled = updates.enabled;
        const { data, error } = await this.supabase
            .from('alert_rules')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();
        if (error) {
            throw new Error(`Failed to update alert rule: ${error.message}`);
        }
        return {
            id: data.id,
            ruleName: data.rule_name,
            metricName: data.metric_name,
            condition: data.condition,
            threshold: data.threshold,
            severity: data.severity,
            enabled: data.enabled,
            organizationId: data.organization_id,
            workspaceId: data.workspace_id,
            createdBy: data.created_by,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
        };
    }
    /**
     * Delete an alert rule
     */
    async deleteRule(id) {
        const { error } = await this.supabase.from('alert_rules').delete().eq('id', id);
        if (error) {
            throw new Error(`Failed to delete alert rule: ${error.message}`);
        }
    }
    /**
     * Get alert rules
     */
    async getRules(filters) {
        let query = this.supabase.from('alert_rules').select('*');
        if (filters?.organizationId) {
            query = query.eq('organization_id', filters.organizationId);
        }
        if (filters?.workspaceId) {
            query = query.eq('workspace_id', filters.workspaceId);
        }
        if (filters?.enabled !== undefined) {
            query = query.eq('enabled', filters.enabled);
        }
        if (filters?.severity) {
            query = query.eq('severity', filters.severity);
        }
        const { data, error } = await query;
        if (error) {
            throw new Error(`Failed to fetch alert rules: ${error.message}`);
        }
        return (data || []).map((row) => ({
            id: row.id,
            ruleName: row.rule_name,
            metricName: row.metric_name,
            condition: row.condition,
            threshold: row.threshold,
            severity: row.severity,
            enabled: row.enabled,
            organizationId: row.organization_id,
            workspaceId: row.workspace_id,
            createdBy: row.created_by,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at),
        }));
    }
    /**
     * Get alert incidents
     */
    async getIncidents(filters) {
        let query = this.supabase
            .from('alert_incidents')
            .select('*')
            .order('triggered_at', { ascending: false });
        if (filters?.ruleId) {
            query = query.eq('rule_id', filters.ruleId);
        }
        if (filters?.organizationId) {
            query = query.eq('organization_id', filters.organizationId);
        }
        if (filters?.workspaceId) {
            query = query.eq('workspace_id', filters.workspaceId);
        }
        if (filters?.status) {
            query = query.eq('status', filters.status);
        }
        if (filters?.limit) {
            query = query.limit(filters.limit);
        }
        const { data, error } = await query;
        if (error) {
            throw new Error(`Failed to fetch alert incidents: ${error.message}`);
        }
        return (data || []).map((row) => ({
            id: row.id,
            ruleId: row.rule_id,
            triggeredAt: new Date(row.triggered_at),
            resolvedAt: row.resolved_at ? new Date(row.resolved_at) : undefined,
            acknowledgedAt: row.acknowledged_at ? new Date(row.acknowledged_at) : undefined,
            acknowledgedBy: row.acknowledged_by,
            status: row.status,
            metadata: row.metadata,
            organizationId: row.organization_id,
            workspaceId: row.workspace_id,
        }));
    }
    /**
     * Acknowledge an alert incident
     */
    async acknowledgeIncident(incidentId, userId) {
        const { error } = await this.supabase
            .from('alert_incidents')
            .update({
            status: 'acknowledged',
            acknowledged_at: new Date().toISOString(),
            acknowledged_by: userId,
        })
            .eq('id', incidentId);
        if (error) {
            throw new Error(`Failed to acknowledge incident: ${error.message}`);
        }
    }
    /**
     * Resolve an alert incident
     */
    async resolveIncident(incidentId) {
        const { error } = await this.supabase
            .from('alert_incidents')
            .update({
            status: 'resolved',
            resolved_at: new Date().toISOString(),
        })
            .eq('id', incidentId);
        if (error) {
            throw new Error(`Failed to resolve incident: ${error.message}`);
        }
    }
    /**
     * Evaluate all enabled alert rules
     */
    async evaluateRules() {
        const rules = await this.getRules({ enabled: true });
        for (const rule of rules) {
            try {
                const shouldTrigger = await this.evaluator.evaluate(rule);
                if (shouldTrigger) {
                    await this.triggerAlert(rule);
                }
            }
            catch (error) {
                // Log but don't throw - evaluation failures shouldn't crash the engine
            }
        }
    }
    /**
     * Trigger an alert for a rule
     */
    async triggerAlert(rule) {
        // Check for recent incident (deduplication)
        const { data: recentIncidents } = await this.supabase
            .from('alert_incidents')
            .select('*')
            .eq('rule_id', rule.id)
            .eq('status', 'active')
            .gte('triggered_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // Last 5 minutes
            .limit(1);
        if (recentIncidents && recentIncidents.length > 0) {
            return; // Already triggered recently
        }
        // Create incident
        const { data: incident, error } = await this.supabase
            .from('alert_incidents')
            .insert({
            rule_id: rule.id,
            status: 'active',
            organization_id: rule.organizationId,
            workspace_id: rule.workspaceId,
            metadata: {
                ruleName: rule.ruleName,
                metricName: rule.metricName,
                threshold: rule.threshold,
                severity: rule.severity,
            },
        })
            .select()
            .single();
        if (error) {
            throw new Error(`Failed to create alert incident: ${error.message}`);
        }
        // Dispatch notification
        await this.dispatcher.dispatch(rule, incident.id);
    }
    /**
     * Start periodic rule evaluation
     */
    startPeriodicEvaluation() {
        if (this.evaluationInterval) {
            return;
        }
        this.evaluationInterval = setInterval(async () => {
            await this.evaluateRules();
        }, this.EVALUATION_INTERVAL_MS);
    }
    /**
     * Stop periodic rule evaluation
     */
    stopPeriodicEvaluation() {
        if (this.evaluationInterval) {
            clearInterval(this.evaluationInterval);
            this.evaluationInterval = null;
        }
    }
    /**
     * Get alert statistics
     */
    async getStatistics(options) {
        let rulesQuery = this.supabase.from('alert_rules').select('*');
        let incidentsQuery = this.supabase.from('alert_incidents').select('*');
        if (options?.organizationId) {
            rulesQuery = rulesQuery.eq('organization_id', options.organizationId);
            incidentsQuery = incidentsQuery.eq('organization_id', options.organizationId);
        }
        if (options?.workspaceId) {
            rulesQuery = rulesQuery.eq('workspace_id', options.workspaceId);
            incidentsQuery = incidentsQuery.eq('workspace_id', options.workspaceId);
        }
        if (options?.timeRange) {
            incidentsQuery = incidentsQuery.gte('triggered_at', options.timeRange.start.toISOString()).lte('triggered_at', options.timeRange.end.toISOString());
        }
        const [{ data: rules }, { data: incidents }] = await Promise.all([
            rulesQuery,
            incidentsQuery,
        ]);
        const rulesList = rules || [];
        const incidentsList = incidents || [];
        const bySeverity = { info: 0, warning: 0, critical: 0 };
        for (const rule of rulesList) {
            bySeverity[rule.severity] = (bySeverity[rule.severity] || 0) + 1;
        }
        return {
            totalRules: rulesList.length,
            activeRules: rulesList.filter((r) => r.enabled).length,
            totalIncidents: incidentsList.length,
            activeIncidents: incidentsList.filter((i) => i.status === 'active').length,
            resolvedIncidents: incidentsList.filter((i) => i.status === 'resolved').length,
            bySeverity,
        };
    }
}
exports.AlertEngine = AlertEngine;
//# sourceMappingURL=AlertEngine.js.map