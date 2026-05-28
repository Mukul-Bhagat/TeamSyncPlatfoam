"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalEventBus = void 0;
const events_1 = require("events");
class InternalEventBus extends events_1.EventEmitter {
    static instance;
    eventLog = new Map();
    middlewares = [];
    totalPublished = 0;
    droppedEvents = 0;
    eventTypeCounts = new Map();
    deadLetterLog = [];
    constructor() {
        super();
        this.setMaxListeners(200);
    }
    static getInstance() {
        if (!InternalEventBus.instance) {
            InternalEventBus.instance = new InternalEventBus();
        }
        return InternalEventBus.instance;
    }
    async publish(event) {
        try {
            this.totalPublished++;
            this.eventTypeCounts.set(event.event_type, (this.eventTypeCounts.get(event.event_type) || 0) + 1);
            // Run middleware pipeline
            await this.runMiddleware(event);
            // Log event for debugging
            this.logEvent(event);
            // Emit to event type subscribers
            this.emit(event.event_type, event);
            // Emit to all subscribers (wildcard)
            this.emit('*', event);
        }
        catch (error) {
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
    async runMiddleware(event) {
        const execute = async (index) => {
            if (index >= this.middlewares.length)
                return;
            const middleware = this.middlewares[index];
            await middleware(event, () => execute(index + 1));
        };
        await execute(0);
    }
    subscribe(eventType, handler) {
        this.on(eventType, handler);
        console.log(`[EventBus] Subscribed to: ${eventType}`);
    }
    subscribeOnce(eventType, handler) {
        const onceHandler = async (event) => {
            this.off(eventType, onceHandler);
            await handler(event);
        };
        this.on(eventType, onceHandler);
    }
    subscribeAll(handler) {
        this.on('*', handler);
    }
    unsubscribe(eventType, handler) {
        this.off(eventType, handler);
    }
    async broadcast(event) {
        await this.publish(event);
    }
    getSubscriberCount(eventType) {
        return this.listenerCount(eventType);
    }
    use(middleware) {
        this.middlewares.push(middleware);
    }
    getMetrics() {
        let totalSubscribers = 0;
        this.eventNames().forEach((name) => {
            totalSubscribers += this.listenerCount(name);
        });
        const counts = {};
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
    getDeadLetterLog(limit = 50) {
        return this.deadLetterLog.slice(-limit);
    }
    logEvent(event) {
        const events = this.eventLog.get(event.event_type) || [];
        events.push(event);
        // Keep only last 100 events per type
        if (events.length > 100) {
            events.shift();
        }
        this.eventLog.set(event.event_type, events);
    }
    getRecentEvents(eventType, limit = 10) {
        const events = this.eventLog.get(eventType) || [];
        return events.slice(-limit);
    }
    clearLog() {
        this.eventLog.clear();
        this.deadLetterLog = [];
        this.totalPublished = 0;
        this.droppedEvents = 0;
        this.eventTypeCounts.clear();
    }
}
exports.InternalEventBus = InternalEventBus;
//# sourceMappingURL=InternalEventBus.js.map