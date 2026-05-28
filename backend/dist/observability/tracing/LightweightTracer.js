"use strict";
/**
 * LightweightTracer - OpenTelemetry-compatible tracing implementation
 *
 * This is a lightweight tracing system that follows OpenTelemetry concepts
 * without requiring the full SDK. It can be replaced with OpenTelemetry SDK
 * in the future without changing the interface.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LightweightTracer = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const env_1 = require("../../config/env");
const TraceContext_1 = require("./TraceContext");
const Span_1 = require("./Span");
const SpanManager_1 = require("./SpanManager");
class LightweightTracer {
    static instance;
    spanManager;
    serviceName = 'teamsync-backend';
    organizationId;
    workspaceId;
    supabase;
    constructor() {
        this.spanManager = new SpanManager_1.SpanManager();
        this.supabase = (0, supabase_js_1.createClient)(env_1.env.SUPABASE_URL, env_1.env.SUPABASE_SERVICE_ROLE_KEY);
    }
    static getInstance() {
        if (!LightweightTracer.instance) {
            LightweightTracer.instance = new LightweightTracer();
        }
        return LightweightTracer.instance;
    }
    /**
     * Start a new span
     */
    startSpan(operationName, parentContext) {
        let traceId;
        let parentSpanId;
        if (parentContext) {
            traceId = parentContext.traceId;
            parentSpanId = parentContext.spanId;
        }
        else {
            const currentContext = this.spanManager.getCurrentContext();
            if (currentContext) {
                traceId = currentContext.traceId;
                parentSpanId = currentContext.spanId;
            }
            else {
                traceId = TraceContext_1.TraceContext.generateTraceId();
            }
        }
        const spanId = TraceContext_1.TraceContext.generateSpanId();
        const span = new Span_1.Span(spanId, traceId, operationName, this.serviceName, parentSpanId);
        this.spanManager.registerSpan(span);
        return spanId;
    }
    /**
     * End a span and persist it to the database
     */
    async endSpan(spanId, status, metadata) {
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
        }
        catch (error) {
            console.error(`[Tracer] Failed to persist span ${spanId}:`, error);
        }
        this.spanManager.removeSpan(spanId);
    }
    /**
     * Get current trace context
     */
    getCurrentTraceContext() {
        return this.spanManager.getCurrentContext();
    }
    /**
     * Inject trace context into headers
     */
    injectContext(context, headers) {
        headers['x-trace-context'] = new TraceContext_1.TraceContext(context.traceId, context.spanId, context.parentSpanId, context.baggage).serialize();
    }
    /**
     * Extract trace context from headers
     */
    extractContext(headers) {
        const traceContextHeader = headers['x-trace-context'];
        if (!traceContextHeader) {
            return null;
        }
        return TraceContext_1.TraceContext.deserialize(traceContextHeader);
    }
    /**
     * Set service name
     */
    setServiceName(serviceName) {
        this.serviceName = serviceName;
    }
    /**
     * Get a span by ID
     */
    getSpan(spanId) {
        const span = this.spanManager.getSpan(spanId);
        return span ? span.toObject() : null;
    }
    /**
     * Get all spans for a trace from database
     */
    async getTraceSpans(traceId) {
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
        }
        catch (error) {
            console.error(`[Tracer] Failed to fetch trace ${traceId}:`, error);
            return [];
        }
    }
    /**
     * Set organization context
     */
    setOrganizationContext(organizationId, workspaceId) {
        this.organizationId = organizationId;
        this.workspaceId = workspaceId;
    }
    /**
     * Create a traced async function wrapper
     */
    async traceAsync(operationName, fn, parentContext) {
        const spanId = this.startSpan(operationName, parentContext);
        try {
            const result = await fn();
            await this.endSpan(spanId, 'success');
            return result;
        }
        catch (error) {
            await this.endSpan(spanId, 'failed', {
                error: error instanceof Error ? error.message : String(error),
            });
            throw error;
        }
    }
    /**
     * Create a traced sync function wrapper
     */
    trace(operationName, fn, parentContext) {
        const spanId = this.startSpan(operationName, parentContext);
        try {
            const result = fn();
            this.endSpan(spanId, 'success');
            return result;
        }
        catch (error) {
            this.endSpan(spanId, 'failed', {
                error: error instanceof Error ? error.message : String(error),
            });
            throw error;
        }
    }
}
exports.LightweightTracer = LightweightTracer;
//# sourceMappingURL=LightweightTracer.js.map