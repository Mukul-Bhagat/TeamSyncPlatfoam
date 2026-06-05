import { createClient } from '@supabase/supabase-js';
import { env } from '../../config/env';
import { InternalEventBus } from '../../core/event-bus/InternalEventBus';
import { WorkflowValidator } from './WorkflowValidator';
import { WorkflowStateTracker } from './WorkflowStateTracker';
import { WorkflowLogger } from './WorkflowLogger';
import { TriggerEngine } from '../triggers/TriggerEngine';
import { ActionExecutor } from '../actions/ActionExecutor';

export interface WorkflowDefinition {
  trigger: Record<string, unknown>;
  steps: WorkflowStep[];
  conditions?: Record<string, unknown>[];
  retry_policy?: RetryPolicy;
  error_handling?: ErrorHandling;
}

export interface WorkflowStep {
  id: string;
  action_type: string;
  action_config: Record<string, unknown>;
  conditions?: Record<string, unknown>;
  on_failure?: 'continue' | 'stop' | 'retry';
}

export interface RetryPolicy {
  max_attempts: number;
  backoff_strategy: 'linear' | 'exponential';
  initial_delay_ms: number;
}

export interface ErrorHandling {
  on_failure: 'continue' | 'stop' | 'retry';
  notify_on_failure: boolean;
  fallback_action?: string;
}

export interface Workflow {
  id: string;
  organization_id: string;
  workspace_id?: string;
  name: string;
  description?: string;
  trigger_type: 'event' | 'schedule' | 'manual' | 'AI' | 'command';
  workflow_definition: WorkflowDefinition;
  enabled: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface WorkflowExecution {
  id: string;
  workflow_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  trigger_event_id?: string;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
  execution_context: Record<string, unknown>;
  metadata: Record<string, unknown>;
  created_at: string;
}

export class WorkflowEngine {
  private static instance: WorkflowEngine;
  private supabase;
  private eventBus: InternalEventBus;
  private validator: WorkflowValidator;
  private stateTracker: WorkflowStateTracker;
  private logger: WorkflowLogger;
  private triggerEngine: TriggerEngine;
  private actionExecutor: ActionExecutor;
  private registeredWorkflows: Map<string, Workflow> = new Map();

  private constructor() {
    this.supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
    this.eventBus = InternalEventBus.getInstance();
    this.validator = new WorkflowValidator();
    this.stateTracker = new WorkflowStateTracker();
    this.logger = new WorkflowLogger();
    this.triggerEngine = TriggerEngine.getInstance();
    this.actionExecutor = new ActionExecutor();
  }

  static getInstance(): WorkflowEngine {
    if (!WorkflowEngine.instance) {
      WorkflowEngine.instance = new WorkflowEngine();
    }
    return WorkflowEngine.instance;
  }

  /**
   * Register a workflow
   */
  async registerWorkflow(workflow: Workflow): Promise<void> {
    // Validate workflow definition
    const validation = this.validator.validate(workflow.workflow_definition);
    if (!validation.valid) {
      throw new Error(`Invalid workflow definition: ${validation.errors.join(', ')}`);
    }

    // Store in registry
    this.registeredWorkflows.set(workflow.id, workflow);

    // Register trigger with trigger engine
    await this.triggerEngine.registerTrigger(workflow.id, workflow.trigger_type, workflow.workflow_definition.trigger);

    this.logger.logWorkflowRegistered(workflow.id, workflow.name);
  }

