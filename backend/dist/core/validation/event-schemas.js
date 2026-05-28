"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryEventsSchema = exports.CreateEventBodySchema = exports.EcosystemEventSchema = exports.AnalyticsEventSchema = exports.AnalyticsEventTypeSchema = exports.PipelineEventSchema = exports.PipelineEventTypeSchema = exports.MessageEventSchema = exports.MessageEventTypeSchema = exports.ChannelEventSchema = exports.ChannelEventTypeSchema = exports.WorkspaceEventSchema = exports.WorkspaceEventTypeSchema = exports.IncidentEventSchema = exports.IncidentEventTypeSchema = exports.AIEventSchema = exports.AIEventTypeSchema = exports.DeploymentEventSchema = exports.DeploymentEventTypeSchema = exports.BaseEventSchema = exports.EventSeveritySchema = void 0;
const zod_1 = require("zod");
exports.EventSeveritySchema = zod_1.z.enum(['info', 'warning', 'critical']);
exports.BaseEventSchema = zod_1.z.object({
    source_app: zod_1.z.string().min(1).max(100),
    organization_id: zod_1.z.string().uuid(),
    workspace_id: zod_1.z.string().uuid().optional(),
    channel_id: zod_1.z.string().uuid().optional(),
    event_version: zod_1.z.string().optional().default('1.0'),
    payload: zod_1.z.record(zod_1.z.unknown()).default({}),
    metadata: zod_1.z.record(zod_1.z.unknown()).default({}),
    severity: exports.EventSeveritySchema.default('info'),
    correlation_id: zod_1.z.string().optional(),
    triggered_by: zod_1.z.string().optional(),
});
// Deployment events
exports.DeploymentEventTypeSchema = zod_1.z.enum([
    'deployment.started',
    'deployment.completed',
    'deployment.failed',
]);
exports.DeploymentEventSchema = exports.BaseEventSchema.extend({
    event_type: exports.DeploymentEventTypeSchema,
    payload: zod_1.z.object({
        deployment_id: zod_1.z.string(),
        service: zod_1.z.string(),
        environment: zod_1.z.string(),
        version: zod_1.z.string(),
        commit_sha: zod_1.z.string().optional(),
        duration_ms: zod_1.z.number().optional(),
        url: zod_1.z.string().optional(),
        error_message: zod_1.z.string().optional(),
    }).passthrough(),
});
// AI events
exports.AIEventTypeSchema = zod_1.z.enum([
    'ai.summary.generated',
    'ai.insight.detected',
]);
exports.AIEventSchema = exports.BaseEventSchema.extend({
    event_type: exports.AIEventTypeSchema,
    payload: zod_1.z.object({
        summary_id: zod_1.z.string().optional(),
        insight_id: zod_1.z.string().optional(),
        summary_type: zod_1.z.string().optional(),
        channel_id: zod_1.z.string().optional(),
        model: zod_1.z.string().optional(),
        token_count: zod_1.z.number().optional(),
        content: zod_1.z.string().optional(),
    }).passthrough(),
});
// Incident events
exports.IncidentEventTypeSchema = zod_1.z.enum([
    'incident.created',
    'incident.updated',
    'incident.resolved',
]);
exports.IncidentEventSchema = exports.BaseEventSchema.extend({
    event_type: exports.IncidentEventTypeSchema,
    payload: zod_1.z.object({
        incident_id: zod_1.z.string(),
        title: zod_1.z.string(),
        description: zod_1.z.string().optional(),
        severity: zod_1.z.string().optional(),
        status: zod_1.z.string().optional(),
        affected_services: zod_1.z.array(zod_1.z.string()).optional(),
        resolved_by: zod_1.z.string().optional(),
    }).passthrough(),
});
// Workspace events
exports.WorkspaceEventTypeSchema = zod_1.z.enum([
    'workspace.created',
    'workspace.updated',
    'workspace.deleted',
]);
exports.WorkspaceEventSchema = exports.BaseEventSchema.extend({
    event_type: exports.WorkspaceEventTypeSchema,
    payload: zod_1.z.object({
        workspace_id: zod_1.z.string(),
        workspace_name: zod_1.z.string(),
        action: zod_1.z.string().optional(),
    }).passthrough(),
});
// Channel events
exports.ChannelEventTypeSchema = zod_1.z.enum([
    'channel.created',
    'channel.updated',
    'channel.deleted',
]);
exports.ChannelEventSchema = exports.BaseEventSchema.extend({
    event_type: exports.ChannelEventTypeSchema,
    payload: zod_1.z.object({
        channel_id: zod_1.z.string(),
        channel_name: zod_1.z.string(),
        channel_type: zod_1.z.string().optional(),
        action: zod_1.z.string().optional(),
    }).passthrough(),
});
// Message events
exports.MessageEventTypeSchema = zod_1.z.enum([
    'message.created',
    'message.updated',
    'message.deleted',
    'mention.triggered',
]);
exports.MessageEventSchema = exports.BaseEventSchema.extend({
    event_type: exports.MessageEventTypeSchema,
    payload: zod_1.z.object({
        message_id: zod_1.z.string(),
        channel_id: zod_1.z.string().optional(),
        author_id: zod_1.z.string().optional(),
        content_preview: zod_1.z.string().optional(),
        mentioned_user_ids: zod_1.z.array(zod_1.z.string()).optional(),
    }).passthrough(),
});
// Pipeline events
exports.PipelineEventTypeSchema = zod_1.z.enum([
    'pipeline.started',
    'pipeline.completed',
    'pipeline.failed',
]);
exports.PipelineEventSchema = exports.BaseEventSchema.extend({
    event_type: exports.PipelineEventTypeSchema,
    payload: zod_1.z.object({
        pipeline_id: zod_1.z.string(),
        pipeline_name: zod_1.z.string().optional(),
        project: zod_1.z.string().optional(),
        branch: zod_1.z.string().optional(),
        commit_sha: zod_1.z.string().optional(),
        status: zod_1.z.string().optional(),
        duration_seconds: zod_1.z.number().optional(),
        stages: zod_1.z.array(zod_1.z.object({
            name: zod_1.z.string(),
            status: zod_1.z.string(),
            duration_seconds: zod_1.z.number().optional(),
        })).optional(),
    }).passthrough(),
});
// Analytics events
exports.AnalyticsEventTypeSchema = zod_1.z.enum([
    'analytics.alert',
    'metrics.threshold',
]);
exports.AnalyticsEventSchema = exports.BaseEventSchema.extend({
    event_type: exports.AnalyticsEventTypeSchema,
    payload: zod_1.z.object({
        alert_id: zod_1.z.string().optional(),
        metric_id: zod_1.z.string().optional(),
        metric_name: zod_1.z.string().optional(),
        threshold_value: zod_1.z.number().optional(),
        actual_value: zod_1.z.number().optional(),
        condition: zod_1.z.string().optional(),
        time_window: zod_1.z.string().optional(),
    }).passthrough(),
});
// Unified discriminated union
exports.EcosystemEventSchema = zod_1.z.discriminatedUnion('event_type', [
    exports.DeploymentEventSchema,
    exports.AIEventSchema,
    exports.IncidentEventSchema,
    exports.WorkspaceEventSchema,
    exports.ChannelEventSchema,
    exports.MessageEventSchema,
    exports.PipelineEventSchema,
    exports.AnalyticsEventSchema,
]);
// Generic create event body schema (for API endpoint - any valid event)
exports.CreateEventBodySchema = exports.BaseEventSchema.extend({
    event_type: zod_1.z.string().min(1),
});
// Query schema for event filtering
exports.QueryEventsSchema = zod_1.z.object({
    organization_id: zod_1.z.string().uuid().optional(),
    workspace_id: zod_1.z.string().uuid().optional(),
    channel_id: zod_1.z.string().uuid().optional(),
    source_app: zod_1.z.string().optional(),
    event_type: zod_1.z.string().optional(),
    severity: exports.EventSeveritySchema.optional(),
    correlation_id: zod_1.z.string().optional(),
    from: zod_1.z.string().datetime().optional(),
    to: zod_1.z.string().datetime().optional(),
    limit: zod_1.z.coerce.number().int().min(1).max(100).optional().default(50),
    offset: zod_1.z.coerce.number().int().min(0).optional().default(0),
});
//# sourceMappingURL=event-schemas.js.map