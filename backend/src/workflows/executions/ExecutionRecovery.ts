import { ExecutionManager } from './ExecutionManager';
import { WorkflowStateTracker } from '../engine/WorkflowStateTracker';
import { WorkflowLogger } from '../engine/WorkflowLogger';

export class ExecutionRecovery {
  private static instance: ExecutionRecovery;
  private executionManager: ExecutionManager;
  private stateTracker: WorkflowStateTracker;
  private logger: WorkflowLogger;

  private constructor() {
    this.executionManager = ExecutionManager.getInstance();
    this.stateTracker = new WorkflowStateTracker();
    this.logger = new WorkflowLogger();
  }

  static getInstance(): ExecutionRecovery {
    if (!ExecutionRecovery.instance) {
      ExecutionRecovery.instance = new ExecutionRecovery();
    }
    return ExecutionRecovery.instance;
  }

  /**
   * Recover failed executions
   */
  async recoverFailedExecutions(olderThanMinutes: number = 5): Promise<number> {
    const failedExecutions = await this.stateTracker.getFailedExecutions(olderThanMinutes);
    let recovered = 0;

    for (const execution of failedExecutions) {
      try {
        await this.executionManager.retryExecution(execution.id);
        recovered++;
      } catch (error) {
        console.error(`Failed to recover execution ${execution.id}:`, error);
      }
    }

    return recovered;
  }

  /**
   * Recover stuck executions (pending for too long)
   */
  async recoverStuckExecutions(stuckThresholdMinutes: number = 30): Promise<number> {
    const pendingExecutions = await this.stateTracker.getPendingExecutions();
    const cutoffTime = new Date(Date.now() - stuckThresholdMinutes * 60 * 1000);
    let recovered = 0;

    for (const execution of pendingExecutions) {
      const createdAt = new Date(execution.created_at);
      if (createdAt < cutoffTime) {
        try {
          // Mark as failed and retry
          await this.stateTracker.failExecution(execution.id, 'Execution stuck - timeout');
          await this.executionManager.retryExecution(execution.id);
          recovered++;
        } catch (error) {
          console.error(`Failed to recover stuck execution ${execution.id}:`, error);
        }
      }
    }

    return recovered;
  }

  /**
   * Run recovery process
   */
  async runRecovery(): Promise<{ failedRecovered: number; stuckRecovered: number }> {
    const failedRecovered = await this.recoverFailedExecutions();
    const stuckRecovered = await this.recoverStuckExecutions();

    return {
      failedRecovered,
      stuckRecovered,
    };
  }
}
