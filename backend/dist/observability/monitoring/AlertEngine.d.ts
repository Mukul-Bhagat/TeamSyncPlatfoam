/**
 * AlertEngine - Manages alert rules and incidents
 *
 * Handles alert rule lifecycle, incident creation, and alert triggering.
 * Foundation for operational alerting infrastructure.
 */
export interface AlertRule {
    id: string;
    ruleName: string;
    metricName: string;
    condition: string;
    threshold: number;
    severity: 'info' | 'warning' | 'critical';
    enabled: boolean;
    organizationId?: string;
    workspaceId?: string;
    createdBy?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface AlertIncident {
    id: string;
    ruleId: string;
    triggeredAt: Date;
    resolvedAt?: Date;
    acknowledgedAt?: Date;
    acknowledgedBy?: string;
    status: 'active' | 'resolved' | 'acknowledged';
    metadata: Record<string, unknown>;
    organizationId?: string;
    workspaceId?: string;
}
export declare class AlertEngine {
    private static instance;
    private supabase;
    private evaluator;
    private dispatcher;
    private evaluationInterval;
    private readonly EVALUATION_INTERVAL_MS;
    private constructor();
    static getInstance(): AlertEngine;
    /**
     * Create an alert rule
     */
    createRule(rule: Omit<AlertRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<AlertRule>;
    /**
     * Update an alert rule
     */
    updateRule(id: string, updates: Partial<Omit<AlertRule, 'id' | 'createdAt'>>): Promise<AlertRule>;
    /**
     * Delete an alert rule
     */
    deleteRule(id: string): Promise<void>;
    /**
     * Get alert rules
     */
    getRules(filters?: {
        organizationId?: string;
        workspaceId?: string;
        enabled?: boolean;
        severity?: string;
    }): Promise<AlertRule[]>;
    /**
     * Get alert incidents
     */
    getIncidents(filters?: {
        ruleId?: string;
        organizationId?: string;
        workspaceId?: string;
        status?: string;
        limit?: number;
    }): Promise<AlertIncident[]>;
    /**
     * Acknowledge an alert incident
     */
    acknowledgeIncident(incidentId: string, userId: string): Promise<void>;
    /**
     * Resolve an alert incident
     */
    resolveIncident(incidentId: string): Promise<void>;
    /**
     * Evaluate all enabled alert rules
     */
    evaluateRules(): Promise<void>;
    /**
     * Trigger an alert for a rule
     */
    private triggerAlert;
    /**
     * Start periodic rule evaluation
     */
    startPeriodicEvaluation(): void;
    /**
     * Stop periodic rule evaluation
     */
    stopPeriodicEvaluation(): void;
    /**
     * Get alert statistics
     */
    getStatistics(options?: {
        organizationId?: string;
        workspaceId?: string;
        timeRange?: {
            start: Date;
            end: Date;
        };
    }): Promise<{
        totalRules: number;
        activeRules: number;
        totalIncidents: number;
        activeIncidents: number;
        resolvedIncidents: number;
        bySeverity: Record<string, number>;
    }>;
}
//# sourceMappingURL=AlertEngine.d.ts.map