/**
 * HealthMonitor - Orchestrates all health checks
 * Aggregates component health and calculates overall system health
 */

import { createClient } from '@supabase/supabase-js';
import { env } from '../../config/env';
import type { IHealthChecker, HealthCheckResult, HealthStatus } from './IHealthChecker';
import { ComponentHealthChecker } from './ComponentHealthChecker';
import { SubsystemHealthChecker } from './SubsystemHealthChecker';

export class HealthMonitor {
  private static instance: HealthMonitor;
  private componentCheckers: Map<string, IHealthChecker> = new Map();
  private subsystemCheckers: Map<string, IHealthChecker> = new Map();
  private supabase;
  private checkInterval: number | null = null;
  private readonly CHECK_INTERVAL_MS = 30000; // 30 seconds

  private constructor() {
    this.supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
    this.initializeCheckers();
  }

  static getInstance(): HealthMonitor {
    if (!HealthMonitor.instance) {
      HealthMonitor.instance = new HealthMonitor();
    }
    return HealthMonitor.instance;
  }

  private initializeCheckers(): void {
    // Layer 1: Component health checkers
    this.componentCheckers.set('EventBus', new ComponentHealthChecker('EventBus'));
    this.componentCheckers.set('WorkflowEngine', new ComponentHealthChecker('WorkflowEngine'));
    this.componentCheckers.set('AIOrchestrator', new ComponentHealthChecker('AIOrchestrator'));
    this.componentCheckers.set('SearchEngine', new ComponentHealthChecker('SearchEngine'));

    // Layer 2: Subsystem health checkers
    this.subsystemCheckers.set('embedding_queue', new SubsystemHealthChecker('embedding_queue'));
    this.subsystemCheckers.set('realtime_connections', new SubsystemHealthChecker('realtime_connections'));
    this.subsystemCheckers.set('indexing_pipeline', new SubsystemHealthChecker('indexing_pipeline'));
    this.subsystemCheckers.set('workflow_executor', new SubsystemHealthChecker('workflow_executor'));
  }

  /**
   * Check all components and subsystems
   */
  async checkAll(): Promise<{
    components: Map<string, HealthCheckResult>;
    subsystems: Map<string, HealthCheckResult>;
    overall: HealthStatus;
    overallScore: number;
  }> {
    const componentResults = new Map<string, HealthCheckResult>();
    const subsystemResults = new Map<string, HealthCheckResult>();

    // Check all components
    for (const [name, checker] of this.componentCheckers.entries()) {
      try {
        const result = await checker.checkHealth();
        componentResults.set(name, result);
        await this.persistHealthResult(name, null, result);
      } catch (error) {
        const errorResult: HealthCheckResult = {
          status: 'critical',
          healthScore: 0,
          message: `Health check failed: ${error instanceof Error ? error.message : String(error)}`,
          metadata: { error: String(error) },
          lastCheckTime: new Date(),
        };
        componentResults.set(name, errorResult);
        await this.persistHealthResult(name, null, errorResult);
      }
    }

    // Check all subsystems
    for (const [name, checker] of this.subsystemCheckers.entries()) {
      try {
        const result = await checker.checkHealth();
        subsystemResults.set(name, result);
        await this.persistHealthResult(name, name, result);
      } catch (error) {
        const errorResult: HealthCheckResult = {
          status: 'critical',
          healthScore: 0,
          message: `Health check failed: ${error instanceof Error ? error.message : String(error)}`,
          metadata: { error: String(error) },
          lastCheckTime: new Date(),
        };
        subsystemResults.set(name, errorResult);
        await this.persistHealthResult(name, name, errorResult);
      }
    }

    // Calculate overall health
    const { overall, overallScore } = this.calculateOverallHealth(componentResults, subsystemResults);

    return {
      components: componentResults,
      subsystems: subsystemResults,
      overall,
      overallScore,
    };
  }

  /**
   * Check a specific component
   */
  async checkComponent(componentName: string): Promise<HealthCheckResult | null> {
    const checker = this.componentCheckers.get(componentName);
    if (!checker) {
      return null;
    }

    const result = await checker.checkHealth();
    await this.persistHealthResult(componentName, null, result);
    return result;
  }

  /**
   * Check a specific subsystem
   */
  async checkSubsystem(subsystemName: string): Promise<HealthCheckResult | null> {
    const checker = this.subsystemCheckers.get(subsystemName);
    if (!checker) {
      return null;
    }

    const result = await checker.checkHealth();
    await this.persistHealthResult(subsystemName, subsystemName, result);
    return result;
  }

  /**
   * Start periodic health checks
   */
  startPeriodicChecks(): void {
    if (this.checkInterval) {
      return;
    }

    this.checkInterval = setInterval(async () => {
      await this.checkAll();
    }, this.CHECK_INTERVAL_MS) as unknown as number;
  }

  /**
   * Stop periodic health checks
   */
  stopPeriodicChecks(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Calculate overall health from components and subsystems
   */
  private calculateOverallHealth(
    components: Map<string, HealthCheckResult>,
    subsystems: Map<string, HealthCheckResult>
  ): { overall: HealthStatus; overallScore: number } {
    let totalScore = 0;
    let count = 0;
    let criticalCount = 0;
    let degradedCount = 0;

    for (const result of components.values()) {
      totalScore += result.healthScore;
      count++;
      if (result.status === 'critical') criticalCount++;
      if (result.status === 'degraded') degradedCount++;
    }

    for (const result of subsystems.values()) {
      totalScore += result.healthScore;
      count++;
      if (result.status === 'critical') criticalCount++;
      if (result.status === 'degraded') degradedCount++;
    }

    const overallScore = count > 0 ? Math.round(totalScore / count) : 100;
    let overall: HealthStatus = 'healthy';

    if (criticalCount > 0) {
      overall = 'critical';
    } else if (degradedCount > 0 || overallScore < 70) {
      overall = 'degraded';
    }

    return { overall, overallScore };
  }

  /**
   * Persist health result to database
   */
  private async persistHealthResult(
    componentName: string,
    subsystemName: string | null,
    result: HealthCheckResult
  ): Promise<void> {
    try {
      await this.supabase.from('system_health').insert({
        component_name: componentName,
        subsystem_name: subsystemName,
        status: result.status,
        health_score: result.healthScore,
        last_check_at: result.lastCheckTime.toISOString(),
        metadata: result.metadata,
      });
    } catch (error) {
      // Log but don't throw - health check failures shouldn't crash the monitor
      // In production, you'd want proper logging here
    }
  }

  /**
   * Get health history for a component/subsystem
   */
  async getHealthHistory(
    componentName: string,
    subsystemName: string | null,
    hours: number = 24
  ): Promise<HealthCheckResult[]> {
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - hours);

    const { data, error } = await this.supabase
      .from('system_health')
      .select('*')
      .eq('component_name', componentName)
      .eq('subsystem_name', subsystemName)
      .gte('last_check_at', cutoffDate.toISOString())
      .order('last_check_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch health history: ${error.message}`);
    }

    return (data || []).map((row) => ({
      status: row.status,
      healthScore: row.health_score,
      message: row.metadata?.message as string | undefined,
      metadata: row.metadata,
      lastCheckTime: new Date(row.last_check_at),
    }));
  }
}
