/**
 * HealthMonitor - Orchestrates all health checks
 * Aggregates component health and calculates overall system health
 */
import type { HealthCheckResult, HealthStatus } from './IHealthChecker';
export declare class HealthMonitor {
    private static instance;
    private componentCheckers;
    private subsystemCheckers;
    private supabase;
    private checkInterval;
    private readonly CHECK_INTERVAL_MS;
    private constructor();
    static getInstance(): HealthMonitor;
    private initializeCheckers;
    /**
     * Check all components and subsystems
     */
    checkAll(): Promise<{
        components: Map<string, HealthCheckResult>;
        subsystems: Map<string, HealthCheckResult>;
        overall: HealthStatus;
        overallScore: number;
    }>;
    /**
     * Check a specific component
     */
    checkComponent(componentName: string): Promise<HealthCheckResult | null>;
    /**
     * Check a specific subsystem
     */
    checkSubsystem(subsystemName: string): Promise<HealthCheckResult | null>;
    /**
     * Start periodic health checks
     */
    startPeriodicChecks(): void;
    /**
     * Stop periodic health checks
     */
    stopPeriodicChecks(): void;
    /**
     * Calculate overall health from components and subsystems
     */
    private calculateOverallHealth;
    /**
     * Persist health result to database
     */
    private persistHealthResult;
    /**
     * Get health history for a component/subsystem
     */
    getHealthHistory(componentName: string, subsystemName: string | null, hours?: number): Promise<HealthCheckResult[]>;
}
//# sourceMappingURL=HealthMonitor.d.ts.map