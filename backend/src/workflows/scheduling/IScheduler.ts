export interface ScheduleConfig {
  workflow_id: string;
  schedule_expression: string;
  timezone: string;
  enabled: boolean;
}

export interface ScheduleJob {
  id: string;
  workflow_id: string;
  schedule_expression: string;
  timezone: string;
  next_run_at: string;
  last_run_at?: string;
  enabled: boolean;
}

/**
 * IScheduler abstraction for scheduling workflow executions
 */
export interface IScheduler {
  /**
   * Schedule a workflow execution
   */
  schedule(config: ScheduleConfig): Promise<string>;

  /**
   * Unschedule a workflow
   */
  unschedule(scheduleId: string): Promise<boolean>;

  /**
   * Get a schedule
   */
  getSchedule(scheduleId: string): Promise<ScheduleJob | undefined>;

  /**
   * Get all schedules for a workflow
   */
  getWorkflowSchedules(workflowId: string): Promise<ScheduleJob[]>;

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