  /**
   * Unregister a workflow
   */
  async unregisterWorkflow(workflowId: string): Promise<void> {
    this.registeredWorkflows.delete(workflowId);
    await this.triggerEngine.unregisterTrigger(workflowId);
    this.logger.logWorkflowUnregistered(workflowId);
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(
    workflowId: string,
    triggerEventId?: string,
    context?: Record<string, unknown>
  ): Promise<WorkflowExecution> {
    const workflow = this.registeredWorkflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    if (!workflow.enabled) {
      throw new Error(`Workflow is disabled: ${workflowId}`);
    }

    // Create execution record
    const execution = await this.createExecution(workflowId, triggerEventId, context);

    try {
      // Update status to running
      await this.stateTracker.updateExecutionStatus(execution.id, 'running');
      this.logger.logExecutionStarted(execution.id, workflowId);

      // Execute workflow steps
      const results = await this.executeSteps(workflow, execution);

      // Update status to completed
      await this.stateTracker.updateExecutionStatus(execution.id, 'completed');
      await this.stateTracker.completeExecution(execution.id);
      this.logger.logExecutionCompleted(execution.id, workflowId);

      // Publish workflow completed event
      await this.publishWorkflowEvent('workflow.completed', {
        workflow_id: workflowId,
        execution_id: execution.id,
        status: 'completed',
        results,
      });

      return execution;
    } catch (error) {
      // Update status to failed
      const errorMessage = error instanceof Error ? error.message : String(error);
      await this.stateTracker.updateExecutionStatus(execution.id, 'failed');
      await this.stateTracker.failExecution(execution.id, errorMessage);
      this.logger.logExecutionFailed(execution.id, workflowId, errorMessage);

      // Publish workflow failed event
      await this.publishWorkflowEvent('workflow.failed', {
        workflow_id: workflowId,
        execution_id: execution.id,
        status: 'failed',
        error: errorMessage,
      });

      throw error;
    }
  }

  /**
   * Execute workflow steps
   */
  private async executeSteps(workflow: Workflow, execution: WorkflowExecution): Promise<Record<string, unknown>[]> {
    const results: Record<string, unknown>[] = [];
    const definition = workflow.workflow_definition;

    for (const step of definition.steps) {
      try {
        // Check conditions
        if (step.conditions && !this.evaluateConditions([step.conditions], execution.execution_context)) {
          this.logger.logStepSkipped(execution.id, step.id, 'Conditions not met');
          continue;
        }

        // Execute action
        const result = await this.actionExecutor.executeAction(
          step.action_type,
          step.action_config,
          execution.execution_context
        );

        results.push({ step_id: step.id, result });

        // Update execution context with result
        execution.execution_context[step.id] = result;

        this.logger.logStepCompleted(execution.id, step.id);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.logStepFailed(execution.id, step.id, errorMessage);

        // Handle failure based on step configuration
        if (step.on_failure === 'continue') {
          results.push({ step_id: step.id, error: errorMessage });
          continue;
        } else if (step.on_failure === 'retry') {
          const retryPolicy = definition.retry_policy;
          if (retryPolicy) {
            await this.retryStep(step, retryPolicy, execution);
            continue;
          }
        }

        // Default: stop execution
        throw error;
      }
    }

    return results;
  }

  /**
   * Evaluate step conditions
   */
  private evaluateConditions(conditions: Record<string, unknown>[], context: Record<string, unknown>): boolean {
    // Simple condition evaluation - can be extended
    for (const condition of conditions) {
      if (condition.field && condition.operator && condition.value) {
        const fieldValue = this.getNestedValue(context, condition.field as string);
        if (!this.evaluateCondition(fieldValue, condition.operator as string, condition.value)) {
          return false;
        }
      }
    }
    return true;
  }

  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce((current: unknown, key: string) => (current as Record<string, unknown>)?.[key], obj);
  }

  private evaluateCondition(value: unknown, operator: string, expected: unknown): boolean {
    switch (operator) {
      case 'equals':
        return value === expected;
      case 'not_equals':
        return value !== expected;
      case 'contains':
        return typeof value === 'string' && value.includes(expected as string);
      case 'greater_than':
        return typeof value === 'number' && value > (expected as number);
      case 'less_than':
        return typeof value === 'number' && value < (expected as number);
      default:
        return false;
    }
  }

  /**
   * Retry a failed step
   */
  private async retryStep(step: WorkflowStep, retryPolicy: RetryPolicy, execution: WorkflowExecution): Promise<void> {
    const maxAttempts = retryPolicy.max_attempts;
    const delay = retryPolicy.initial_delay_ms;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      await this.sleep(delay * attempt); // Simple backoff

      try {
        await this.actionExecutor.executeAction(step.action_type, step.action_config, execution.execution_context);
        this.logger.logStepRetrySuccess(execution.id, step.id, attempt);
        return;
      } catch (error) {
        this.logger.logStepRetryFailed(execution.id, step.id, attempt);
        if (attempt === maxAttempts) {
          throw error;
        }
      }
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Create execution record
   */
  private async createExecution(
    workflowId: string,
    triggerEventId?: string,
    context?: Record<string, unknown>
  ): Promise<WorkflowExecution> {
    const { data, error } = await this.supabase
      .from('workflow_executions')
      .insert({
        workflow_id: workflowId,
        status: 'pending',
        trigger_event_id: triggerEventId,
        execution_context: context || {},
        metadata: {},
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create execution: ${error.message}`);
    }

    return data as WorkflowExecution;
  }

  /**
   * Publish workflow event
   */
  private async publishWorkflowEvent(eventType: string, payload: Record<string, unknown>): Promise<void> {
    await this.eventBus.publish({
      id: crypto.randomUUID(),
      source_app: 'workflow_engine',
      organization_id: 'system',
      event_type: eventType,
      event_version: '1.0',
      payload,
      metadata: {},
      severity: 'info',
      created_at: new Date().toISOString(),
    });
  }

  /**
   * Load workflows from database
   */
  async loadWorkflows(): Promise<void> {
    const { data, error } = await this.supabase
      .from('workflows')
      .select('*')
      .eq('enabled', true);

    if (error) {
      console.error(`Failed to load workflows: ${error.message}`);
      return;
    }

    for (const workflow of data || []) {
      try {
        await this.registerWorkflow(workflow as Workflow);
      } catch (error) {
        console.error(`Failed to register workflow ${workflow.id}:`, error);
      }
    }

    console.log(`Loaded ${this.registeredWorkflows.size} workflows`);
  }

  /**
   * Get workflow by ID
   */
  getWorkflow(workflowId: string): Workflow | undefined {
    return this.registeredWorkflows.get(workflowId);
  }

  /**
   * Get all registered workflows
   */
  getAllWorkflows(): Workflow[] {
    return Array.from(this.registeredWorkflows.values());
  }
}
