import type { EcosystemEvent, EventHandler } from '../../types';

export type EventMiddleware = (event: EcosystemEvent, next: () => Promise<void>) => Promise<void>;

export interface EventBusMetrics {
  totalPublished: number;
  totalSubscribers: number;
  eventTypeCounts: Record<string, number>;
  droppedEvents: number;
}

/**
 * IEventBus abstraction enables seamless migration between transports:
 * InternalEventBus (EventEmitter) → KafkaEventBus → NatsEventBus
 */
export interface IEventBus {
  /**
   * Publish an event to the event bus
   */
  publish(event: EcosystemEvent): Promise<void>;

  /**
   * Subscribe to events of a specific type
   */
  subscribe(eventType: string, handler: EventHandler): void;

  /**
   * Subscribe once to an event type (auto-unsubscribes after first match)
   */
  subscribeOnce(eventType: string, handler: EventHandler): void;

  /**
   * Subscribe to all events (wildcard)
   */
  subscribeAll(handler: EventHandler): void;

  /**
   * Unsubscribe from events of a specific type
   */
  unsubscribe(eventType: string, handler: EventHandler): void;

  /**
   * Broadcast an event to all subscribers
   */
  broadcast(event: EcosystemEvent): Promise<void>;

  /**
   * Get the number of subscribers for an event type
   */
  getSubscriberCount(eventType: string): number;

  /**
   * Register middleware to process events before delivery
   */
  use(middleware: EventMiddleware): void;

  /**
   * Get event bus metrics
   */
  getMetrics(): EventBusMetrics;

  /**
   * Get recent events of a specific type from the in-memory log
   */
  getRecentEvents(eventType: string, limit?: number): EcosystemEvent[];

  /**
   * Clear the in-memory event log
   */
  clearLog(): void;
}
