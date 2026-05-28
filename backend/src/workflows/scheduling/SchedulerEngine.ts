import type { IScheduler, ScheduleConfig, ScheduleJob } from './IScheduler';
import { LocalSchedulerEngine } from './LocalSchedulerEngine';

export class SchedulerEngine implements IScheduler {
  private static instance: SchedulerEngine;
  private scheduler: IScheduler;

  private constructor() {
    // Use LocalSchedulerEngine by default
    // In production, this could be swapped for a distributed scheduler
    this.scheduler = LocalSchedulerEngine.getInstance();
  }

  static getInstance(): SchedulerEngine {
    if (!SchedulerEngine.instance) {
      SchedulerEngine.instance = new SchedulerEngine();
    }
    return SchedulerEngine.instance;
  }

  async schedule(config: ScheduleConfig): Promise<string> {
    return this.scheduler.schedule(config);
  }

  async unschedule(scheduleId: string): Promise<boolean> {
    return this.scheduler.unschedule(scheduleId);
  }

  async getSchedule(scheduleId: string): Promise<ScheduleJob | undefined> {
    return this.scheduler.getSchedule(scheduleId);
  }

  async getWorkflowSchedules(workflowId: string): Promise<ScheduleJob[]> {
    return this.scheduler.getWorkflowSchedules(workflowId);
  }

  async enableSchedule(scheduleId: string): Promise<boolean> {
    return this.scheduler.enableSchedule(scheduleId);
  }

  async disableSchedule(scheduleId: string): Promise<boolean> {
    return this.scheduler.disableSchedule(scheduleId);
  }

  async start(): Promise<void> {
    return this.scheduler.start();
  }

  async stop(): Promise<void> {
    return this.scheduler.stop();
  }
}
