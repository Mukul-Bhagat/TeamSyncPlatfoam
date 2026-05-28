/**
 * LightweightTracer - OpenTelemetry-compatible tracing implementation
 * 
 * This is a lightweight tracing system that follows OpenTelemetry concepts
 * without requiring the full SDK. It can be replaced with OpenTelemetry SDK
 * in the future without changing the interface.
 */

import { createClient } from '@supabase/supabase-js';
import { env } from '../../config/env';
import type { ITracer, SpanStatus, SpanMetadata, TraceContext, Span } from './ITracer';
import { TraceContext as TraceContextImpl } from './TraceContext';
import { Span as SpanImpl } from './Span';
import { SpanManager } from './SpanManager';

export class LightweightTracer implements ITracer {
  private static instance: LightweightTracer;
  private spanManager: SpanManager;
  private serviceName: string = 'teamsync-backend';
  private organizationId?: string;
  private workspaceId?: string;
  private supabase;

  private constructor() {
    this.spanManager = new SpanManager();
    this.supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  }

  static getInstance(): LightweightTracer {
    if (!LightweightTracer.instance) {
      LightweightTracer.instance = new LightweightTracer();
    }
    return LightweightTracer.instance;
  }

  /**
   * Start a new span
   */
  startSpan(operationName: string, parentContext?: TraceContext): string {
    let traceId: string;
    let parentSpanId: string | undefined;

    if (parentContext) {
      traceId = parentContext.traceId;
      parentSpanId = parentContext.spanId;
    } else {
      const currentContext = this.spanManager.getCurrentContext();
      if (currentContext) {
        traceId = currentContext.traceId;
        parentSpanId = currentContext.spanId;
      } else {
        traceId = TraceContextImpl.generateTraceId();
      }
    }

    const spanId = TraceContextImpl.generateSpanId();
    const span = new SpanImpl(
      spanId,
      traceId,
      operationName,
      this.serviceName,
      parentSpanId
    );

    this.spanManager.registerSpan(span);

    return spanId;
  }

  /**
   * End a span and persist it to the database
   */
  async endSpan(spanId: string, status: SpanStatus, metadata?: SpanMetadata): Promise<void> {
    const span = this.spanManager.getSpan(spanId);
    if (!span) {
      console.warn(`[Tracer] Span not found: ${spanId}`);
      return;
    }

    span.end(status, metadata);

    // Persist to database
    try {
      await this.supabase.from('system_traces').insert({
        trace_id: span.traceId,
        span_id: span.spanId,
        parent_span_id: span.parentSpanId,
        service_name: span.serviceName,
        operation_name: span.operationName,
        status: span.status,
        metadata: span.metadata,
        duration_ms: span.durationMs,
        started_at: span.startTime.toISOString(),
        completed_at: span.endTime?.toISOString(),
        organization_id: this.organizationId,
        workspace_id: this.workspaceId,
      });
    } catch (error) {
      console.error(`[Tracer] Failed to persist span ${spanId}:`, error);
    }

    this.spanManager.removeSpan(spanId);
  }

  /**
   * Get current trace context
   */
  getCurrentTraceContext(): TraceContext | null {
    return this.spanManager.getCurrentContext();
  }

  /**
   * Inject trace context into headers
   */
  injectContext(context: TraceContext, headers: Record<string, string>): void {
    headers['x-trace-context'] = new TraceContextImpl(
      context.traceId,
      context.spanId,
      context.parentSpanId,
      context.baggage
    ).serialize();
  }

  /**
   * Extract trace context from headers
   */
  extractContext(headers: Record<string, string>): TraceContext | null {
    const traceContextHeader = headers['x-trace-context'];
    if (!traceContextHeader) {
      return null;
    }

    return TraceContextImpl.deserialize(traceContextHeader);
  }

  /**
   * Set service name
   */
  setServiceName(serviceName: string): void {
    this.serviceName = serviceName;
  }

  /**
   * Get a span by ID
   */
  getSpan(spanId: string): Span | null {
    const span = this.spanManager.getSpan(spanId);
    return span ? span.toObject() : null;
  }

  /**
   * Get all spans for a trace from database
   */
  async getTraceSpans(traceId: string): Promise<Span[]> {
    try {
      const { data, error } = await this.supabase
        .from('system_traces')
        .select('*')
        .eq('trace_id', traceId)
        .order('started_at', { ascending: true });

      if (error) {
        console.error(`[Tracer] Failed to fetch trace ${traceId}:`, error);
        return [];
      }

      return (data || []).map((row) => ({
        spanId: row.span_id,
        traceId: row.trace_id,
        parentSpanId: row.parent_span_id,
        operationName: row.operation_name,
        serviceName: row.service_name,
        startTime: new Date(row.started_at),
        endTime: row.completed_at ? new Date(row.completed_at) : undefined,
        durationMs: row.duration_ms,
        status: row.status,
        metadata: row.metadata,
        tags: {},
      }));
    } catch (error) {
      console.error(`[Tracer] Failed to fetch trace ${traceId}:`, error);
      return [];
    }
  }

  /**
   * Set organization context
   */
  setOrganizationContext(organizationId: string, workspaceId?: string): void {
    this.organizationId = organizationId;
    this.workspaceId = workspaceId;
  }

  /**
   * Create a traced async function wrapper
   */
  async traceAsync<T>(
    operationName: string,
    fn: () => Promise<T>,
    parentContext?: TraceContext
  ): Promise<T> {
    const spanId = this.startSpan(operationName, parentContext);
    
    try {
      const result = await fn();
      await this.endSpan(spanId, 'success');
      return result;
    } catch (error) {
      await this.endSpan(spanId, 'failed', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Create a traced sync function wrapper
   */
  trace<T>(
    operationName: string,
    fn: () => T,
    parentContext?: TraceContext
  ): T {
    const spanId = this.startSpan(operationName, parentContext);
    
    try {
      const result = fn();
      this.endSpan(spanId, 'success');
      return result;
    } catch (error) {
      this.endSpan(spanId, 'failed', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}
