import { SchedulerEngine } from './SchedulerEngine';
import { TriggerEngine } from '../triggers/TriggerEngine';

export class ScheduleManager {
  private static instance: ScheduleManager;
  private schedulerEngine: SchedulerEngine;
  private triggerEngine: TriggerEngine;

  private constructor() {
    this.schedulerEngine = SchedulerEngine.getInstance();
    this.triggerEngine = TriggerEngine.getInstance();
  }

  static getInstance(): ScheduleManager {
    if (!ScheduleManager.instance) {
      ScheduleManager.instance = new ScheduleManager();
    }
    return ScheduleManager.instance;
  }

  /**
   * Create a schedule for a workflow
   */
  async createSchedule(
    workflowId: string,
    scheduleExpression: string,
    timezone: string = 'UTC'
  ): Promise<string> {
    // Register schedule trigger with TriggerEngine
    await this.triggerEngine.registerTrigger(workflowId, 'schedule', {
      schedule_expression: scheduleExpression,
      timezone,
    });

    // Create schedule
    return this.schedulerEngine.schedule({
      workflow_id: workflowId,
      schedule_expression: scheduleExpression,
      timezone,
      enabled: true,
    });
  }

  /**
   * Delete a schedule
   */
  async deleteSchedule(scheduleId: string): Promise<boolean> {
    return this.schedulerEngine.unschedule(scheduleId);
  }

  /**
   * Get all schedules for a workflow
   */
  async getWorkflowSchedules(workflowId: string): Promise<any[]> {
    return this.schedulerEngine.getWorkflowSchedules(workflowId);
  }

  /**
   * Enable a schedule
   */
  async enableSchedule(scheduleId: string): Promise<boolean> {
    return this.schedulerEngine.enableSchedule(scheduleId);
  }

  /**
   * Disable a schedule
   */
  async disableSchedule(scheduleId: string): Promise<boolean> {
    return this.schedulerEngine.disableSchedule(scheduleId);
  }

  /**
   * Start the scheduler
   */
  async start(): Promise<void> {
    return this.schedulerEngine.start();
  }

  /**
   * Stop the scheduler
   */
  async stop(): Promise<void> {
    return this.schedulerEngine.stop();
  }
}
