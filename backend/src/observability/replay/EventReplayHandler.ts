/**
 * EventReplayHandler - Replay handler for ecosystem events
 * Priority 2: Critical for ecosystem consistency and event recovery
 */

import { createClient } from '@supabase/supabase-js';
import { env } from '../../config/env';
import { InternalEventBus } from '../../core/event-bus/InternalEventBus';
import type { IReplayable, ReplayContext, ReplayResult } from './IReplayable';
import type { EcosystemEvent } from '../../types';

export class EventReplayHandler implements IReplayable {
  private supabase;
  private eventBus: InternalEventBus;

  constructor() {
    this.supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
    this.eventBus = InternalEventBus.getInstance();
  }

  async canReplay(entityId: string): Promise<boolean> {
    // Check if event exists in dead_letter_events or ecosystem_events
    const { data: deadLetter } = await this.supabase
      .from('dead_letter_events')
      .select('*')
      .eq('id', entityId)
      .single();

    if (deadLetter) {
      return true;
    }

    const { data: event } = await this.supabase
      .from('ecosystem_events')
      .select('*')
      .eq('id', entityId)
      .single();

    return !!event;
  }

  async prepareReplay(
    entityId: string,
    options?: {
      fromStep?: string;
      skipSteps?: string[];
      overrideContext?: Record<string, unknown>;
    }
  ): Promise<ReplayContext> {
    // Try to get from dead_letter_events first
    let event: any;
    let source = 'unknown';

    const { data: deadLetter } = await this.supabase
      .from('dead_letter_events')
      .select('*')
      .eq('id', entityId)
      .single();

    if (deadLetter) {
      event = deadLetter;
      source = 'dead_letter';
    } else {
      // Try ecosystem_events
      const { data: ecosystemEvent } = await this.supabase
        .from('ecosystem_events')
        .select('*')
        .eq('id', entityId)
        .single();

      if (ecosystemEvent) {
        event = ecosystemEvent;
        source = 'ecosystem_events';
      } else {
        throw new Error(`Event not found: ${entityId}`);
      }
    }

    return {
      entityId,
      entityType: 'event',
      originalExecution: {
        id: event.id,
        timestamp: new Date(event.failed_at || event.created_at),
        context: event.payload,
      },
      replayOptions: {
        overrideContext: options?.overrideContext,
      },
      metadata: {
        source,
        eventType: event.event_type,
        sourceApp: event.source_app || event.metadata?.source_app,
        originalError: event.error_message,
      },
    };
  }

  async executeReplay(context: ReplayContext): Promise<ReplayResult> {
    const startTime = Date.now();
    const replayId = `replay-${context.entityId}-${Date.now()}`;

    try {
      // Reconstruct the event
      const event: EcosystemEvent = {
        id: this.generateUUID(),
        source_app: context.metadata?.sourceApp as string || 'replay_system',
        organization_id: context.originalExecution?.context?.organization_id as string || 'system',
        event_type: context.metadata?.eventType as string,
        event_version: '1.0',
        payload: context.originalExecution?.context as Record<string, unknown> || {},
        metadata: {
          ...context.originalExecution?.context,
          _replay: true,
          _replayId: replayId,
          _originalEventId: context.entityId,
        },
        severity: 'info',
        created_at: new Date().toISOString(),
      };

      // Apply context overrides
      if (context.replayOptions?.overrideContext) {
        event.payload = { ...event.payload, ...context.replayOptions.overrideContext };
      }

      // Publish to event bus
      await this.eventBus.publish(event);

      const duration = Date.now() - startTime;

      return {
        success: true,
        replayId,
        entityId: context.entityId,
        entityType: context.entityType,
        startedAt: new Date(startTime),
        completedAt: new Date(),
        durationMs: duration,
        output: {
          eventId: event.id,
          eventType: event.event_type,
        },
        metadata: context.metadata,
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      return {
        success: false,
        replayId,
        entityId: context.entityId,
        entityType: context.entityType,
        startedAt: new Date(startTime),
        completedAt: new Date(),
        durationMs: duration,
        error: error instanceof Error ? error.message : String(error),
        metadata: context.metadata,
      };
    }
  }

  async validateReplaySafety(context: ReplayContext): Promise<{
    safe: boolean;
    reason?: string;
  }> {
    // Check for recent replay (retry protection)
    const { data: recentReplays } = await this.supabase
      .from('replay_jobs')
      .select('*')
      .eq('target_entity', context.entityId)
      .eq('replay_type', 'event')
      .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // Last 5 minutes
      .limit(1);

    if (recentReplays && recentReplays.length > 0) {
      return { safe: false, reason: 'Recent replay already attempted' };
    }

    // Check if event type is idempotent-safe
    const eventType = context.metadata?.eventType as string;
    const nonIdempotentTypes = ['message.created', 'message.updated', 'notification.sent'];
    
    if (nonIdempotentTypes.includes(eventType)) {
      return { 
        safe: false, 
        reason: `Event type ${eventType} is not idempotent-safe for replay` 
      };
    }

    return { safe: true };
  }

  getEntityType(): string {
    return 'event';
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
