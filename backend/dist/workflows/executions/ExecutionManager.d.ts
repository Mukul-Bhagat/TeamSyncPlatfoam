export declare class ExecutionManager {
    private static instance;
    private pipeline;
    private stateTracker;
    private logger;
    private activeExecutions;
    private maxConcurrentExecutions;
    private constructor();
    static getInstance(): ExecutionManager;
    /**
     * Queue and execute a workflow
     */
    queueExecution(workflowId: string, context: any): Promise<string>;
    /**
     * Cancel an execution
     */
    cancelExecution(executionId: string): Promise<boolean>;
    /**
     * Get active executions count
     */
    getActiveExecutionsCount(): number;
    /**
     * Set max concurrent executions
     */
    setMaxConcurrentExecutions(max: number): void;
    /**
     * Get execution status
     */
    getExecutionStatus(executionId: string): Promise<any>;
    /**
     * Get pending executions
     */
    getPendingExecutions(): Promise<any[]>;
    /**
     * Get failed executions for retry
     */
    getFailedExecutions(olderThanMinutes?: number): Promise<any[]>;
    /**
     * Retry a failed execution
     */
    retryExecution(executionId: string): Promise<string>;
}
//# sourceMappingURL=ExecutionManager.d.ts.map