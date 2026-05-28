import type { IWorkflowAction, ActionResult, ActionSchema } from './IWorkflowAction';
export interface AIActionConfig {
    prompt: string;
    model?: string;
    max_tokens?: number;
    temperature?: number;
    context_data?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
}
export declare class AIAction implements IWorkflowAction {
    execute(config: Record<string, unknown>, _context: Record<string, unknown>): Promise<ActionResult>;
    validate(config: Record<string, unknown>): boolean;
    getSchema(): ActionSchema;
}
//# sourceMappingURL=AIAction.d.ts.map