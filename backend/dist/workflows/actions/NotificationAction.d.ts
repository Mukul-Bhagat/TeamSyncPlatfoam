import type { IWorkflowAction, ActionResult, ActionSchema } from './IWorkflowAction';
export interface NotificationConfig {
    recipient: string;
    message: string;
    channel_id?: string;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    metadata?: Record<string, unknown>;
}
export declare class NotificationAction implements IWorkflowAction {
    execute(config: Record<string, unknown>, context: Record<string, unknown>): Promise<ActionResult>;
    validate(config: Record<string, unknown>): boolean;
    getSchema(): ActionSchema;
}
//# sourceMappingURL=NotificationAction.d.ts.map