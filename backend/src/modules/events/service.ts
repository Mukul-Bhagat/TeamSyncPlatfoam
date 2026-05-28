import { createEcosystemEvent, getEcosystemEvents, supabase } from '../../shared/database';
import { InternalEventBus } from '../../core/event-bus';
import { CreateEventBodySchema, QueryEventsSchema } from '../../core/validation/event-schemas';
import { ValidationError } from '../../shared/errors';
import type { CreateEventRequest, QueryEventsRequest, EventStats } from './types';

export class EventService {
  private eventBus: InternalEventBus;

  constructor() {
    this.eventBus = InternalEventBus.getInstance();
  }

  async createEvent(request: CreateEventRequest) {
    const parse = CreateEventBodySchema.safeParse(request);
    if (!parse.success) {
      throw new ValidationError(JSON.stringify(parse.error.errors));
    }

    const event = await createEcosystemEvent(parse.data);
    await this.eventBus.publish(event);
    return event;
  }

  async queryEvents(request: QueryEventsRequest) {
    const parse = QueryEventsSchema.safeParse(request);
    if (!parse.success) {
      throw new ValidationError(JSON.stringify(parse.error.errors));
    }

    return getEcosystemEvents(parse.data);
  }

  async getEventById(eventId: string) {
    const { data, error } = await supabase
      .from('ecosystem_events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to fetch event: ${error.message}`);
    }

    return data;
  }

  async getEventStats(organizationId: string): Promise<EventStats> {
    const { data: allEvents, error } = await supabase
      .from('ecosystem_events')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch stats: ${error.message}`);
    if (!allEvents) return { total_events: 0, by_source_app: {}, by_event_type: {}, by_severity: {}, recent_critical: [] };

    const bySourceApp: Record<string, number> = {};
    const byEventType: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};

    for (const event of allEvents) {
      bySourceApp[event.source_app] = (bySourceApp[event.source_app] || 0) + 1;
      byEventType[event.event_type] = (byEventType[event.event_type] || 0) + 1;
      bySeverity[event.severity] = (bySeverity[event.severity] || 0) + 1;
    }

    return {
      total_events: allEvents.length,
      by_source_app: bySourceApp,
      by_event_type: byEventType,
      by_severity: bySeverity,
      recent_critical: allEvents.filter((e) => e.severity === 'critical').slice(0, 10),
    };
  }

  subscribeToEvents(eventType: string, handler: (event: unknown) => void) {
    this.eventBus.subscribe(eventType, handler as (event: unknown) => Promise<void> | void);
  }

  unsubscribeFromEvents(eventType: string, handler: (event: unknown) => void) {
    this.eventBus.unsubscribe(eventType, handler as (event: unknown) => Promise<void> | void);
  }
}
