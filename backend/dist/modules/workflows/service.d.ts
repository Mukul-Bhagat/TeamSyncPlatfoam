import type { Workflow, WorkflowExecution } from './types';
export declare class WorkflowService {
    private triggerEngine;
    private executionManager;
    private capabilityManager;
    private commandRouter;
    constructor();
    createWorkflow(workflow: Partial<Workflow>, userId: string): Promise<Workflow>;
    getWorkflow(id: string): Promise<Workflow>;
    getWorkflows(organizationId: string): Promise<Workflow[]>;
    updateWorkflow(id: string, updates: Partial<Workflow>): Promise<Workflow>;
    deleteWorkflow(id: string): Promise<void>;
    executeWorkflow(workflowId: string, context: Record<string, unknown>): Promise<string>;
    getExecution(id: string): Promise<WorkflowExecution>;
    getExecutions(workflowId: string, limit?: number): Promise<WorkflowExecution[]>;
    cancelExecution(id: string): Promise<boolean>;
    registerTrigger(workflowId: string, triggerType: string, config: Record<string, unknown>): Promise<void>;
    grantCapability(userId: string, capabilityName: string, grantedBy: string): Promise<boolean>;
    revokeCapability(userId: string, capabilityName: string): Promise<boolean>;
    getUserCapabilities(userId: string): Promise<string[]>;
    executeCommand(commandName: string, args: Record<string, unknown>, userId: string, organizationId: string): Promise<any>;
    getAvailableCommands(userId: string): Promise<string[]>;
}
//# sourceMappingURL=service.d.ts.map