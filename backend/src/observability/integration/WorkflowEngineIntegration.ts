/**
 * WorkflowEngineIntegration - Integrates observability with WorkflowEngine
 * 
 * Adds tracing, metrics, and replay capabilities to workflow executions.
 */

import { ObservabilityEngine } from '../ObservabilityEngine';
import type { Workflow, WorkflowExecution } from '../../workflows/engine/WorkflowEngine';

export class WorkflowEngineIntegration {
  private static instance: WorkflowEngineIntegration;
  private observabilityEngine: ObservabilityEngine;
  private organizationId?: string;
  private workspaceId?: string;

  private constructor() {
    this.observabilityEngine = ObservabilityEngine.getInstance();
  }

  static getInstance(): WorkflowEngineIntegration {
    if (!WorkflowEngineIntegration.instance) {
      WorkflowEngineIntegration.instance = new WorkflowEngineIntegration();
    }
    return WorkflowEngineIntegration.instance;
  }

  /**
   * Set organization context
   */
  setOrganizationContext(organizationId: string, workspaceId?: string): void {
    this.organizationId = organizationId;
    this.workspaceId = workspaceId;
    this.observabilityEngine.setOrganizationContext(organizationId, workspaceId);
  }

  /**
   * Wrap workflow execution with observability
   */
  async traceWorkflowExecution(
    workflow: Workflow,
    executionFn: () => Promise<WorkflowExecution>
  ): Promise<WorkflowExecution> {
    const spanId = this.observabilityEngine.startSpan(`workflow.execute.${workflow.name}`);
    const startTime = Date.now();

    try {
      const execution = await executionFn();
      const duration = Date.now() - startTime;

      await this.observabilityEngine.endSpan(spanId, 'success', {
        workflowId: workflow.id,
        workflowName: workflow.name,
        executionId: execution.id,
      });

      await this.observabilityEngine.recordWorkflowExecution(duration, {
        workflow_id: workflow.id,
        workflow_name: workflow.name,
        status: execution.status,
      });

      return execution;
    } catch (error) {
      const duration = Date.now() - startTime;

      await this.observabilityEngine.endSpan(spanId, 'failed', {
        workflowId: workflow.id,
        workflowName: workflow.name,
        error: error instanceof Error ? error.message : String(error),
      });

      await this.observabilityEngine.recordWorkflowFailure({
        workflow_id: workflow.id,
        workflow_name: workflow.name,
      });

      throw error;
    }
  }

  /**
   * Trace a workflow step
   */
  async traceWorkflowStep(
    workflowId: string,
    stepId: string,
    stepName: string,
    stepFn: () => Promise<unknown>
  ): Promise<unknown> {
    const spanId = this.observabilityEngine.startSpan(`workflow.step.${stepName}`);
    const startTime = Date.now();

    try {
      const result = await stepFn();
      const duration = Date.now() - startTime;

      await this.observabilityEngine.endSpan(spanId, 'success', {
        workflowId,
        stepId,
        stepName,
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      await this.observabilityEngine.endSpan(spanId, 'failed', {
        workflowId,
        stepId,
        stepName,
        error: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
  }
}
