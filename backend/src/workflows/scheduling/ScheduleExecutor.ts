import { SchedulerEngine } from './SchedulerEngine';
import { ExecutionManager } from '../executions/ExecutionManager';

export class ScheduleExecutor {
  private static instance: ScheduleExecutor;
  private schedulerEngine: SchedulerEngine;
  private executionManager: ExecutionManager;

  private constructor() {
    this.schedulerEngine = SchedulerEngine.getInstance();
    this.executionManager = ExecutionManager.getInstance();
  }

  static getInstance(): ScheduleExecutor {
    if (!ScheduleExecutor.instance) {
      ScheduleExecutor.instance = new ScheduleExecutor();
    }
    return ScheduleExecutor.instance;
  }

  /**
   * Execute a scheduled workflow
   */
  async executeScheduledWorkflow(workflowId: string, scheduleId: string): Promise<string> {
    const context = {
      trigger_source: 'schedule',
      schedule_id: scheduleId,
      metadata: {
        scheduled: true,
      },
    };

    return this.executionManager.queueExecution(workflowId, context);
  }

  /**
   * Execute multiple scheduled workflows
   */
  async executeScheduledWorkflows(workflowIds: string[], scheduleId: string): Promise<string[]> {
    const executionIds: string[] = [];

    for (const workflowId of workflowIds) {
      try {
        const executionId = await this.executeScheduledWorkflow(workflowId, scheduleId);
        executionIds.push(executionId);
      } catch (error) {
        console.error(`Failed to execute scheduled workflow ${workflowId}:`, error);
      }
    }

    return executionIds;
  }

  /**
   * Get scheduled executions for a time range
   */
  async getScheduledExecutions(startTime: Date, endTime: Date): Promise<any[]> {
    // TODO: Query database for scheduled executions in time range
    return [];
  }
}
