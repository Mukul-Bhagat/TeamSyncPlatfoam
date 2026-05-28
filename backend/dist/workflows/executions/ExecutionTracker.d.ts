export declare class ExecutionTracker {
    private static instance;
    private stateTracker;
    private logger;
    private constructor();
    static getInstance(): ExecutionTracker;
    /**
     * Track execution progress
     */
    trackProgress(executionId: string, progress: number, message?: string): Promise<void>;
    /**
     * Track step execution
     */
    trackStepExecution(executionId: string, stepId: string, status: 'started' | 'completed' | 'failed', result?: unknown): Promise<void>;
    /**
     * Get execution progress
     */
    getProgress(executionId: string): Promise<number>;
    /**
     * Get execution steps
     */
    getSteps(executionId: string): Promise<Record<string, any>>;
    /**
     * Get execution timeline
     */
    getTimeline(executionId: string): Promise<Array<{
        timestamp: string;
        event: string;
        details: any;
    }>>;
}
//# sourceMappingURL=ExecutionTracker.d.ts.map