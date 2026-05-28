import type { IWorkflowAction, ActionResult, ActionSchema } from './IWorkflowAction';
export interface AssignUserConfig {
    user_id: string;
    entity_type: 'incident' | 'task' | 'deployment';
    entity_id: string;
    role?: string;
    notification?: boolean;
    metadata?: Record<string, unknown>;
}
export declare class AssignUserAction implements IWorkflowAction {
    execute(config: Record<string, unknown>, _context: Record<string, unknown>): Promise<ActionResult>;
    validate(config: Record<string, unknown>): boolean;
    getSchema(): ActionSchema;
}
//# sourceMappingURL=AssignUserAction.d.ts.map