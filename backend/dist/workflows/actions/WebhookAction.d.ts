import type { IWorkflowAction, ActionResult, ActionSchema } from './IWorkflowAction';
export interface WebhookConfig {
    url: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    headers?: Record<string, string>;
    body?: Record<string, unknown>;
    timeout?: number;
    metadata?: Record<string, unknown>;
}
export declare class WebhookAction implements IWorkflowAction {
    execute(config: Record<string, unknown>, _context: Record<string, unknown>): Promise<ActionResult>;
    validate(config: Record<string, unknown>): boolean;
    getSchema(): ActionSchema;
}
//# sourceMappingURL=WebhookAction.d.ts.map