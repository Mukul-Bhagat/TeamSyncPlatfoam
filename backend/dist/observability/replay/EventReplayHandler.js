"use strict";
/**
 * EventReplayHandler - Replay handler for ecosystem events
 * Priority 2: Critical for ecosystem consistency and event recovery
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventReplayHandler = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const env_1 = require("../../config/env");
const InternalEventBus_1 = require("../../core/event-bus/InternalEventBus");
class EventReplayHandler {
    supabase;
    eventBus;
    constructor() {
        this.supabase = (0, supabase_js_1.createClient)(env_1.env.SUPABASE_URL, env_1.env.SUPABASE_SERVICE_ROLE_KEY);
        this.eventBus = InternalEventBus_1.InternalEventBus.getInstance();
    }
    async canReplay(entityId) {
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
    async prepareReplay(entityId, options) {
        // Try to get from dead_letter_events first
        let event;
        let source = 'unknown';
        const { data: deadLetter } = await this.supabase
            .from('dead_letter_events')
            .select('*')
            .eq('id', entityId)
            .single();
        if (deadLetter) {
            event = deadLetter;
            source = 'dead_letter';
        }
        else {
            // Try ecosystem_events
            const { data: ecosystemEvent } = await this.supabase
                .from('ecosystem_events')
                .select('*')
                .eq('id', entityId)
                .single();
            if (ecosystemEvent) {
                event = ecosystemEvent;
                source = 'ecosystem_events';
            }
            else {
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
    async executeReplay(context) {
        const startTime = Date.now();
        const replayId = `replay-${context.entityId}-${Date.now()}`;
        try {
            // Reconstruct the event
            const event = {
                id: this.generateUUID(),
                source_app: context.metadata?.sourceApp || 'replay_system',
                organization_id: context.originalExecution?.context?.organization_id || 'system',
                event_type: context.metadata?.eventType,
                event_version: '1.0',
                payload: context.originalExecution?.context || {},
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
        }
        catch (error) {
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
    async validateReplaySafety(context) {
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
        const eventType = context.metadata?.eventType;
        const nonIdempotentTypes = ['message.created', 'message.updated', 'notification.sent'];
        if (nonIdempotentTypes.includes(eventType)) {
            return {
                safe: false,
                reason: `Event type ${eventType} is not idempotent-safe for replay`
            };
        }
        return { safe: true };
    }
    getEntityType() {
        return 'event';
    }
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }
}
exports.EventReplayHandler = EventReplayHandler;
//# sourceMappingURL=EventReplayHandler.js.map