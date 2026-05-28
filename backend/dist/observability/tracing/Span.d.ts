/**
 * Span - Represents a single operation in a trace
 * Follows OpenTelemetry span concepts
 */
import type { Span as ISpan, SpanStatus, SpanMetadata } from './ITracer';
export declare class Span implements ISpan {
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
    private _children;
    constructor(spanId: string, traceId: string, operationName: string, serviceName: string, parentSpanId?: string);
    /**
     * End the span with a status
     */
    end(status: SpanStatus, metadata?: SpanMetadata): void;
    /**
     * Set a tag on the span
     */
    setTag(key: string, value: string): void;
    /**
     * Set metadata on the span
     */
    setMetadata(key: string, value: unknown): void;
    /**
     * Add a child span ID
     */
    addChild(childSpanId: string): void;
    /**
     * Get child span IDs
     */
    getChildren(): string[];
    /**
     * Check if the span is active (not ended)
     */
    isActive(): boolean;
    /**
     * Convert to plain object for storage
     */
    toObject(): ISpan;
}
//# sourceMappingURL=Span.d.ts.map