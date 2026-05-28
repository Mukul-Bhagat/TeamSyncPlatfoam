import { ExecutionPipeline } from './ExecutionPipeline';
import { WorkflowStateTracker } from '../engine/WorkflowStateTracker';
import { WorkflowLogger } from '../engine/WorkflowLogger';

export class ExecutionManager {
  private static instance: ExecutionManager;
  private pipeline: ExecutionPipeline;
  private stateTracker: WorkflowStateTracker;
  private logger: WorkflowLogger;
  private activeExecutions: Map<string, Promise<string>> = new Map();
  private maxConcurrentExecutions: number = 10;

  private constructor() {
    this.pipeline = ExecutionPipeline.getInstance();
    this.stateTracker = new WorkflowStateTracker();
    this.logger = new WorkflowLogger();
  }

  static getInstance(): ExecutionManager {
    if (!ExecutionManager.instance) {
      ExecutionManager.instance = new ExecutionManager();
    }
    return ExecutionManager.instance;
  }

  /**
   * Queue and execute a workflow
   */
  async queueExecution(workflowId: string, context: any): Promise<string> {
    if (this.activeExecutions.size >= this.maxConcurrentExecutions) {
      throw new Error('Maximum concurrent executions reached');
    }

    const executionPromise = this.pipeline.execute(workflowId, context);
    this.activeExecutions.set(workflowId, executionPromise);

    try {
      const executionId = await executionPromise;
      return executionId;
    } finally {
      this.activeExecutions.delete(workflowId);
    }
  }

  /**
   * Cancel an execution
   */
  async cancelExecution(executionId: string): Promise<boolean> {
    try {
      await this.stateTracker.cancelExecution(executionId);
      this.logger.logExecutionCancelled(executionId, 'unknown');
      return true;
    } catch (error) {
      console.error(`Failed to cancel execution ${executionId}:`, error);
      return false;
    }
  }

  /**
   * Get active executions count
   */
  getActiveExecutionsCount(): number {
    return this.activeExecutions.size;
  }

  /**
   * Set max concurrent executions
   */
  setMaxConcurrentExecutions(max: number): void {
    this.maxConcurrentExecutions = max;
  }

  /**
   * Get execution status
   */
  async getExecutionStatus(executionId: string): Promise<any> {
    return this.stateTracker.getExecution(executionId);
  }

  /**
   * Get pending executions
   */
  async getPendingExecutions(): Promise<any[]> {
    return this.stateTracker.getPendingExecutions();
  }

  /**
   * Get failed executions for retry
   */
  async getFailedExecutions(olderThanMinutes: number = 5): Promise<any[]> {
    return this.stateTracker.getFailedExecutions(olderThanMinutes);
  }

  /**
   * Retry a failed execution
   */
  async retryExecution(executionId: string): Promise<string> {
    const execution = await this.stateTracker.getExecution(executionId);
    if (!execution) {
      throw new Error(`Execution not found: ${executionId}`);
    }

    if (execution.status !== 'failed') {
      throw new Error(`Cannot retry execution with status: ${execution.status}`);
    }

    const context = {
      trigger_event_id: execution.trigger_event_id,
      metadata: execution.execution_context,
    };

    return this.queueExecution(execution.workflow_id, context);
  }
}
