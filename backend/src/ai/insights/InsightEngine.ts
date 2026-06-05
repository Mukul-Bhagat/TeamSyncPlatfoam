import { AIOrchestrator } from '../orchestrator/AIOrchestrator';
import type { ContextData } from '../context/ContextEngine';

export interface InsightRule {
  type: 'deployment_risk' | 'incident_pattern' | 'activity_spike' | 'anomaly_detected';
  condition: (context: ContextData) => boolean;
  severity: 'info' | 'warning' | 'critical';
  metadata?: Record<string, unknown>;
}

export class InsightEngine {
  private orchestrator: AIOrchestrator;
  private rules: InsightRule[] = [];

  constructor(orchestrator: AIOrchestrator) {
    this.orchestrator = orchestrator;
    this.initializeRules();
  }

  /**
   * Generate insights based on context
   */
  async generateInsights(
    organizationId: string,
    workspaceId: string | undefined,
    context: ContextData
  ): Promise<Array<{ id: string; title: string; description: string; severity: string }>> {
    const insights: Array<{ id: string; title: string; description: string; severity: string }> = [];

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
  private initializeRules(): void {
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
      },
    });

    // Rule: Repeated incidents on same service
    this.rules.push({
      type: 'incident_pattern',
      condition: (context) => {
        const incidents = context.incidents || [];
        const serviceCounts = new Map<string, number>();
        incidents.forEach((i) => {
          const services = (i as any).affected_services || [];
          services.forEach((s: string) => {
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
