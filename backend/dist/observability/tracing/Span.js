"use strict";
/**
 * Span - Represents a single operation in a trace
 * Follows OpenTelemetry span concepts
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Span = void 0;
class Span {
    spanId;
    traceId;
    parentSpanId;
    operationName;
    serviceName;
    startTime;
    endTime;
    durationMs;
    status;
    metadata;
    tags;
    _children = [];
    constructor(spanId, traceId, operationName, serviceName, parentSpanId) {
        this.spanId = spanId;
        this.traceId = traceId;
        this.operationName = operationName;
        this.serviceName = serviceName;
        this.parentSpanId = parentSpanId;
        this.startTime = new Date();
        this.metadata = {};
        this.tags = {};
    }
    /**
     * End the span with a status
     */
    end(status, metadata) {
        this.endTime = new Date();
        this.status = status;
        this.durationMs = this.endTime.getTime() - this.startTime.getTime();
        if (metadata) {
            this.metadata = { ...this.metadata, ...metadata };
        }
    }
    /**
     * Set a tag on the span
     */
    setTag(key, value) {
        this.tags[key] = value;
    }
    /**
     * Set metadata on the span
     */
    setMetadata(key, value) {
        this.metadata[key] = value;
    }
    /**
     * Add a child span ID
     */
    addChild(childSpanId) {
        this._children.push(childSpanId);
    }
    /**
     * Get child span IDs
     */
    getChildren() {
        return [...this._children];
    }
    /**
     * Check if the span is active (not ended)
     */
    isActive() {
        return !this.endTime;
    }
    /**
     * Convert to plain object for storage
     */
    toObject() {
        return {
            spanId: this.spanId,
            traceId: this.traceId,
            parentSpanId: this.parentSpanId,
            operationName: this.operationName,
            serviceName: this.serviceName,
            startTime: this.startTime,
            endTime: this.endTime,
            durationMs: this.durationMs,
            status: this.status,
            metadata: this.metadata,
            tags: this.tags,
        };
    }
}
exports.Span = Span;
//# sourceMappingURL=Span.js.map