"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIOrchestrator = void 0;
const ProviderFactory_1 = require("../providers/ProviderFactory");
const ContextEngine_1 = require("../context/ContextEngine");
const PromptManager_1 = require("../prompts/PromptManager");
const env_1 = require("../../config/env");
const database_1 = require("../../shared/database");
class AIOrchestrator {
    provider;
    contextEngine;
    config;
    rateLimitTracker = new Map();
    constructor(config = {}) {
        this.config = {
            maxRetries: 3,
            retryDelayMs: 1000,
            rateLimitPerMinute: parseInt(env_1.env.AI_RATE_LIMIT_PER_MINUTE, 10),
            maxTokensPerRequest: parseInt(env_1.env.AI_MAX_TOKENS_PER_REQUEST, 10),
            ...config,
        };
        // Initialize AI provider
        const providerConfig = {
            apiKey: this.getApiKey(env_1.env.AI_PROVIDER),
            maxTokens: this.config.maxTokensPerRequest,
        };
        this.provider = ProviderFactory_1.ProviderFactory.create(env_1.env.AI_PROVIDER, providerConfig);
        // Initialize context engine
        this.contextEngine = new ContextEngine_1.ContextEngine();
        // Initialize prompt manager
        PromptManager_1.PromptManager.initialize();
    }
    /**
     * Generate an AI summary
     */
    async generateSummary(options) {
        const { summaryType, entityId, organizationId, workspaceId, channelId, contextOptions, metadata } = options;
        // Check rate limit
        this.checkRateLimit(organizationId);
        // Build context
        let context;
        let promptName;
        let promptVariables;
        switch (summaryType) {
            case 'deployment':
                context = await this.contextEngine.buildDeploymentContext(entityId, contextOptions);
                promptName = 'deployment/summary';
                promptVariables = this.buildDeploymentPromptVariables(context, metadata);
                break;
            case 'incident':
                context = await this.contextEngine.buildIncidentContext(entityId, contextOptions);
                promptName = 'incidents/analysis';
                promptVariables = this.buildIncidentPromptVariables(context, metadata);
                break;
            case 'workspace_daily':
                context = await this.contextEngine.buildWorkspaceDigestContext(workspaceId, metadata?.timeRange, contextOptions);
                promptName = 'summaries/daily-digest';
                promptVariables = this.buildWorkspaceDigestPromptVariables(context, metadata);
                break;
            case 'activity_digest':
                context = await this.contextEngine.buildActivityDigestContext(organizationId, metadata?.filters, contextOptions);
                promptName = 'summaries/daily-digest';
                promptVariables = this.buildActivityDigestPromptVariables(context, metadata);
                break;
            default:
                throw new Error(`Unknown summary type: ${summaryType}`);
        }
        // Compose prompt
        const { systemPrompt, userPrompt } = PromptManager_1.PromptManager.composePrompt(promptName, {
            context: this.contextEngine.formatContextForPrompt(context),
            ...promptVariables,
        });
        // Generate with retry
        const response = await this.generateWithRetry({
            systemPrompt,
            prompt: userPrompt,
            maxTokens: this.config.maxTokensPerRequest,
        });
        // Store summary in database
        const { data: summary } = await database_1.supabase
            .from('ai_summaries')
            .insert({
            organization_id: organizationId,
            workspace_id: workspaceId,
            channel_id: channelId,
            summary_type: summaryType,
            source_entity_type: summaryType === 'deployment' ? 'deployment' : summaryType === 'incident' ? 'incident' : 'workspace',
            source_entity_id: entityId,
            title: this.generateTitle(summaryType, context),
            content: response.content,
            metadata: { ...metadata, tokenUsage: response.usage },
            generated_by: 'system',
        })
            .select()
            .single();
        return {
            id: summary.id,
            content: summary.content,
            title: summary.title,
        };
    }
    /**
     * Generate an AI insight
     */
    async generateInsight(options) {
        const { insightType, organizationId, workspaceId, contextData, metadata } = options;
        // Check rate limit
        this.checkRateLimit(organizationId);
        const context = contextData || (await this.buildInsightContext(insightType, organizationId, workspaceId));
        const promptName = 'insights/anomaly-detection';
        const promptVariables = this.buildInsightPromptVariables(insightType, context, metadata);
        const { systemPrompt, userPrompt } = PromptManager_1.PromptManager.composePrompt(promptName, {
            context: this.contextEngine.formatContextForPrompt(context),
            ...promptVariables,
        });
        const response = await this.generateWithRetry({
            systemPrompt,
            prompt: userPrompt,
            maxTokens: this.config.maxTokensPerRequest,
        });
        // Determine severity based on insight type and content
        const severity = this.determineSeverity(insightType, response.content);
        // Store insight in database
        const { data: insight } = await database_1.supabase
            .from('ai_insights')
            .insert({
            organization_id: organizationId,
            workspace_id: workspaceId,
            insight_type: insightType,
            severity,
            title: this.generateInsightTitle(insightType, context),
            description: response.content,
            metadata: { ...metadata, tokenUsage: response.usage },
            source_event_ids: metadata?.source_event_ids || [],
        })
            .select()
            .single();
        return {
            id: insight.id,
            title: insight.title,
            description: insight.description,
            severity: insight.severity,
        };
    }
    /**
     * Generate with retry logic
     */
    async generateWithRetry(request) {
        let lastError = null;
        for (let attempt = 0; attempt < this.config.maxRetries; attempt++) {
            try {
                return await this.provider.generate(request);
            }
            catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                const delay = this.config.retryDelayMs * Math.pow(2, attempt);
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }
        throw new Error(`AI generation failed after ${this.config.maxRetries} retries: ${lastError?.message}`);
    }
    /**
     * Check rate limit for organization
     */
    checkRateLimit(organizationId) {
        const now = Date.now();
        const oneMinuteAgo = now - 60000;
        const requests = this.rateLimitTracker.get(organizationId) || [];
        const recentRequests = requests.filter((timestamp) => timestamp > oneMinuteAgo);
        if (recentRequests.length >= this.config.rateLimitPerMinute) {
            throw new Error(`Rate limit exceeded for organization ${organizationId}`);
        }
        recentRequests.push(now);
        this.rateLimitTracker.set(organizationId, recentRequests);
    }
    /**
     * Get API key for provider
     */
    getApiKey(provider) {
        switch (provider) {
            case 'openai':
                return env_1.env.OPENAI_API_KEY || '';
            case 'gemini':
                return env_1.env.GEMINI_API_KEY || '';
            case 'claude':
                return env_1.env.CLAUDE_API_KEY || '';
            default:
                throw new Error(`Unknown provider: ${provider}`);
        }
    }
    /**
     * Build prompt variables for deployment summary
     */
    buildDeploymentPromptVariables(context, metadata) {
        const deployment = context.deployments?.[0];
        return {
            service: deployment?.service || 'unknown',
            environment: deployment?.environment || 'unknown',
            status: deployment?.status || 'unknown',
            version: metadata?.version || 'unknown',
            started_at: deployment?.created_at || 'unknown',
            completed_at: metadata?.completed_at || 'unknown',
            error_message: metadata?.error_message || '',
        };
    }
    /**
     * Build prompt variables for incident analysis
     */
    buildIncidentPromptVariables(context, metadata) {
        const incident = context.incidents?.[0];
        return {
            title: incident?.title || 'unknown',
            severity: incident?.severity || 'unknown',
            status: incident?.status || 'unknown',
            created_at: incident?.created_at || 'unknown',
            resolved_at: metadata?.resolved_at || 'unknown',
            affected_services: metadata?.affected_services?.join(', ') || 'unknown',
            description: metadata?.description || '',
            resolution: metadata?.resolution || '',
        };
    }
    /**
     * Build prompt variables for workspace digest
     */
    buildWorkspaceDigestPromptVariables(context, metadata) {
        return {
            workspace_name: context.workspace?.name || 'unknown',
            date: metadata?.date || new Date().toISOString().split('T')[0],
            deployments: context.deployments?.map((d) => `- ${d.service} (${d.environment}): ${d.status}`).join('\n') || 'None',
            incidents: context.incidents?.map((i) => `- ${i.title} (${i.severity}, ${i.status})`).join('\n') || 'None',
            activity: context.activity?.map((a) => `- ${a.title}`).join('\n') || 'None',
        };
    }
    /**
     * Build prompt variables for activity digest
     */
    buildActivityDigestPromptVariables(context, metadata) {
        return {
            workspace_name: context.workspace?.name || 'organization',
            date: metadata?.date || new Date().toISOString().split('T')[0],
            activity: context.activity?.map((a) => `- ${a.title}`).join('\n') || 'None',
        };
    }
    /**
     * Build prompt variables for insights
     */
    buildInsightPromptVariables(insightType, _context, metadata) {
        return {
            anomaly_type: insightType,
            time_range: metadata?.timeRange || 'last 24 hours',
            pattern_description: metadata?.pattern_description || '',
            affected_entities: metadata?.affected_entities?.join(', ') || '',
        };
    }
    /**
     * Build context for insight generation
     */
    async buildInsightContext(_insightType, organizationId, workspaceId) {
        const timeRange = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        if (workspaceId) {
            return await this.contextEngine.buildWorkspaceDigestContext(workspaceId, timeRange);
        }
        return await this.contextEngine.buildActivityDigestContext(organizationId, { timeRange });
    }
    /**
     * Generate title for summary
     */
    generateTitle(summaryType, context) {
        switch (summaryType) {
            case 'deployment':
                return `Deployment Summary: ${context.deployments?.[0]?.service || 'Unknown'}`;
            case 'incident':
                return `Incident Analysis: ${context.incidents?.[0]?.title || 'Unknown'}`;
            case 'workspace_daily':
                return `Daily Digest: ${context.workspace?.name || 'Workspace'}`;
            case 'activity_digest':
                return `Activity Digest`;
            default:
                return 'AI Summary';
        }
    }
    /**
     * Generate title for insight
     */
    generateInsightTitle(insightType, _context) {
        switch (insightType) {
            case 'anomaly_detected':
                return 'Anomaly Detected';
            case 'deployment_risk':
                return 'Deployment Risk Identified';
            case 'incident_pattern':
                return 'Incident Pattern Detected';
            case 'activity_spike':
                return 'Activity Spike Detected';
            default:
                return 'Operational Insight';
        }
    }
    /**
     * Determine severity based on insight type and content
     */
    determineSeverity(insightType, content) {
        const lowerContent = content.toLowerCase();
        if (insightType === 'deployment_risk' || insightType === 'incident_pattern') {
            if (lowerContent.includes('critical') || lowerContent.includes('severe') || lowerContent.includes('high risk')) {
                return 'critical';
            }
            return 'warning';
        }
        if (insightType === 'anomaly_detected') {
            if (lowerContent.includes('critical') || lowerContent.includes('severe')) {
                return 'critical';
            }
            return 'warning';
        }
        return 'info';
    }
}
exports.AIOrchestrator = AIOrchestrator;
//# sourceMappingURL=AIOrchestrator.js.map