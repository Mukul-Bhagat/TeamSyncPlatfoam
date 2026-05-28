import type { IScheduler, ScheduleConfig, ScheduleJob } from './IScheduler';
export declare class SchedulerEngine implements IScheduler {
    private static instance;
    private scheduler;
    private constructor();
    static getInstance(): SchedulerEngine;
    schedule(config: ScheduleConfig): Promise<string>;
    unschedule(scheduleId: string): Promise<boolean>;
    getSchedule(scheduleId: string): Promise<ScheduleJob | undefined>;
    getWorkflowSchedules(workflowId: string): Promise<ScheduleJob[]>;
    enableSchedule(scheduleId: string): Promise<boolean>;
    disableSchedule(scheduleId: string): Promise<boolean>;
    start(): Promise<void>;
    stop(): Promise<void>;
}
//# sourceMappingURL=SchedulerEngine.d.ts.map