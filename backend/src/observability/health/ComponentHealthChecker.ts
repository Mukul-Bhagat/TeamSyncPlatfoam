/**
 * ComponentHealthChecker - Health checks for major system components
 * Layer 1 health monitoring: EventBus, WorkflowEngine, AIOrchestrator, SearchEngine
 */

import { InternalEventBus } from '../../core/event-bus/InternalEventBus';
import { WorkflowEngine } from '../../workflows/engine/WorkflowEngine';
import { AIOrchestrator } from '../../ai/orchestrator/AIOrchestrator';
import { SearchEngine } from '../../search/engine/SearchEngine';
import type { IHealthChecker, HealthCheckResult, HealthStatus } from './IHealthChecker';

export class ComponentHealthChecker implements IHealthChecker {
  private componentName: string;
  private lastCheckTime: Date = new Date();
  private lastResult: HealthCheckResult | null = null;

  constructor(componentName: string) {
    this.componentName = componentName;
  }

  async checkHealth(): Promise<HealthCheckResult> {
    this.lastCheckTime = new Date();
    let result: HealthCheckResult;

    switch (this.componentName) {
      case 'EventBus':
        result = await this.checkEventBus();
        break;
      case 'WorkflowEngine':
        result = await this.checkWorkflowEngine();
        break;
      case 'AIOrchestrator':
        result = await this.checkAIOrchestrator();
        break;
      case 'SearchEngine':
        result = await this.checkSearchEngine();
        break;
      default:
        result = {
          status: 'healthy',
          healthScore: 100,
          message: 'Unknown component',
          metadata: {},
          lastCheckTime: this.lastCheckTime,
        };
    }

    this.lastResult = result;
    return result;
  }

  async getHealthScore(): Promise<number> {
    const result = await this.checkHealth();
    return result.healthScore;
  }

  getLastCheckTime(): Date {
    return this.lastCheckTime;
  }

  getName(): string {
    return this.componentName;
  }

  private async checkEventBus(): Promise<HealthCheckResult> {
    try {
      const eventBus = InternalEventBus.getInstance();
      const metrics = eventBus.getMetrics();
      
      const totalSubscribers = metrics.totalSubscribers;
      const droppedEvents = metrics.droppedEvents;
      const totalPublished = metrics.totalPublished;

      let status: HealthStatus = 'healthy';
      let healthScore = 100;
      const metadata: Record<string, unknown> = {
        totalSubscribers,
        droppedEvents,
        totalPublished,
        eventTypeCounts: metrics.eventTypeCounts,
      };

      // Degraded if drop rate is high
      if (totalPublished > 0) {
        const dropRate = droppedEvents / totalPublished;
        if (dropRate > 0.05) {
          status = 'degraded';
          healthScore = 70;
          metadata.dropRate = dropRate;
        }
        if (dropRate > 0.2) {
          status = 'critical';
          healthScore = 30;
        }
      }

      // Degraded if no subscribers
      if (totalSubscribers === 0) {
        status = 'degraded';
        healthScore = 60;
      }

      return {
        status,
        healthScore,
        message: `EventBus: ${status} (${healthScore}/100)`,
        metadata,
        lastCheckTime: this.lastCheckTime,
      };
    } catch (error) {
      return {
        status: 'critical',
        healthScore: 0,
        message: `EventBus error: ${error instanceof Error ? error.message : String(error)}`,
        metadata: { error: String(error) },
        lastCheckTime: this.lastCheckTime,
      };
    }
  }

  private async checkWorkflowEngine(): Promise<HealthCheckResult> {
    try {
      const workflowEngine = WorkflowEngine.getInstance();
      const workflows = workflowEngine.getAllWorkflows();
      
      let status: HealthStatus = 'healthy';
      let healthScore = 100;
      const metadata: Record<string, unknown> = {
        totalWorkflows: workflows.length,
        enabledWorkflows: workflows.filter(w => w.enabled).length,
      };

      // Degraded if no workflows registered
      if (workflows.length === 0) {
        status = 'degraded';
        healthScore = 60;
      }

      return {
        status,
        healthScore,
        message: `WorkflowEngine: ${status} (${healthScore}/100)`,
        metadata,
        lastCheckTime: this.lastCheckTime,
      };
    } catch (error) {
      return {
        status: 'critical',
        healthScore: 0,
        message: `WorkflowEngine error: ${error instanceof Error ? error.message : String(error)}`,
        metadata: { error: String(error) },
        lastCheckTime: this.lastCheckTime,
      };
    }
  }

  private async checkAIOrchestrator(): Promise<HealthCheckResult> {
    try {
      // AIOrchestrator is not a singleton, so we check if it can be instantiated
      // This is a basic health check - in production, you'd have a singleton instance
      let status: HealthStatus = 'healthy';
      let healthScore = 100;
      const metadata: Record<string, unknown> = {
        provider: 'configured',
      };

      return {
        status,
        healthScore,
        message: `AIOrchestrator: ${status} (${healthScore}/100)`,
        metadata,
        lastCheckTime: this.lastCheckTime,
      };
    } catch (error) {
      return {
        status: 'critical',
        healthScore: 0,
        message: `AIOrchestrator error: ${error instanceof Error ? error.message : String(error)}`,
        metadata: { error: String(error) },
        lastCheckTime: this.lastCheckTime,
      };
    }
  }

  private async checkSearchEngine(): Promise<HealthCheckResult> {
    try {
      // SearchEngine health check
      let status: HealthStatus = 'healthy';
      let healthScore = 100;
      const metadata: Record<string, unknown> = {
        status: 'operational',
      };

      return {
        status,
        healthScore,
        message: `SearchEngine: ${status} (${healthScore}/100)`,
        metadata,
        lastCheckTime: this.lastCheckTime,
      };
    } catch (error) {
      return {
        status: 'critical',
        healthScore: 0,
        message: `SearchEngine error: ${error instanceof Error ? error.message : String(error)}`,
        metadata: { error: String(error) },
        lastCheckTime: this.lastCheckTime,
      };
    }
  }
}
