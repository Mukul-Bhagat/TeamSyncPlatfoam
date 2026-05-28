/**
 * TraceContext - Manages trace context for distributed tracing
 * Follows OpenTelemetry context propagation concepts
 */

import type { TraceContext as ITraceContext } from './ITracer';

export class TraceContext implements ITraceContext {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  baggage: Record<string, string>;

  constructor(
    traceId: string,
    spanId: string,
    parentSpanId?: string,
    baggage: Record<string, string> = {}
  ) {
    this.traceId = traceId;
    this.spanId = spanId;
    this.parentSpanId = parentSpanId;
    this.baggage = baggage;
  }

  /**
   * Create a new trace context with a new trace ID
   */
  static createNew(): TraceContext {
    return new TraceContext(
      TraceContext.generateTraceId(),
      TraceContext.generateSpanId()
    );
  }

  /**
   * Create a child context from a parent context
   */
  static createChild(parent: ITraceContext): TraceContext {
    return new TraceContext(
      parent.traceId,
      TraceContext.generateSpanId(),
      parent.spanId,
      { ...parent.baggage }
    );
  }

  /**
   * Serialize context to a string for header propagation
   */
  serialize(): string {
    const parts = [
      `trace-id=${this.traceId}`,
      `span-id=${this.spanId}`,
    ];
    
    if (this.parentSpanId) {
      parts.push(`parent-span-id=${this.parentSpanId}`);
    }

    if (Object.keys(this.baggage).length > 0) {
      const baggageStr = Object.entries(this.baggage)
        .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
        .join(',');
      parts.push(`baggage=${baggageStr}`);
    }

    return parts.join(';');
  }

  /**
   * Deserialize context from a string
   */
  static deserialize(serialized: string): TraceContext | null {
    try {
      const parts = serialized.split(';');
      let traceId: string | undefined;
      let spanId: string | undefined;
      let parentSpanId: string | undefined;
      const baggage: Record<string, string> = {};

      for (const part of parts) {
        const [key, value] = part.split('=');
        if (!key || !value) continue;

        switch (key) {
          case 'trace-id':
            traceId = value;
            break;
          case 'span-id':
            spanId = value;
            break;
          case 'parent-span-id':
            parentSpanId = value;
            break;
          case 'baggage':
            const baggageParts = value.split(',');
            for (const baggagePart of baggageParts) {
              const [bKey, bValue] = baggagePart.split('=');
              if (bKey && bValue) {
                baggage[bKey] = decodeURIComponent(bValue);
              }
            }
            break;
        }
      }

      if (!traceId || !spanId) {
        return null;
      }

      return new TraceContext(traceId, spanId, parentSpanId, baggage);
    } catch {
      return null;
    }
  }

  /**
   * Generate a unique trace ID (UUID-based)
   */
  static generateTraceId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Generate a unique span ID
   */
  static generateSpanId(): string {
    return 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, () => {
      return ((Math.random() * 16) | 0).toString(16);
    });
  }

  /**
   * Add baggage item
   */
  setBaggage(key: string, value: string): void {
    this.baggage[key] = value;
  }

  /**
   * Get baggage item
   */
  getBaggage(key: string): string | undefined {
    return this.baggage[key];
  }

  /**
   * Clone the context
   */
  clone(): TraceContext {
    return new TraceContext(
      this.traceId,
      this.spanId,
      this.parentSpanId,
      { ...this.baggage }
    );
  }
}
