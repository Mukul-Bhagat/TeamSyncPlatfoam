import { EventEmitter } from 'events';
import type { IEventBus, EventMiddleware, EventBusMetrics } from './IEventBus';
import type { EcosystemEvent, EventHandler } from '../../types';
export declare class InternalEventBus extends EventEmitter implements IEventBus {
    private static instance;
    private eventLog;
    private middlewares;
    private totalPublished;
    private droppedEvents;
    private eventTypeCounts;
    private deadLetterLog;
    private constructor();
    static getInstance(): InternalEventBus;
    publish(event: EcosystemEvent): Promise<void>;
    private runMiddleware;
    subscribe(eventType: string, handler: EventHandler): void;
    subscribeOnce(eventType: string, handler: EventHandler): void;
    subscribeAll(handler: EventHandler): void;
    unsubscribe(eventType: string, handler: EventHandler): void;
    broadcast(event: EcosystemEvent): Promise<void>;
    getSubscriberCount(eventType: string): number;
    use(middleware: EventMiddleware): void;
    getMetrics(): EventBusMetrics;
    getDeadLetterLog(limit?: number): Array<{
        event: EcosystemEvent;
        error: string;
        timestamp: string;
    }>;
    private logEvent;
    getRecentEvents(eventType: string, limit?: number): EcosystemEvent[];
    clearLog(): void;
}
//# sourceMappingURL=InternalEventBus.d.ts.map