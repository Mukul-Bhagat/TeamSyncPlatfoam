import { InternalEventBus } from '../../core/event-bus/InternalEventBus';
import type { EcosystemEvent } from '../../../types';
import { TriggerRegistry } from './TriggerRegistry';
import { WorkflowLogger } from '../engine/WorkflowLogger';
import { WorkflowEngine } from '../engine/WorkflowEngine';

export class TriggerEngine {
  private static instance: TriggerEngine;
  private eventBus: InternalEventBus;
  private triggerRegistry: TriggerRegistry;
  private logger: WorkflowLogger;
  private workflowEngine: WorkflowEngine;

  private constructor() {
    this.eventBus = InternalEventBus.getInstance();
    this.triggerRegistry = TriggerRegistry.getInstance();
    this.logger = new WorkflowLogger();
    this.workflowEngine = WorkflowEngine.getInstance();
  }

  static getInstance(): TriggerEngine {
    if (!TriggerEngine.instance) {
      TriggerEngine.instance = new TriggerEngine();
    }
    return TriggerEngine.instance;
  }

  /**
   * Register a trigger for a workflow
   */
  async registerTrigger(workflowId: string, triggerType: string, config: Record<string, unknown>): Promise<void> {
    const trigger = this.triggerRegistry.createTrigger(triggerType, config);
    this.triggerRegistry.register(workflowId, triggerType, trigger);

    // Subscribe to event bus for event triggers
    if (triggerType === 'event') {
      this.eventBus.subscribe(config.event_type as string, async (event: EcosystemEvent) => {
        await this.handleEventTrigger(workflowId, event);
      });
    }

    this.logger.logTriggerMatched(workflowId, triggerType, config);
  }

  /**
   * Unregister a trigger
   */
  async unregisterTrigger(workflowId: string): Promise<void> {
    this.triggerRegistry.unregister(workflowId);
    this.logger.logWorkflowUnregistered(workflowId);
  }

  /**
   * Handle event trigger
   */
  private async handleEventTrigger(workflowId: string, event: EcosystemEvent): Promise<void> {
    const registration = this.triggerRegistry.get(workflowId);
    if (!registration) {
      return;
    }

    const result = await registration.trigger.match(event);
    this.logger.logTriggerEvaluation(workflowId, result.matched);

    if (result.matched) {
      try {
        await this.workflowEngine.executeWorkflow(workflowId, event.id, result.context);
      } catch (error) {
        console.error(`Failed to execute workflow ${workflowId} on event trigger:`, error);
      }
    }
  }

  /**
   * Handle manual trigger
   */
  async handleManualTrigger(workflowId: string, context: Record<string, unknown>): Promise<void> {
    const registration = this.triggerRegistry.get(workflowId);
    if (!registration) {
      throw new Error(`No trigger registered for workflow: ${workflowId}`);
    }

    const result = await registration.trigger.match(undefined, context);
    this.logger.logTriggerEvaluation(workflowId, result.matched);

    if (result.matched) {
      try {
        await this.workflowEngine.executeWorkflow(workflowId, undefined, result.context);
      } catch (error) {
        console.error(`Failed to execute workflow ${workflowId} on manual trigger:`, error);
        throw error;
      }
    }
  }

  /**
   * Handle AI trigger
   */
  async handleAITrigger(workflowId: string, context: Record<string, unknown>): Promise<void> {
    const registration = this.triggerRegistry.get(workflowId);
    if (!registration) {
      throw new Error(`No trigger registered for workflow: ${workflowId}`);
    }

    const result = await registration.trigger.match(undefined, context);
    this.logger.logTriggerEvaluation(workflowId, result.matched);

    if (result.matched) {
      try {
        await this.workflowEngine.executeWorkflow(workflowId, undefined, result.context);
      } catch (error) {
        console.error(`Failed to execute workflow ${workflowId} on AI trigger:`, error);
        throw error;
      }
    }
  }

  /**
   * Handle command trigger
   */
  async handleCommandTrigger(workflowId: string, context: Record<string, unknown>): Promise<void> {
    const registration = this.triggerRegistry.get(workflowId);
    if (!registration) {
      throw new Error(`No trigger registered for workflow: ${workflowId}`);
    }

    const result = await registration.trigger.match(undefined, context);
    this.logger.logTriggerEvaluation(workflowId, result.matched);

    if (result.matched) {
      try {
        await this.workflowEngine.executeWorkflow(workflowId, undefined, result.context);
      } catch (error) {
        console.error(`Failed to execute workflow ${workflowId} on command trigger:`, error);
        throw error;
      }
    }
  }

  /**
   * Evaluate all triggers for a given event
   */
  async evaluateEventTriggers(event: EcosystemEvent): Promise<string[]> {
    const matchedWorkflows: string[] = [];
    const eventTriggers = this.triggerRegistry.getByType('event');

    for (const registration of eventTriggers) {
      const result = await registration.trigger.match(event);
      if (result.matched) {
        matchedWorkflows.push(registration.workflowId);
      }
    }

    return matchedWorkflows;
  }

  /**
   * Get all registered triggers
   */
  getAllTriggers(): Map<string, any> {
    const triggers = new Map();
    const registrations = this.triggerRegistry.getAll();

    for (const registration of registrations) {
      triggers.set(registration.workflowId, {
        type: registration.triggerType,
        metadata: registration.trigger.getMetadata(),
      });
    }

    return triggers;
  }
}
