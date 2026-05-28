"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventService = void 0;
const database_1 = require("../../shared/database");
const event_bus_1 = require("../../core/event-bus");
const event_schemas_1 = require("../../core/validation/event-schemas");
const errors_1 = require("../../shared/errors");
class EventService {
    eventBus;
    constructor() {
        this.eventBus = event_bus_1.InternalEventBus.getInstance();
    }
    async createEvent(request) {
        const parse = event_schemas_1.CreateEventBodySchema.safeParse(request);
        if (!parse.success) {
            throw new errors_1.ValidationError(JSON.stringify(parse.error.errors));
        }
        const event = await (0, database_1.createEcosystemEvent)(parse.data);
        await this.eventBus.publish(event);
        return event;
    }
    async queryEvents(request) {
        const parse = event_schemas_1.QueryEventsSchema.safeParse(request);
        if (!parse.success) {
            throw new errors_1.ValidationError(JSON.stringify(parse.error.errors));
        }
        return (0, database_1.getEcosystemEvents)(parse.data);
    }
    async getEventById(eventId) {
        const { data, error } = await database_1.supabase
            .from('ecosystem_events')
            .select('*')
            .eq('id', eventId)
            .single();
        if (error) {
            if (error.code === 'PGRST116')
                return null;
            throw new Error(`Failed to fetch event: ${error.message}`);
        }
        return data;
    }
    async getEventStats(organizationId) {
        const { data: allEvents, error } = await database_1.supabase
            .from('ecosystem_events')
            .select('*')
            .eq('organization_id', organizationId)
            .order('created_at', { ascending: false });
        if (error)
            throw new Error(`Failed to fetch stats: ${error.message}`);
        if (!allEvents)
            return { total_events: 0, by_source_app: {}, by_event_type: {}, by_severity: {}, recent_critical: [] };
        const bySourceApp = {};
        const byEventType = {};
        const bySeverity = {};
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
    subscribeToEvents(eventType, handler) {
        this.eventBus.subscribe(eventType, handler);
    }
    unsubscribeFromEvents(eventType, handler) {
        this.eventBus.unsubscribe(eventType, handler);
    }
}
exports.EventService = EventService;
//# sourceMappingURL=service.js.map