import type { ITrigger } from './ITrigger';
import { EventTrigger } from './EventTrigger';
import { ScheduleTrigger } from './ScheduleTrigger';
import { ManualTrigger } from './ManualTrigger';
import { AITrigger } from './AITrigger';
import { CommandTrigger } from './CommandTrigger';

export interface TriggerRegistration {
  workflowId: string;
  triggerType: string;
  trigger: ITrigger;
}

export class TriggerRegistry {
  private static instance: TriggerRegistry;
  private registrations: Map<string, TriggerRegistration> = new Map();

  private constructor() {}

  static getInstance(): TriggerRegistry {
    if (!TriggerRegistry.instance) {
      TriggerRegistry.instance = new TriggerRegistry();
    }
    return TriggerRegistry.instance;
  }

  /**
   * Register a trigger for a workflow
   */
  register(workflowId: string, triggerType: string, trigger: ITrigger): void {
    const registration: TriggerRegistration = {
      workflowId,
      triggerType,
      trigger,
    };
    this.registrations.set(workflowId, registration);
  }

  /**
   * Unregister a trigger
   */
  unregister(workflowId: string): void {
    this.registrations.delete(workflowId);
  }

  /**
   * Get trigger registration for a workflow
   */
  get(workflowId: string): TriggerRegistration | undefined {
    return this.registrations.get(workflowId);
  }

  /**
   * Get all registrations
   */
  getAll(): TriggerRegistration[] {
    return Array.from(this.registrations.values());
  }

  /**
   * Get registrations by trigger type
   */
  getByType(triggerType: string): TriggerRegistration[] {
    return Array.from(this.registrations.values()).filter(
      (reg) => reg.triggerType === triggerType
    );
  }

  /**
   * Create a trigger instance based on type
   */
  createTrigger(triggerType: string, config: Record<string, unknown>): ITrigger {
    switch (triggerType) {
      case 'event':
        return new EventTrigger(config as any);
      case 'schedule':
        return new ScheduleTrigger(config as any);
      case 'manual':
        return new ManualTrigger(config as any);
      case 'AI':
        return new AITrigger(config as any);
      case 'command':
        return new CommandTrigger(config as any);
      default:
        throw new Error(`Unknown trigger type: ${triggerType}`);
    }
  }

  /**
   * Clear all registrations
   */
  clear(): void {
    this.registrations.clear();
  }
}
