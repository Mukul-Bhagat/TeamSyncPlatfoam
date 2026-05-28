"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiService = exports.AIService = void 0;
const AIOrchestrator_1 = require("../../ai/orchestrator/AIOrchestrator");
const InsightEngine_1 = require("../../ai/insights/InsightEngine");
const ContextEngine_1 = require("../../ai/context/ContextEngine");
const database_1 = require("../../shared/database");
class AIService {
    orchestrator;
    insightEngine;
    contextEngine;
    constructor() {
        this.orchestrator = new AIOrchestrator_1.AIOrchestrator();
        this.insightEngine = new InsightEngine_1.InsightEngine(this.orchestrator);
        this.contextEngine = new ContextEngine_1.ContextEngine();
    }
    /**
     * Generate a summary
     */
    async generateSummary(request) {
        const { summary_type, source_entity_id, organization_id, workspace_id, channel_id, metadata } = request;
        const result = await this.orchestrator.generateSummary({
            summaryType: summary_type,
            entityId: source_entity_id,
            organizationId: organization_id,
            workspaceId: workspace_id,
            channelId: channel_id,
            metadata,
        });
        // Fetch the created summary
        const { data: summary } = await database_1.supabase
            .from('ai_summaries')
            .select('*')
            .eq('id', result.id)
            .single();
        return summary;
    }
    /**
     * List summaries with filters
     */
    async listSummaries(filters) {
        let query = database_1.supabase
            .from('ai_summaries')
            .select('*')
            .eq('organization_id', filters.organization_id)
            .order('created_at', { ascending: false });
        if (filters.workspace_id) {
            query = query.eq('workspace_id', filters.workspace_id);
        }
        if (filters.channel_id) {
            query = query.eq('channel_id', filters.channel_id);
        }
        if (filters.summary_type) {
            query = query.eq('summary_type', filters.summary_type);
        }
        if (filters.limit) {
            query = query.limit(filters.limit);
        }
        const { data, error } = await query;
        if (error) {
            throw new Error(`Failed to list summaries: ${error.message}`);
        }
        return data || [];
    }
    /**
     * Get a specific summary
     */
    async getSummary(id) {
        const { data, error } = await database_1.supabase
            .from('ai_summaries')
            .select('*')
            .eq('id', id)
            .single();
        if (error) {
            throw new Error(`Failed to get summary: ${error.message}`);
        }
        return data;
    }
    /**
     * List insights with filters
     */
    async listInsights(filters) {
        let query = database_1.supabase
            .from('ai_insights')
            .select('*')
            .eq('organization_id', filters.organization_id)
            .order('created_at', { ascending: false });
        if (filters.workspace_id) {
            query = query.eq('workspace_id', filters.workspace_id);
        }
        if (filters.insight_type) {
            query = query.eq('insight_type', filters.insight_type);
        }
        if (filters.severity) {
            query = query.eq('severity', filters.severity);
        }
        if (filters.limit) {
            query = query.limit(filters.limit);
        }
        const { data, error } = await query;
        if (error) {
            throw new Error(`Failed to list insights: ${error.message}`);
        }
        return data || [];
    }
    /**
     * Generate an analysis (manual trigger for summary/insight)
     */
    async generateAnalysis(request) {
        const { entity_type, entity_id, organization_id, workspace_id, channel_id } = request;
        const result = {};
        // Build context
        let context;
        let summaryType;
        switch (entity_type) {
            case 'deployment':
                context = await this.contextEngine.buildDeploymentContext(entity_id);
                summaryType = 'deployment';
                break;
            case 'incident':
                context = await this.contextEngine.buildIncidentContext(entity_id);
                summaryType = 'incident';
                break;
            case 'workspace':
                context = await this.contextEngine.buildWorkspaceDigestContext(entity_id, new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
                summaryType = 'workspace_daily';
                break;
            default:
                throw new Error(`Unknown entity type: ${entity_type}`);
        }
        // Generate summary
        if (summaryType) {
            const summaryResult = await this.orchestrator.generateSummary({
                summaryType,
                entityId: entity_id,
                organizationId: organization_id,
                workspaceId: workspace_id,
                channelId: channel_id,
                metadata: { timeRange: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
            });
            // Fetch the created summary
            const { data: summary } = await database_1.supabase
                .from('ai_summaries')
                .select('*')
                .eq('id', summaryResult.id)
                .single();
            result.summary = summary;
        }
        // Generate insights
        const insights = await this.insightEngine.generateInsights(organization_id, workspace_id, context);
        result.insights = insights.map((i) => ({
            id: i.id,
            organization_id: organization_id,
            workspace_id: workspace_id,
            insight_type: i.title.includes('Risk') ? 'deployment_risk' : i.title.includes('Pattern') ? 'incident_pattern' : 'anomaly_detected',
            severity: i.severity,
            title: i.title,
            description: i.description,
            metadata: {},
            source_event_ids: context.events?.map((e) => e.id) || [],
            created_at: new Date().toISOString(),
        }));
        return result;
    }
}
exports.AIService = AIService;
exports.aiService = new AIService();
//# sourceMappingURL=service.js.map