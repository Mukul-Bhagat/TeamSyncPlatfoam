export declare class ScheduleManager {
    private static instance;
    private schedulerEngine;
    private triggerEngine;
    private constructor();
    static getInstance(): ScheduleManager;
    /**
     * Create a schedule for a workflow
     */
    createSchedule(workflowId: string, scheduleExpression: string, timezone?: string): Promise<string>;
    /**
     * Delete a schedule
     */
    deleteSchedule(scheduleId: string): Promise<boolean>;
    /**
     * Get all schedules for a workflow
     */
    getWorkflowSchedules(workflowId: string): Promise<any[]>;
    /**
     * Enable a schedule
     */
    enableSchedule(scheduleId: string): Promise<boolean>;
    /**
     * Disable a schedule
     */
    disableSchedule(scheduleId: string): Promise<boolean>;
    /**
     * Start the scheduler
     */
    start(): Promise<void>;
    /**
     * Stop the scheduler
     */
    stop(): Promise<void>;
}
//# sourceMappingURL=ScheduleManager.d.ts.map