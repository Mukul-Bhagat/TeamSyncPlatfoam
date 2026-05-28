export declare class ScheduleExecutor {
    private static instance;
    private schedulerEngine;
    private executionManager;
    private constructor();
    static getInstance(): ScheduleExecutor;
    /**
     * Execute a scheduled workflow
     */
    executeScheduledWorkflow(workflowId: string, scheduleId: string): Promise<string>;
    /**
     * Execute multiple scheduled workflows
     */
    executeScheduledWorkflows(workflowIds: string[], scheduleId: string): Promise<string[]>;
    /**
     * Get scheduled executions for a time range
     */
    getScheduledExecutions(startTime: Date, endTime: Date): Promise<any[]>;
}
//# sourceMappingURL=ScheduleExecutor.d.ts.map