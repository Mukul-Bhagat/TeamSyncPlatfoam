export declare class ExecutionRecovery {
    private static instance;
    private executionManager;
    private stateTracker;
    private logger;
    private constructor();
    static getInstance(): ExecutionRecovery;
    /**
     * Recover failed executions
     */
    recoverFailedExecutions(olderThanMinutes?: number): Promise<number>;
    /**
     * Recover stuck executions (pending for too long)
     */
    recoverStuckExecutions(stuckThresholdMinutes?: number): Promise<number>;
    /**
     * Run recovery process
     */
    runRecovery(): Promise<{
        failedRecovered: number;
        stuckRecovered: number;
    }>;
}
//# sourceMappingURL=ExecutionRecovery.d.ts.map