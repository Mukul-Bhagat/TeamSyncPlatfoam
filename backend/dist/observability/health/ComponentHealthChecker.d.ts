/**
 * ComponentHealthChecker - Health checks for major system components
 * Layer 1 health monitoring: EventBus, WorkflowEngine, AIOrchestrator, SearchEngine
 */
import type { IHealthChecker, HealthCheckResult } from './IHealthChecker';
export declare class ComponentHealthChecker implements IHealthChecker {
    private componentName;
    private lastCheckTime;
    private lastResult;
    constructor(componentName: string);
    checkHealth(): Promise<HealthCheckResult>;
    getHealthScore(): Promise<number>;
    getLastCheckTime(): Date;
    getName(): string;
    private checkEventBus;
    private checkWorkflowEngine;
    private checkAIOrchestrator;
    private checkSearchEngine;
}
//# sourceMappingURL=ComponentHealthChecker.d.ts.map