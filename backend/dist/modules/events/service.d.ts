import type { CreateEventRequest, QueryEventsRequest, EventStats } from './types';
export declare class EventService {
    private eventBus;
    constructor();
    createEvent(request: CreateEventRequest): Promise<any>;
    queryEvents(request: QueryEventsRequest): Promise<any[]>;
    getEventById(eventId: string): Promise<any>;
    getEventStats(organizationId: string): Promise<EventStats>;
    subscribeToEvents(eventType: string, handler: (event: unknown) => void): void;
    unsubscribeFromEvents(eventType: string, handler: (event: unknown) => void): void;
}
//# sourceMappingURL=service.d.ts.map