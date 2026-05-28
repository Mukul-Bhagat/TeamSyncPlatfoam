import type { IScheduler, ScheduleConfig, ScheduleJob } from './IScheduler';
import { createClient } from '@supabase/supabase-js';
import { env } from '../../config/env';

export class LocalSchedulerEngine implements IScheduler {
  private static instance: LocalSchedulerEngine;
  private supabase;
  private jobs: Map<string, NodeJS.Timeout> = new Map();
  private running: boolean = false;

  private constructor() {
    this.supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  }

  static getInstance(): LocalSchedulerEngine {
    if (!LocalSchedulerEngine.instance) {
      LocalSchedulerEngine.instance = new LocalSchedulerEngine();
    }
    return LocalSchedulerEngine.instance;
  }

  async schedule(config: ScheduleConfig): Promise<string> {
    const { data, error } = await this.supabase
      .from('workflow_schedules')
      .insert({
        workflow_id: config.workflow_id,
        schedule_expression: config.schedule_expression,
        timezone: config.timezone,
        enabled: config.enabled,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to schedule: ${error.message}`);
    }

    if (this.running && config.enabled) {
      this.scheduleJob(data.id);
    }

    return data.id;
  }

  async unschedule(scheduleId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('workflow_schedules')
      .delete()
      .eq('id', scheduleId);

    if (error) {
      throw new Error(`Failed to unschedule: ${error.message}`);
    }

    this.stopJob(scheduleId);
    return true;
  }

  async getSchedule(scheduleId: string): Promise<ScheduleJob | undefined> {
    const { data, error } = await this.supabase
      .from('workflow_schedules')
      .select('*')
      .eq('id', scheduleId)
      .single();

    if (error) {
      return undefined;
    }

    return data as ScheduleJob;
  }

  async getWorkflowSchedules(workflowId: string): Promise<ScheduleJob[]> {
    const { data, error } = await this.supabase
      .from('workflow_schedules')
      .select('*')
      .eq('workflow_id', workflowId);

    if (error) {
      return [];
    }

    return (data || []) as ScheduleJob[];
  }

  async enableSchedule(scheduleId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('workflow_schedules')
      .update({ enabled: true, updated_at: new Date().toISOString() })
      .eq('id', scheduleId);

    if (error) {
      throw new Error(`Failed to enable schedule: ${error.message}`);
    }

    if (this.running) {
      this.scheduleJob(scheduleId);
    }

    return true;
  }

  async disableSchedule(scheduleId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('workflow_schedules')
      .update({ enabled: false, updated_at: new Date().toISOString() })
      .eq('id', scheduleId);

    if (error) {
      throw new Error(`Failed to disable schedule: ${error.message}`);
    }

    this.stopJob(scheduleId);
    return true;
  }

  async start(): Promise<void> {
    if (this.running) {
      return;
    }

    this.running = true;

    // Load all enabled schedules
    const { data, error } = await this.supabase
      .from('workflow_schedules')
      .select('*')
      .eq('enabled', true);

    if (error) {
      console.error(`Failed to load schedules: ${error.message}`);
      return;
    }

    for (const schedule of data || []) {
      this.scheduleJob(schedule.id);
    }
  }

  async stop(): Promise<void> {
    this.running = false;

    // Stop all jobs
    for (const [scheduleId, timeout] of this.jobs) {
      clearTimeout(timeout);
    }
    this.jobs.clear();
  }

  private scheduleJob(scheduleId: string): void {
    this.stopJob(scheduleId);

    this.getSchedule(scheduleId).then((schedule) => {
      if (!schedule || !schedule.enabled) {
        return;
      }

      const delay = this.calculateDelay(schedule.schedule_expression, schedule.timezone);
      const timeout = setTimeout(() => {
        this.executeScheduledWorkflow(schedule.workflow_id, scheduleId);
        this.scheduleJob(scheduleId); // Reschedule
      }, delay);

      this.jobs.set(scheduleId, timeout);
    });
  }

  private stopJob(scheduleId: string): void {
    const timeout = this.jobs.get(scheduleId);
    if (timeout) {
      clearTimeout(timeout);
      this.jobs.delete(scheduleId);
    }
  }

  private calculateDelay(cronExpression: string, timezone: string): number {
    // Simple implementation - in production use a proper cron library
    // For now, return a fixed delay (e.g., 1 minute)
    return 60 * 1000;
  }

  private async executeScheduledWorkflow(workflowId: string, scheduleId: string): Promise<void> {
    try {
      // Update last_run_at
      await this.supabase
        .from('workflow_schedules')
        .update({ last_run_at: new Date().toISOString() })
        .eq('id', scheduleId);

      // TODO: Trigger workflow execution
      // This would integrate with WorkflowEngine or ExecutionManager
      console.log(`Executing scheduled workflow: ${workflowId}`);
    } catch (error) {
      console.error(`Failed to execute scheduled workflow ${workflowId}:`, error);
    }
  }
}
