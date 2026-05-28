import type { IWorkflowAction } from './IWorkflowAction';

export class ActionRegistry {
  private static instance: ActionRegistry;
  private coreActions: Map<string, IWorkflowAction> = new Map();
  private dynamicActions: Map<string, IWorkflowAction> = new Map();

  private constructor() {}

  static getInstance(): ActionRegistry {
    if (!ActionRegistry.instance) {
      ActionRegistry.instance = new ActionRegistry();
    }
    return ActionRegistry.instance;
  }

  /**
   * Register a core action (built-in)
   */
  registerCoreAction(actionType: string, action: IWorkflowAction): void {
    this.coreActions.set(actionType, action);
  }

  /**
   * Register a dynamic action (from ecosystem apps)
   */
  registerDynamicAction(actionType: string, action: IWorkflowAction): void {
    this.dynamicActions.set(actionType, action);
  }

  /**
   * Unregister an action
   */
  unregister(actionType: string): void {
    this.coreActions.delete(actionType);
    this.dynamicActions.delete(actionType);
  }

  /**
   * Get an action (core takes precedence)
   */
  get(actionType: string): IWorkflowAction | undefined {
    return this.coreActions.get(actionType) || this.dynamicActions.get(actionType);
  }

  /**
   * Get all core actions
   */
  getCoreActions(): Map<string, IWorkflowAction> {
    return new Map(this.coreActions);
  }

  /**
   * Get all dynamic actions
   */
  getDynamicActions(): Map<string, IWorkflowAction> {
    return new Map(this.dynamicActions);
  }

  /**
   * Get all actions
   */
  getAllActions(): Map<string, IWorkflowAction> {
    const all = new Map(this.coreActions);
    this.dynamicActions.forEach((action, type) => {
      all.set(type, action);
    });
    return all;
  }

  /**
   * Check if action type exists
   */
  has(actionType: string): boolean {
    return this.coreActions.has(actionType) || this.dynamicActions.has(actionType);
  }

  /**
   * Clear all actions
   */
  clear(): void {
    this.coreActions.clear();
    this.dynamicActions.clear();
  }
}
