import type { IScheduler, ScheduleConfig, ScheduleJob } from './IScheduler';
export declare class LocalSchedulerEngine implements IScheduler {
    private static instance;
    private supabase;
    private jobs;
    private running;
    private constructor();
    static getInstance(): LocalSchedulerEngine;
    schedule(config: ScheduleConfig): Promise<string>;
    unschedule(scheduleId: string): Promise<boolean>;
    getSchedule(scheduleId: string): Promise<ScheduleJob | undefined>;
    getWorkflowSchedules(workflowId: string): Promise<ScheduleJob[]>;
    enableSchedule(scheduleId: string): Promise<boolean>;
    disableSchedule(scheduleId: string): Promise<boolean>;
    start(): Promise<void>;
    stop(): Promise<void>;
    private scheduleJob;
    private stopJob;
    private calculateDelay;
    private executeScheduledWorkflow;
}
//# sourceMappingURL=LocalSchedulerEngine.d.ts.map