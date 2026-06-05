import { ProviderFactory } from '../providers/ProviderFactory';
import type { AIProvider, AIProviderConfig, AIRequest, AIResponse } from '../providers/IAIProvider';
import { ContextEngine, type ContextData, type ContextOptions } from '../context/ContextEngine';
import { PromptManager } from '../prompts/PromptManager';
import { env } from '../../config/env';
import { supabase } from '../../shared/database';

export interface OrchestratorConfig {
  maxRetries?: number;
  retryDelayMs?: number;
  rateLimitPerMinute?: number;
  maxTokensPerRequest?: number;
}

export interface GenerateSummaryOptions {
  summaryType: 'deployment' | 'incident' | 'workspace_daily' | 'activity_digest';
  entityId: string;
  organizationId: string;
  workspaceId?: string;
  channelId?: string;
  contextOptions?: ContextOptions;
  metadata?: Record<string, unknown>;
}

export interface GenerateInsightOptions {
  insightType: 'anomaly_detected' | 'deployment_risk' | 'incident_pattern' | 'activity_spike';
  organizationId: string;
  workspaceId?: string;
  contextData?: ContextData;
  metadata?: Record<string, unknown>;
}

export class AIOrchestrator {
  private provider: AIProvider;
  private contextEngine: ContextEngine;
  private config: OrchestratorConfig;
  private rateLimitTracker: Map<string, number[]> = new Map();

  constructor(config: OrchestratorConfig = {}) {
    this.config = {
      maxRetries: 3,
      retryDelayMs: 1000,
      rateLimitPerMinute: parseInt(env.AI_RATE_LIMIT_PER_MINUTE, 10),
      maxTokensPerRequest: parseInt(env.AI_MAX_TOKENS_PER_REQUEST, 10),
      ...config,
    };

    // Initialize AI provider
    const providerConfig: AIProviderConfig = {
      apiKey: this.getApiKey(env.AI_PROVIDER),
      maxTokens: this.config.maxTokensPerRequest,
    };
    this.provider = ProviderFactory.create(env.AI_PROVIDER, providerConfig);

    // Initialize context engine
    this.contextEngine = new ContextEngine();

    // Initialize prompt manager
    PromptManager.initialize();
  }

  /**
   * Generate an AI summary
   */
  async generateSummary(options: GenerateSummaryOptions): Promise<{ id: string; content: string; title: string }> {
    const { summaryType, entityId, organizationId, workspaceId, channelId, contextOptions, metadata } = options;

    // Check rate limit
    this.checkRateLimit(organizationId);

    // Build context
    let context: ContextData;
    let promptName: string;
    let promptVariables: Record<string, string>;

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
        context = await this.contextEngine.buildWorkspaceDigestContext(
          workspaceId!,
          metadata?.timeRange as string,
          contextOptions
        );
        promptName = 'summaries/daily-digest';
        promptVariables = this.buildWorkspaceDigestPromptVariables(context, metadata);
        break;
      case 'activity_digest':
        context = await this.contextEngine.buildActivityDigestContext(
          organizationId,
          metadata?.filters as { timeRange: string; workspace_id?: string; channel_id?: string },
          contextOptions
        );
        promptName = 'summaries/daily-digest';
        promptVariables = this.buildActivityDigestPromptVariables(context, metadata);
        break;
      default:
        throw new Error(`Unknown summary type: ${summaryType}`);
    }

