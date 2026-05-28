import { EventEmitter } from 'events';
import type { IEventBus, EventMiddleware, EventBusMetrics } from './IEventBus';
import type { EcosystemEvent, EventHandler } from '../../types';

export class InternalEventBus extends EventEmitter implements IEventBus {
  private static instance: InternalEventBus;
  private eventLog: Map<string, EcosystemEvent[]> = new Map();
  private middlewares: EventMiddleware[] = [];
  private totalPublished = 0;
  private droppedEvents = 0;
  private eventTypeCounts: Map<string, number> = new Map();
  private deadLetterLog: Array<{ event: EcosystemEvent; error: string; timestamp: string }> = [];

  private constructor() {
    super();
    this.setMaxListeners(200);
  }

  static getInstance(): InternalEventBus {
    if (!InternalEventBus.instance) {
      InternalEventBus.instance = new InternalEventBus();
    }
    return InternalEventBus.instance;
  }

  async publish(event: EcosystemEvent): Promise<void> {
    try {
      this.totalPublished++;
      this.eventTypeCounts.set(
        event.event_type,
        (this.eventTypeCounts.get(event.event_type) || 0) + 1
      );

      // Run middleware pipeline
      await this.runMiddleware(event);

      // Log event for debugging
      this.logEvent(event);

      // Emit to event type subscribers
      this.emit(event.event_type, event);

      // Emit to all subscribers (wildcard)
      this.emit('*', event);
    } catch (error) {
      this.droppedEvents++;
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.deadLetterLog.push({
        event,
        error: errorMsg,
        timestamp: new Date().toISOString(),
      });

      if (this.deadLetterLog.length > 500) {
        this.deadLetterLog.shift();
      }

      console.error(`[EventBus] Dropped event: ${event.event_type} — ${errorMsg}`);
      throw error;
    }
  }

  private async runMiddleware(event: EcosystemEvent): Promise<void> {
    const execute = async (index: number): Promise<void> => {
      if (index >= this.middlewares.length) return;
      const middleware = this.middlewares[index];
      await middleware(event, () => execute(index + 1));
    };
    await execute(0);
  }

  subscribe(eventType: string, handler: EventHandler): void {
    this.on(eventType, handler);
    console.log(`[EventBus] Subscribed to: ${eventType}`);
  }

  subscribeOnce(eventType: string, handler: EventHandler): void {
    const onceHandler = async (event: EcosystemEvent) => {
      this.off(eventType, onceHandler as EventHandler);
      await handler(event);
    };
    this.on(eventType, onceHandler as EventHandler);
  }

  subscribeAll(handler: EventHandler): void {
    this.on('*', handler);
  }

  unsubscribe(eventType: string, handler: EventHandler): void {
    this.off(eventType, handler);
  }

  async broadcast(event: EcosystemEvent): Promise<void> {
    await this.publish(event);
  }

  getSubscriberCount(eventType: string): number {
    return this.listenerCount(eventType);
  }

  use(middleware: EventMiddleware): void {
    this.middlewares.push(middleware);
  }

  getMetrics(): EventBusMetrics {
    let totalSubscribers = 0;
    this.eventNames().forEach((name) => {
      totalSubscribers += this.listenerCount(name as string);
    });

    const counts: Record<string, number> = {};
    this.eventTypeCounts.forEach((val, key) => {
      counts[key] = val;
    });

    return {
      totalPublished: this.totalPublished,
      totalSubscribers,
      eventTypeCounts: counts,
      droppedEvents: this.droppedEvents,
    };
  }

  getDeadLetterLog(limit: number = 50): Array<{ event: EcosystemEvent; error: string; timestamp: string }> {
    return this.deadLetterLog.slice(-limit);
  }

  private logEvent(event: EcosystemEvent): void {
    const events = this.eventLog.get(event.event_type) || [];
    events.push(event);

    // Keep only last 100 events per type
    if (events.length > 100) {
      events.shift();
    }

    this.eventLog.set(event.event_type, events);
  }

  getRecentEvents(eventType: string, limit: number = 10): EcosystemEvent[] {
    const events = this.eventLog.get(eventType) || [];
    return events.slice(-limit);
  }

  clearLog(): void {
    this.eventLog.clear();
    this.deadLetterLog = [];
    this.totalPublished = 0;
    this.droppedEvents = 0;
    this.eventTypeCounts.clear();
  }
}
