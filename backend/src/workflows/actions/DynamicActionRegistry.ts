import type { IWorkflowAction } from './IWorkflowAction';
import { ActionRegistry } from './ActionRegistry';

export class DynamicActionRegistry {
  private static instance: DynamicActionRegistry;
  private actionRegistry: ActionRegistry;

  private constructor() {
    this.actionRegistry = ActionRegistry.getInstance();
  }

  static getInstance(): DynamicActionRegistry {
    if (!DynamicActionRegistry.instance) {
      DynamicActionRegistry.instance = new DynamicActionRegistry();
    }
    return DynamicActionRegistry.instance;
  }

  /**
   * Register a dynamic action from an ecosystem app
   */
  registerDynamicAction(actionType: string, action: IWorkflowAction, sourceApp: string): void {
    this.actionRegistry.registerDynamicAction(actionType, action);
    console.log(`[DynamicActionRegistry] Registered action ${actionType} from ${sourceApp}`);
  }

  /**
   * Unregister a dynamic action
   */
  unregisterDynamicAction(actionType: string, sourceApp: string): void {
    this.actionRegistry.unregister(actionType);
    console.log(`[DynamicActionRegistry] Unregistered action ${actionType} from ${sourceApp}`);
  }

  /**
   * Get all dynamic actions
   */
  getDynamicActions(): Map<string, IWorkflowAction> {
    return this.actionRegistry.getDynamicActions();
  }

  /**
   * Clear all dynamic actions (e.g., on app uninstall)
   */
  clearDynamicActions(sourceApp: string): void {
    const dynamicActions = this.actionRegistry.getDynamicActions();
    dynamicActions.forEach((action, actionType) => {
      this.actionRegistry.unregister(actionType);
    });
    console.log(`[DynamicActionRegistry] Cleared all dynamic actions from ${sourceApp}`);
  }
}
