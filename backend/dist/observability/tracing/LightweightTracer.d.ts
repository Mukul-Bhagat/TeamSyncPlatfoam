/**
 * LightweightTracer - OpenTelemetry-compatible tracing implementation
 *
 * This is a lightweight tracing system that follows OpenTelemetry concepts
 * without requiring the full SDK. It can be replaced with OpenTelemetry SDK
 * in the future without changing the interface.
 */
import type { ITracer, SpanStatus, SpanMetadata, TraceContext, Span } from './ITracer';
export declare class LightweightTracer implements ITracer {
    private static instance;
    private spanManager;
    private serviceName;
    private organizationId?;
    private workspaceId?;
    private supabase;
    private constructor();
    static getInstance(): LightweightTracer;
    /**
     * Start a new span
     */
    startSpan(operationName: string, parentContext?: TraceContext): string;
    /**
     * End a span and persist it to the database
     */
    endSpan(spanId: string, status: SpanStatus, metadata?: SpanMetadata): Promise<void>;
    /**
     * Get current trace context
     */
    getCurrentTraceContext(): TraceContext | null;
    /**
     * Inject trace context into headers
     */
    injectContext(context: TraceContext, headers: Record<string, string>): void;
    /**
     * Extract trace context from headers
     */
    extractContext(headers: Record<string, string>): TraceContext | null;
    /**
     * Set service name
     */
    setServiceName(serviceName: string): void;
    /**
     * Get a span by ID
     */
    getSpan(spanId: string): Span | null;
    /**
     * Get all spans for a trace from database
     */
    getTraceSpans(traceId: string): Promise<Span[]>;
    /**
     * Set organization context
     */
    setOrganizationContext(organizationId: string, workspaceId?: string): void;
    /**
     * Create a traced async function wrapper
     */
    traceAsync<T>(operationName: string, fn: () => Promise<T>, parentContext?: TraceContext): Promise<T>;
    /**
     * Create a traced sync function wrapper
     */
    trace<T>(operationName: string, fn: () => T, parentContext?: TraceContext): T;
}
//# sourceMappingURL=LightweightTracer.d.ts.map