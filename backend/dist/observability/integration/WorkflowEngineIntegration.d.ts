/**
 * WorkflowEngineIntegration - Integrates observability with WorkflowEngine
 *
 * Adds tracing, metrics, and replay capabilities to workflow executions.
 */
import type { Workflow, WorkflowExecution } from '../../workflows/engine/WorkflowEngine';
export declare class WorkflowEngineIntegration {
    private static instance;
    private observabilityEngine;
    private organizationId?;
    private workspaceId?;
    private constructor();
    static getInstance(): WorkflowEngineIntegration;
    /**
     * Set organization context
     */
    setOrganizationContext(organizationId: string, workspaceId?: string): void;
    /**
     * Wrap workflow execution with observability
     */
    traceWorkflowExecution(workflow: Workflow, executionFn: () => Promise<WorkflowExecution>): Promise<WorkflowExecution>;
    /**
     * Trace a workflow step
     */
    traceWorkflowStep(workflowId: string, stepId: string, stepName: string, stepFn: () => Promise<unknown>): Promise<unknown>;
}
//# sourceMappingURL=WorkflowEngineIntegration.d.ts.map