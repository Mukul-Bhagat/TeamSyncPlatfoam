/**
 * TraceContext - Manages trace context for distributed tracing
 * Follows OpenTelemetry context propagation concepts
 */
import type { TraceContext as ITraceContext } from './ITracer';
export declare class TraceContext implements ITraceContext {
    traceId: string;
    spanId: string;
    parentSpanId?: string;
    baggage: Record<string, string>;
    constructor(traceId: string, spanId: string, parentSpanId?: string, baggage?: Record<string, string>);
    /**
     * Create a new trace context with a new trace ID
     */
    static createNew(): TraceContext;
    /**
     * Create a child context from a parent context
     */
    static createChild(parent: ITraceContext): TraceContext;
    /**
     * Serialize context to a string for header propagation
     */
    serialize(): string;
    /**
     * Deserialize context from a string
     */
    static deserialize(serialized: string): TraceContext | null;
    /**
     * Generate a unique trace ID (UUID-based)
     */
    static generateTraceId(): string;
    /**
     * Generate a unique span ID
     */
    static generateSpanId(): string;
    /**
     * Add baggage item
     */
    setBaggage(key: string, value: string): void;
    /**
     * Get baggage item
     */
    getBaggage(key: string): string | undefined;
    /**
     * Clone the context
     */
    clone(): TraceContext;
}
//# sourceMappingURL=TraceContext.d.ts.map