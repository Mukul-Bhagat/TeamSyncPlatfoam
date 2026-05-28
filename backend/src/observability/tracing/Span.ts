/**
 * Span - Represents a single operation in a trace
 * Follows OpenTelemetry span concepts
 */

import type { Span as ISpan, SpanStatus, SpanMetadata } from './ITracer';

export class Span implements ISpan {
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
  private _children: string[] = [];

  constructor(
    spanId: string,
    traceId: string,
    operationName: string,
    serviceName: string,
    parentSpanId?: string
  ) {
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
  end(status: SpanStatus, metadata?: SpanMetadata): void {
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
  setTag(key: string, value: string): void {
    this.tags[key] = value;
  }

  /**
   * Set metadata on the span
   */
  setMetadata(key: string, value: unknown): void {
    this.metadata[key] = value;
  }

  /**
   * Add a child span ID
   */
  addChild(childSpanId: string): void {
    this._children.push(childSpanId);
  }

  /**
   * Get child span IDs
   */
  getChildren(): string[] {
    return [...this._children];
  }

  /**
   * Check if the span is active (not ended)
   */
  isActive(): boolean {
    return !this.endTime;
  }

  /**
   * Convert to plain object for storage
   */
  toObject(): ISpan {
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
