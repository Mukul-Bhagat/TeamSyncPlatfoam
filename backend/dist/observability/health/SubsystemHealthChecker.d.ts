/**
 * SubsystemHealthChecker - Health checks for critical subsystems
 * Layer 2 health monitoring: queues, connections, providers, pipelines
 */
import type { IHealthChecker, HealthCheckResult } from './IHealthChecker';
export declare class SubsystemHealthChecker implements IHealthChecker {
    private subsystemName;
    private lastCheckTime;
    constructor(subsystemName: string);
    checkHealth(): Promise<HealthCheckResult>;
    getHealthScore(): Promise<number>;
    getLastCheckTime(): Date;
    getName(): string;
    private checkEmbeddingQueue;
    private checkRealtimeConnections;
    private checkIndexingPipeline;
    private checkWorkflowExecutor;
}
//# sourceMappingURL=SubsystemHealthChecker.d.ts.map