    // Compose prompt
    const { systemPrompt, userPrompt } = PromptManager.composePrompt(promptName, {
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
    const { data: summary } = await supabase
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
  async generateInsight(options: GenerateInsightOptions): Promise<{ id: string; title: string; description: string; severity: string }> {
    const { insightType, organizationId, workspaceId, contextData, metadata } = options;

    // Check rate limit
    this.checkRateLimit(organizationId);

    const context = contextData || (await this.buildInsightContext(insightType, organizationId, workspaceId));

    const promptName = 'insights/anomaly-detection';
    const promptVariables = this.buildInsightPromptVariables(insightType, context, metadata);

    const { systemPrompt, userPrompt } = PromptManager.composePrompt(promptName, {
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
    const { data: insight } = await supabase
      .from('ai_insights')
      .insert({
        organization_id: organizationId,
        workspace_id: workspaceId,
        insight_type: insightType,
        severity,
        title: this.generateInsightTitle(insightType, context),
        description: response.content,
        metadata: { ...metadata, tokenUsage: response.usage },
        source_event_ids: metadata?.source_event_ids as string[] || [],
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
  private async generateWithRetry(request: AIRequest): Promise<AIResponse> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.config.maxRetries!; attempt++) {
      try {
        return await this.provider.generate(request);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        const delay = this.config.retryDelayMs! * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw new Error(`AI generation failed after ${this.config.maxRetries} retries: ${lastError?.message}`);
  }

  /**
   * Check rate limit for organization
   */
  private checkRateLimit(organizationId: string): void {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    const requests = this.rateLimitTracker.get(organizationId) || [];
    const recentRequests = requests.filter((timestamp) => timestamp > oneMinuteAgo);

    if (recentRequests.length >= this.config.rateLimitPerMinute!) {
      throw new Error(`Rate limit exceeded for organization ${organizationId}`);
    }

    recentRequests.push(now);
    this.rateLimitTracker.set(organizationId, recentRequests);
  }

  /**
   * Get API key for provider
   */
  private getApiKey(provider: string): string {
    switch (provider) {
      case 'openai':
        return env.OPENAI_API_KEY || '';
      case 'gemini':
        return env.GEMINI_API_KEY || '';
      case 'claude':
        return env.CLAUDE_API_KEY || '';
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  /**
   * Build prompt variables for deployment summary
   */
  private buildDeploymentPromptVariables(context: ContextData, metadata?: Record<string, unknown>): Record<string, string> {
    const deployment = context.deployments?.[0];
    return {
      service: deployment?.service || 'unknown',
      environment: deployment?.environment || 'unknown',
      status: deployment?.status || 'unknown',
      version: (metadata?.version as string) || 'unknown',
      started_at: deployment?.created_at || 'unknown',
      completed_at: (metadata?.completed_at as string) || 'unknown',
      error_message: (metadata?.error_message as string) || '',
    };
  }

  /**
   * Build prompt variables for incident analysis
   */
  private buildIncidentPromptVariables(context: ContextData, metadata?: Record<string, unknown>): Record<string, string> {
    const incident = context.incidents?.[0];
    return {
      title: incident?.title || 'unknown',
      severity: incident?.severity || 'unknown',
      status: incident?.status || 'unknown',
      created_at: incident?.created_at || 'unknown',
      resolved_at: (metadata?.resolved_at as string) || 'unknown',
      affected_services: (metadata?.affected_services as string[])?.join(', ') || 'unknown',
      description: (metadata?.description as string) || '',
      resolution: (metadata?.resolution as string) || '',
    };
  }

  /**
   * Build prompt variables for workspace digest
   */
  private buildWorkspaceDigestPromptVariables(context: ContextData, metadata?: Record<string, unknown>): Record<string, string> {
    return {
      workspace_name: context.workspace?.name || 'unknown',
      date: (metadata?.date as string) || new Date().toISOString().split('T')[0],
      deployments: context.deployments?.map((d) => `- ${d.service} (${d.environment}): ${d.status}`).join('\n') || 'None',
      incidents: context.incidents?.map((i) => `- ${i.title} (${i.severity}, ${i.status})`).join('\n') || 'None',
      activity: context.activity?.map((a) => `- ${a.title}`).join('\n') || 'None',
    };
  }

  /**
   * Build prompt variables for activity digest
   */
  private buildActivityDigestPromptVariables(context: ContextData, metadata?: Record<string, unknown>): Record<string, string> {
    return {
      workspace_name: context.workspace?.name || 'organization',
      date: (metadata?.date as string) || new Date().toISOString().split('T')[0],
      activity: context.activity?.map((a) => `- ${a.title}`).join('\n') || 'None',
    };
  }

  /**
   * Build prompt variables for insights
   */
  private buildInsightPromptVariables(insightType: string, _context: ContextData, metadata?: Record<string, unknown>): Record<string, string> {
    return {
      anomaly_type: insightType,
      time_range: (metadata?.timeRange as string) || 'last 24 hours',
      pattern_description: (metadata?.pattern_description as string) || '',
      affected_entities: (metadata?.affected_entities as string[])?.join(', ') || '',
    };
  }

  /**
   * Build context for insight generation
   */
  private async buildInsightContext(_insightType: string, organizationId: string, workspaceId?: string): Promise<ContextData> {
    const timeRange = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    if (workspaceId) {
      return await this.contextEngine.buildWorkspaceDigestContext(workspaceId, timeRange);
    }

    return await this.contextEngine.buildActivityDigestContext(organizationId, { timeRange });
  }

  /**
   * Generate title for summary
   */
  private generateTitle(summaryType: string, context: ContextData): string {
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
  private generateInsightTitle(insightType: string, _context: ContextData): string {
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
  private determineSeverity(insightType: string, content: string): 'info' | 'warning' | 'critical' {
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
