/**
 * ITracer - OpenTelemetry-compatible tracing interface
 *
 * This interface follows OpenTelemetry concepts without requiring the full SDK.
 * Future migration to OpenTelemetry SDK can be done by replacing the implementation
 * while keeping this interface unchanged.
 */
export type SpanStatus = 'success' | 'failed' | 'timeout' | 'cancelled';
export interface TraceContext {
    traceId: string;
    spanId: string;
    parentSpanId?: string;
    baggage: Record<string, string>;
}
export interface SpanMetadata {
    [key: string]: unknown;
}
export interface Span {
    spanId: string;
    traceId: string;
    parentSpanId?: string;
    operationName: string;
    serviceName: string;
    startTime: Date;
    endTime?: Date;
    durationMs?: number;
    status?: SpanStatus;
    metadata: SpanMetadata;
    tags: Record<string, string>;
}
export interface ITracer {
    /**
     * Start a new span with the given operation name
     * @param operationName - Name of the operation being traced
     * @param parentContext - Optional parent trace context for child spans
     * @returns The span ID of the created span
     */
    startSpan(operationName: string, parentContext?: TraceContext): string;
    /**
     * End a span with the given status and metadata
     * @param spanId - ID of the span to end
     * @param status - Status of the span
     * @param metadata - Optional metadata to attach to the span
     */
    endSpan(spanId: string, status: SpanStatus, metadata?: SpanMetadata): Promise<void>;
    /**
     * Get the current trace context for the active span
     * @returns The current trace context or null if no active span
     */
    getCurrentTraceContext(): TraceContext | null;
    /**
     * Inject trace context into headers for propagation
     * @param context - Trace context to inject
     * @param headers - Headers object to inject into
     */
    injectContext(context: TraceContext, headers: Record<string, string>): void;
    /**
     * Extract trace context from headers
     * @param headers - Headers to extract from
     * @returns Extracted trace context or null if not found
     */
    extractContext(headers: Record<string, string>): TraceContext | null;
    /**
     * Set the service name for all spans created by this tracer
     * @param serviceName - Name of the service
     */
    setServiceName(serviceName: string): void;
    /**
     * Get a span by ID
     * @param spanId - ID of the span to retrieve
     * @returns The span or null if not found
     */
    getSpan(spanId: string): Span | null;
    /**
     * Get all spans for a trace
     * @param traceId - ID of the trace
     * @returns Array of spans for the trace
     */
    getTraceSpans(traceId: string): Promise<Span[]>;
    /**
     * Set organization context for all spans
     * @param organizationId - Organization ID
     * @param workspaceId - Optional workspace ID
     */
    setOrganizationContext(organizationId: string, workspaceId?: string): void;
}
//# sourceMappingURL=ITracer.d.ts.map