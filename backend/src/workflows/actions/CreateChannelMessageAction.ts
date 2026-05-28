import type { IWorkflowAction, ActionResult, ActionSchema } from './IWorkflowAction';

export interface CreateChannelMessageConfig {
  channel_id: string;
  message: string;
  user_id?: string;
  metadata?: Record<string, unknown>;
}

export class CreateChannelMessageAction implements IWorkflowAction {
  async execute(config: Record<string, unknown>, _context: Record<string, unknown>): Promise<ActionResult> {
    const cfg = config as unknown as CreateChannelMessageConfig;

    try {
      // TODO: Integrate with message system
      // For now, just log the message creation
      console.log(`[CreateChannelMessageAction] Creating message in channel ${cfg.channel_id}`);

      return {
        success: true,
        data: {
          message_id: crypto.randomUUID(),
          channel_id: cfg.channel_id,
          message: cfg.message,
          created_at: new Date().toISOString(),
        },
        metadata: {
          user_id: cfg.user_id,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  validate(config: Record<string, unknown>): boolean {
    const cfg = config as unknown as CreateChannelMessageConfig;
    return !!(cfg.channel_id && cfg.message);
  }

  getSchema(): ActionSchema {
    return {
      type: 'create_channel_message',
      description: 'Create a message in a channel',
      config_schema: {
        channel_id: { type: 'string', required: true, description: 'Channel ID' },
        message: { type: 'string', required: true, description: 'Message content' },
        user_id: { type: 'string', required: false, description: 'User ID (defaults to system)' },
      },
    };
  }
}
