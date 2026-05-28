import type { IWorkflowAction, ActionResult, ActionSchema } from './IWorkflowAction';
export interface IncidentConfig {
    title: string;
    description?: string;
    severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
    assignee_id?: string;
    workspace_id?: string;
    metadata?: Record<string, unknown>;
}
export declare class IncidentAction implements IWorkflowAction {
    execute(config: Record<string, unknown>, context: Record<string, unknown>): Promise<ActionResult>;
    validate(config: Record<string, unknown>): boolean;
    getSchema(): ActionSchema;
}
//# sourceMappingURL=IncidentAction.d.ts.map