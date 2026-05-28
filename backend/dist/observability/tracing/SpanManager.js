"use strict";
/**
 * SpanManager - Manages active spans and their relationships
 * Handles span lifecycle and parent-child relationships
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpanManager = void 0;
class SpanManager {
    activeSpans = new Map();
    traceSpans = new Map();
    currentContext = null;
    /**
     * Register a new span
     */
    registerSpan(span) {
        this.activeSpans.set(span.spanId, span);
        // Add to trace set
        if (!this.traceSpans.has(span.traceId)) {
            this.traceSpans.set(span.traceId, new Set());
        }
        this.traceSpans.get(span.traceId).add(span.spanId);
        // Set as parent if it has a parent
        if (span.parentSpanId) {
            const parentSpan = this.activeSpans.get(span.parentSpanId);
            if (parentSpan) {
                parentSpan.addChild(span.spanId);
            }
        }
        // Update current context
        this.currentContext = {
            traceId: span.traceId,
            spanId: span.spanId,
            parentSpanId: span.parentSpanId,
            baggage: {},
        };
    }
    /**
     * Get a span by ID
     */
    getSpan(spanId) {
        return this.activeSpans.get(spanId) || null;
    }
    /**
     * Remove a span (when ended)
     */
    removeSpan(spanId) {
        const span = this.activeSpans.get(spanId);
        if (!span)
            return;
        this.activeSpans.delete(spanId);
        // Clean up trace if no more spans
        const traceSet = this.traceSpans.get(span.traceId);
        if (traceSet) {
            traceSet.delete(spanId);
            if (traceSet.size === 0) {
                this.traceSpans.delete(span.traceId);
            }
        }
        // Update current context if this was the current span
        if (this.currentContext?.spanId === spanId) {
            this.currentContext = span.parentSpanId
                ? {
                    traceId: span.traceId,
                    spanId: span.parentSpanId,
                    baggage: {},
                }
                : null;
        }
    }
    /**
     * Get all spans for a trace
     */
    getTraceSpans(traceId) {
        const spanIds = this.traceSpans.get(traceId);
        if (!spanIds)
            return [];
        const spans = [];
        for (const spanId of spanIds) {
            const span = this.activeSpans.get(spanId);
            if (span) {
                spans.push(span);
            }
        }
        return spans;
    }
    /**
     * Get the current trace context
     */
    getCurrentContext() {
        return this.currentContext ? { ...this.currentContext } : null;
    }
    /**
     * Set the current trace context
     */
    setCurrentContext(context) {
        this.currentContext = { ...context };
    }
    /**
     * Get the number of active spans
     */
    getActiveSpanCount() {
        return this.activeSpans.size;
    }
    /**
     * Get the number of active traces
     */
    getActiveTraceCount() {
        return this.traceSpans.size;
    }
    /**
     * Clear all spans (for testing/shutdown)
     */
    clear() {
        this.activeSpans.clear();
        this.traceSpans.clear();
        this.currentContext = null;
    }
}
exports.SpanManager = SpanManager;
//# sourceMappingURL=SpanManager.js.map