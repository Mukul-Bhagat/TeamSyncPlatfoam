import { WorkflowStateTracker } from '../engine/WorkflowStateTracker';
import { WorkflowLogger } from '../engine/WorkflowLogger';

export class ExecutionTracker {
  private static instance: ExecutionTracker;
  private stateTracker: WorkflowStateTracker;
  private logger: WorkflowLogger;

  private constructor() {
    this.stateTracker = new WorkflowStateTracker();
    this.logger = new WorkflowLogger();
  }

  static getInstance(): ExecutionTracker {
    if (!ExecutionTracker.instance) {
      ExecutionTracker.instance = new ExecutionTracker();
    }
    return ExecutionTracker.instance;
  }

  /**
   * Track execution progress
   */
  async trackProgress(executionId: string, progress: number, message?: string): Promise<void> {
    await this.stateTracker.updateExecutionMetadata(executionId, {
      progress,
      progress_message: message,
      updated_at: new Date().toISOString(),
    });
  }

  /**
   * Track step execution
   */
  async trackStepExecution(
    executionId: string,
    stepId: string,
    status: 'started' | 'completed' | 'failed',
    result?: unknown
  ): Promise<void> {
    const execution = await this.stateTracker.getExecution(executionId);
    if (!execution) {
      return;
    }

    const steps = (execution.metadata as any).steps || {};
    steps[stepId] = {
      status,
      result,
      timestamp: new Date().toISOString(),
    };

    await this.stateTracker.updateExecutionMetadata(executionId, {
      steps,
    });

    if (status === 'completed') {
      this.logger.logStepCompleted(executionId, stepId);
    } else if (status === 'failed') {
      this.logger.logStepFailed(executionId, stepId, String(result));
    }
  }

  /**
   * Get execution progress
   */
  async getProgress(executionId: string): Promise<number> {
    const execution = await this.stateTracker.getExecution(executionId);
    if (!execution) {
      return 0;
    }

    return (execution.metadata as any).progress || 0;
  }

  /**
   * Get execution steps
   */
  async getSteps(executionId: string): Promise<Record<string, any>> {
    const execution = await this.stateTracker.getExecution(executionId);
    if (!execution) {
      return {};
    }

    return (execution.metadata as any).steps || {};
  }

  /**
   * Get execution timeline
   */
  async getTimeline(executionId: string): Promise<Array<{ timestamp: string; event: string; details: any }>> {
    const execution = await this.stateTracker.getExecution(executionId);
    if (!execution) {
      return [];
    }

    const timeline: Array<{ timestamp: string; event: string; details: any }> = [];

    if (execution.started_at) {
      timeline.push({
        timestamp: execution.started_at,
        event: 'started',
        details: {},
      });
    }

    if (execution.completed_at) {
      timeline.push({
        timestamp: execution.completed_at,
        event: 'completed',
        details: { status: execution.status },
      });
    }

    const steps = (execution.metadata as any).steps || {};
    for (const [stepId, stepData] of Object.entries(steps)) {
      timeline.push({
        timestamp: (stepData as any).timestamp,
        event: `step_${stepId}`,
        details: stepData,
      });
    }

    return timeline.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  }
}
