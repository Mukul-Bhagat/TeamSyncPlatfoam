/**
 * AIOrchestratorIntegration - Integrates observability with AIOrchestrator
 * 
 * Adds tracing, metrics, and token usage tracking to AI requests.
 */

import { ObservabilityEngine } from '../ObservabilityEngine';

export class AIOrchestratorIntegration {
  private static instance: AIOrchestratorIntegration;
  private observabilityEngine: ObservabilityEngine;
  private organizationId?: string;
  private workspaceId?: string;

  private constructor() {
    this.observabilityEngine = ObservabilityEngine.getInstance();
  }

  static getInstance(): AIOrchestratorIntegration {
    if (!AIOrchestratorIntegration.instance) {
      AIOrchestratorIntegration.instance = new AIOrchestratorIntegration();
    }
    return AIOrchestratorIntegration.instance;
  }

  /**
   * Set organization context
   */
  setOrganizationContext(organizationId: string, workspaceId?: string): void {
    this.organizationId = organizationId;
    this.workspaceId = workspaceId;
    this.observabilityEngine.setOrganizationContext(organizationId, workspaceId);
  }

  /**
   * Wrap AI request with observability
   */
  async traceAIRequest(
    requestType: 'summary' | 'insight',
    requestFn: () => Promise<{ tokenUsage?: number }>,
    metadata: Record<string, string> = {}
  ): Promise<{ tokenUsage?: number }> {
    const spanId = this.observabilityEngine.startSpan(`ai.request.${requestType}`);
    const startTime = Date.now();

    try {
      const result = await requestFn();
      const duration = Date.now() - startTime;

      await this.observabilityEngine.endSpan(spanId, 'success', {
        requestType,
        ...metadata,
      });

      await this.observabilityEngine.recordAIRequest(duration, {
        request_type: requestType,
        ...metadata,
      });

      if (result.tokenUsage) {
        await this.observabilityEngine.recordAITokenUsage(result.tokenUsage, {
          request_type: requestType,
          ...metadata,
        });
      }

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      await this.observabilityEngine.endSpan(spanId, 'failed', {
        requestType,
        error: error instanceof Error ? error.message : String(error),
        ...metadata,
      });

      throw error;
    }
  }
}
