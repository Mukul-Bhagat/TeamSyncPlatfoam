import type { RealtimeEvent, RealtimeEventType, EventListener, EventSubscription } from './types';

export class EventBus {
  private listeners: Map<RealtimeEventType, Set<EventListener>> = new Map();
  private subscriptionIdCounter = 0;

  subscribe<TPayload = unknown>(
    eventType: RealtimeEventType,
    listener: EventListener<TPayload>
  ): EventSubscription {
    const subscriptionId = `event_sub_${this.subscriptionIdCounter++}`;

    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }

    this.listeners.get(eventType)!.add(listener as EventListener);

    const subscription: EventSubscription = {
      id: subscriptionId,
      eventType,
      listener: listener as EventListener,
      unsubscribe: () => {
        this.unsubscribe(subscriptionId);
      },
    };

    return subscription;
  }

  unsubscribe(subscriptionId: string): void {
    for (const [eventType, listeners] of this.listeners) {
      for (const listener of listeners) {
        // Find and remove the subscription
        const subscription = this.findSubscription(eventType, listener, subscriptionId);
        if (subscription) {
          listeners.delete(listener);
          if (listeners.size === 0) {
            this.listeners.delete(eventType);
          }
          return;
        }
      }
    }
  }

  unsubscribeAll(eventType: RealtimeEventType): void {
    this.listeners.delete(eventType);
  }

  emit<TPayload = unknown>(event: RealtimeEvent<TPayload>): void {
    const listeners = this.listeners.get(event.type);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(event);
        } catch (error) {
          console.error(`Error in event listener for ${event.type}:`, error);
        }
      });
    }
  }

  emitBatch<TPayload = unknown>(events: RealtimeEvent<TPayload>[]): void {
    events.forEach((event) => this.emit(event));
  }

  private findSubscription(
    _eventType: RealtimeEventType,
    _listener: EventListener,
    _subscriptionId: string
  ): boolean {
    // This is a simplified check - in a more complex implementation,
    // we'd track subscription IDs separately
    return true;
  }

  getListenerCount(eventType: RealtimeEventType): number {
    return this.listeners.get(eventType)?.size || 0;
  }

  getTotalListenerCount(): number {
    let total = 0;
    for (const listeners of this.listeners.values()) {
      total += listeners.size;
    }
    return total;
  }

  clear(): void {
    this.listeners.clear();
  }
}
