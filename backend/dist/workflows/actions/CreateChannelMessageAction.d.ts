import type { IWorkflowAction, ActionResult, ActionSchema } from './IWorkflowAction';
export interface CreateChannelMessageConfig {
    channel_id: string;
    message: string;
    user_id?: string;
    metadata?: Record<string, unknown>;
}
export declare class CreateChannelMessageAction implements IWorkflowAction {
    execute(config: Record<string, unknown>, _context: Record<string, unknown>): Promise<ActionResult>;
    validate(config: Record<string, unknown>): boolean;
    getSchema(): ActionSchema;
}
//# sourceMappingURL=CreateChannelMessageAction.d.ts.map