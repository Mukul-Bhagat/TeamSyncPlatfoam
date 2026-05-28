import type { IWorkflowAction, ActionResult, ActionSchema } from './IWorkflowAction';
export interface SummaryConfig {
    target_type: 'deployment' | 'incident' | 'workspace' | 'activity_digest';
    target_id?: string;
    time_range?: string;
    include_details?: boolean;
    metadata?: Record<string, unknown>;
}
export declare class SummaryAction implements IWorkflowAction {
    execute(config: Record<string, unknown>, _context: Record<string, unknown>): Promise<ActionResult>;
    validate(config: Record<string, unknown>): boolean;
    getSchema(): ActionSchema;
}
//# sourceMappingURL=SummaryAction.d.ts.map