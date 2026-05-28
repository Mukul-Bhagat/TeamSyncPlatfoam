/**
 * SpanManager - Manages active spans and their relationships
 * Handles span lifecycle and parent-child relationships
 */
import { Span } from './Span';
import type { TraceContext } from './ITracer';
export declare class SpanManager {
    private activeSpans;
    private traceSpans;
    private currentContext;
    /**
     * Register a new span
     */
    registerSpan(span: Span): void;
    /**
     * Get a span by ID
     */
    getSpan(spanId: string): Span | null;
    /**
     * Remove a span (when ended)
     */
    removeSpan(spanId: string): void;
    /**
     * Get all spans for a trace
     */
    getTraceSpans(traceId: string): Span[];
    /**
     * Get the current trace context
     */
    getCurrentContext(): TraceContext | null;
    /**
     * Set the current trace context
     */
    setCurrentContext(context: TraceContext): void;
    /**
     * Get the number of active spans
     */
    getActiveSpanCount(): number;
    /**
     * Get the number of active traces
     */
    getActiveTraceCount(): number;
    /**
     * Clear all spans (for testing/shutdown)
     */
    clear(): void;
}
//# sourceMappingURL=SpanManager.d.ts.map