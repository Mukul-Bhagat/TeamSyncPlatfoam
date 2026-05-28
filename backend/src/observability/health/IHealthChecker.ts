/**
 * IHealthChecker - Interface for health check implementations
 */

export type HealthStatus = 'healthy' | 'degraded' | 'critical';

export interface HealthCheckResult {
  status: HealthStatus;
  healthScore: number; // 0-100
  message?: string;
  metadata: Record<string, unknown>;
  lastCheckTime: Date;
}

export interface IHealthChecker {
  /**
   * Perform a health check
   */
  checkHealth(): Promise<HealthCheckResult>;

  /**
   * Get the health score (0-100)
   */
  getHealthScore(): Promise<number>;

  /**
   * Get the last check time
   */
  getLastCheckTime(): Date;

  /**
   * Get the component/subsystem name
   */
  getName(): string;
}
