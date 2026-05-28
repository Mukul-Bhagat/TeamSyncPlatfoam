import { WorkflowEngine } from '../engine/WorkflowEngine';
import { WorkflowStateTracker } from '../engine/WorkflowStateTracker';
import { WorkflowLogger } from '../engine/WorkflowLogger';
import { InternalEventBus } from '../../core/event-bus/InternalEventBus';
import type { EcosystemEvent } from '../../types';

export interface PipelineContext {
  trigger_event?: EcosystemEvent;
  user_id?: string;
  organization_id: string;
  workspace_id?: string;
  metadata?: Record<string, unknown>;
}

export class ExecutionPipeline {
  private static instance: ExecutionPipeline;
  private workflowEngine: WorkflowEngine;
  private stateTracker: WorkflowStateTracker;
  private logger: WorkflowLogger;
  private eventBus: InternalEventBus;

  private constructor() {
    this.workflowEngine = WorkflowEngine.getInstance();
    this.stateTracker = new WorkflowStateTracker();
    this.logger = new WorkflowLogger();
    this.eventBus = InternalEventBus.getInstance();
  }

  static getInstance(): ExecutionPipeline {
    if (!ExecutionPipeline.instance) {
      ExecutionPipeline.instance = new ExecutionPipeline();
    }
    return ExecutionPipeline.instance;
  }

  /**
   * Execute the full pipeline: Trigger → Validation → Execution → Tracking → Notifications
   */
  async execute(workflowId: string, context: PipelineContext): Promise<string> {
    try {
      // Step 1: Trigger validation
      await this.validateTrigger(workflowId, context);

      // Step 2: Execute workflow
      const execution = await this.workflowEngine.executeWorkflow(
        workflowId,
        context.trigger_event?.id,
        context.metadata
      );

      // Step 3: Track execution
      await this.trackExecution(execution.id, context);

      // Step 4: Send notifications
      await this.sendNotifications(execution, context);

      // Step 5: Publish realtime updates
      await this.publishRealtimeUpdates(execution, context);

      return execution.id;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.logExecutionFailed('pipeline', workflowId, errorMessage);
      throw error;
    }
  }

  /**
   * Validate trigger conditions
   */
  private async validateTrigger(_workflowId: string, _context: PipelineContext): Promise<void> {
    // Trigger validation is handled by TriggerEngine before execution
    // This is a placeholder for additional validation logic
  }

  /**
   * Track execution metadata
   */
  private async trackExecution(executionId: string, context: PipelineContext): Promise<void> {
    await this.stateTracker.updateExecutionMetadata(executionId, {
      user_id: context.user_id,
      organization_id: context.organization_id,
      workspace_id: context.workspace_id,
      trigger_source: context.trigger_event?.event_type,
    });
  }

  /**
   * Send notifications based on execution result
   */
  private async sendNotifications(_execution: any, _context: PipelineContext): Promise<void> {
    // TODO: Integrate with notification system
    // Send notifications for:
    // - Workflow started
    // - Workflow completed
    // - Workflow failed
    // - Approval required
  }

  /**
   * Publish realtime updates
   */
  private async publishRealtimeUpdates(execution: any, context: PipelineContext): Promise<void> {
    await this.eventBus.publish({
      id: crypto.randomUUID(),
      source_app: 'workflow_engine',
      organization_id: context.organization_id,
      event_type: 'workflow.execution.updated',
      event_version: '1.0',
      payload: {
        execution_id: execution.id,
        workflow_id: execution.workflow_id,
        status: execution.status,
      },
      metadata: {
        workspace_id: context.workspace_id,
      },
      severity: 'info',
      created_at: new Date().toISOString(),
    });
  }

  /**
   * Execute pipeline with retry
   */
  async executeWithRetry(
    workflowId: string,
    context: PipelineContext,
    maxRetries: number = 3
  ): Promise<string> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.execute(workflowId, context);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt < maxRetries) {
          await this.sleep(Math.pow(2, attempt) * 1000);
        }
      }
    }

    throw lastError;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
