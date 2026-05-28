import { ActionRegistry } from './ActionRegistry';
import { NotificationAction } from './NotificationAction';
import { IncidentAction } from './IncidentAction';
import { WebhookAction } from './WebhookAction';
import { AIAction } from './AIAction';
import { SummaryAction } from './SummaryAction';
import { AssignUserAction } from './AssignUserAction';
import { CreateChannelMessageAction } from './CreateChannelMessageAction';

export class CoreActionRegistry {
  private static instance: CoreActionRegistry;
  private actionRegistry: ActionRegistry;

  private constructor() {
    this.actionRegistry = ActionRegistry.getInstance();
  }

  static getInstance(): CoreActionRegistry {
    if (!CoreActionRegistry.instance) {
      CoreActionRegistry.instance = new CoreActionRegistry();
    }
    return CoreActionRegistry.instance;
  }

  /**
   * Register all core actions
   */
  registerCoreActions(): void {
    this.actionRegistry.registerCoreAction('send_notification', new NotificationAction());
    this.actionRegistry.registerCoreAction('create_incident', new IncidentAction());
    this.actionRegistry.registerCoreAction('trigger_webhook', new WebhookAction());
    this.actionRegistry.registerCoreAction('AI_analysis', new AIAction());
    this.actionRegistry.registerCoreAction('generate_summary', new SummaryAction());
    this.actionRegistry.registerCoreAction('assign_user', new AssignUserAction());
    this.actionRegistry.registerCoreAction('create_channel_message', new CreateChannelMessageAction());
  }

  /**
   * Unregister all core actions
   */
  unregisterCoreActions(): void {
    this.actionRegistry.unregister('send_notification');
    this.actionRegistry.unregister('create_incident');
    this.actionRegistry.unregister('trigger_webhook');
    this.actionRegistry.unregister('AI_analysis');
    this.actionRegistry.unregister('generate_summary');
    this.actionRegistry.unregister('assign_user');
    this.actionRegistry.unregister('create_channel_message');
  }
}
