/**
 * EventBusIntegration - Integrates observability with InternalEventBus
 * 
 * Adds tracing, metrics, and dead letter persistence to the event bus.
 */

import { ObservabilityEngine } from '../ObservabilityEngine';
import { DeadLetterManager } from '../dead-letter/DeadLetterManager';
import type { EcosystemEvent } from '../../types';

export class EventBusIntegration {
  private static instance: EventBusIntegration;
  private observabilityEngine: ObservabilityEngine;
  private deadLetterManager: DeadLetterManager;
  private organizationId?: string;
  private workspaceId?: string;

  private constructor() {
    this.observabilityEngine = ObservabilityEngine.getInstance();
    this.deadLetterManager = DeadLetterManager.getInstance();
  }

  static getInstance(): EventBusIntegration {
    if (!EventBusIntegration.instance) {
      EventBusIntegration.instance = new EventBusIntegration();
    }
    return EventBusIntegration.instance;
  }

  /**
   * Set organization context
   */
  setOrganizationContext(organizationId: string, workspaceId?: string): void {
    this.organizationId = organizationId;
    this.workspaceId = workspaceId;
    this.observabilityEngine.setOrganizationContext(organizationId, workspaceId);
  }

  /**
   * Wrap event publish with observability
   */
  async tracePublish(
    eventType: string,
    publishFn: () => Promise<void>,
    event: EcosystemEvent
  ): Promise<void> {
    const spanId = this.observabilityEngine.startSpan(`eventbus.publish.${eventType}`);
    const startTime = Date.now();

    try {
      await publishFn();
      const duration = Date.now() - startTime;
      await this.observabilityEngine.endSpan(spanId, 'success', { eventType });
      await this.observabilityEngine.recordEventBusPublish(duration, {
        event_type: eventType,
        source_app: event.source_app,
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      await this.observabilityEngine.endSpan(spanId, 'failed', {
        eventType,
        error: error instanceof Error ? error.message : String(error),
      });
      await this.observabilityEngine.recordEventBusDrop({
        event_type: eventType,
        source_app: event.source_app,
      });

      // Add to dead letter manager
      await this.deadLetterManager.addDeadLetter(
        'EventBus',
        event,
        error instanceof Error ? error.message : String(error),
        this.organizationId,
        this.workspaceId
      );

      throw error;
    }
  }

  /**
   * Get observability-enhanced event bus metrics
   */
  async getEnhancedMetrics() {
    const deadLetterStats = await this.deadLetterManager.getStatistics({
      organizationId: this.organizationId,
      workspaceId: this.workspaceId,
    });

    return {
      deadLetters: deadLetterStats,
    };
  }
}
