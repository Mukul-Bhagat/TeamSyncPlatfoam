import { z } from 'zod';

export const EventSeveritySchema = z.enum(['info', 'warning', 'critical']);

export const BaseEventSchema = z.object({
  source_app: z.string().min(1).max(100),
  organization_id: z.string().uuid(),
  workspace_id: z.string().uuid().optional(),
  channel_id: z.string().uuid().optional(),
  event_version: z.string().optional().default('1.0'),
  payload: z.record(z.unknown()).default({}),
  metadata: z.record(z.unknown()).default({}),
  severity: EventSeveritySchema.default('info'),
  correlation_id: z.string().optional(),
  triggered_by: z.string().optional(),
});

// Deployment events
export const DeploymentEventTypeSchema = z.enum([
  'deployment.started',
  'deployment.completed',
  'deployment.failed',
]);

export const DeploymentEventSchema = BaseEventSchema.extend({
  event_type: DeploymentEventTypeSchema,
  payload: z.object({
    deployment_id: z.string(),
    service: z.string(),
    environment: z.string(),
    version: z.string(),
    commit_sha: z.string().optional(),
    duration_ms: z.number().optional(),
    url: z.string().optional(),
    error_message: z.string().optional(),
  }).passthrough(),
});

// AI events
export const AIEventTypeSchema = z.enum([
  'ai.summary.generated',
  'ai.insight.detected',
]);

export const AIEventSchema = BaseEventSchema.extend({
  event_type: AIEventTypeSchema,
  payload: z.object({
    summary_id: z.string().optional(),
    insight_id: z.string().optional(),
    summary_type: z.string().optional(),
    channel_id: z.string().optional(),
    model: z.string().optional(),
    token_count: z.number().optional(),
    content: z.string().optional(),
  }).passthrough(),
});

// Incident events
export const IncidentEventTypeSchema = z.enum([
  'incident.created',
  'incident.updated',
  'incident.resolved',
]);

export const IncidentEventSchema = BaseEventSchema.extend({
  event_type: IncidentEventTypeSchema,
  payload: z.object({
    incident_id: z.string(),
    title: z.string(),
    description: z.string().optional(),
    severity: z.string().optional(),
    status: z.string().optional(),
    affected_services: z.array(z.string()).optional(),
    resolved_by: z.string().optional(),
  }).passthrough(),
});

// Workspace events
export const WorkspaceEventTypeSchema = z.enum([
  'workspace.created',
  'workspace.updated',
  'workspace.deleted',
]);

export const WorkspaceEventSchema = BaseEventSchema.extend({
  event_type: WorkspaceEventTypeSchema,
  payload: z.object({
    workspace_id: z.string(),
    workspace_name: z.string(),
    action: z.string().optional(),
  }).passthrough(),
});

// Channel events
export const ChannelEventTypeSchema = z.enum([
  'channel.created',
  'channel.updated',
  'channel.deleted',
]);

export const ChannelEventSchema = BaseEventSchema.extend({
  event_type: ChannelEventTypeSchema,
  payload: z.object({
    channel_id: z.string(),
    channel_name: z.string(),
    channel_type: z.string().optional(),
    action: z.string().optional(),
  }).passthrough(),
});

// Message events
export const MessageEventTypeSchema = z.enum([
  'message.created',
  'message.updated',
  'message.deleted',
  'mention.triggered',
]);

export const MessageEventSchema = BaseEventSchema.extend({
  event_type: MessageEventTypeSchema,
  payload: z.object({
    message_id: z.string(),
    channel_id: z.string().optional(),
    author_id: z.string().optional(),
    content_preview: z.string().optional(),
    mentioned_user_ids: z.array(z.string()).optional(),
  }).passthrough(),
});

// Pipeline events
export const PipelineEventTypeSchema = z.enum([
  'pipeline.started',
  'pipeline.completed',
  'pipeline.failed',
]);

export const PipelineEventSchema = BaseEventSchema.extend({
  event_type: PipelineEventTypeSchema,
  payload: z.object({
    pipeline_id: z.string(),
    pipeline_name: z.string().optional(),
    project: z.string().optional(),
    branch: z.string().optional(),
    commit_sha: z.string().optional(),
    status: z.string().optional(),
    duration_seconds: z.number().optional(),
    stages: z.array(z.object({
      name: z.string(),
      status: z.string(),
      duration_seconds: z.number().optional(),
    })).optional(),
  }).passthrough(),
});

// Analytics events
export const AnalyticsEventTypeSchema = z.enum([
  'analytics.alert',
  'metrics.threshold',
]);

export const AnalyticsEventSchema = BaseEventSchema.extend({
  event_type: AnalyticsEventTypeSchema,
  payload: z.object({
    alert_id: z.string().optional(),
    metric_id: z.string().optional(),
    metric_name: z.string().optional(),
    threshold_value: z.number().optional(),
    actual_value: z.number().optional(),
    condition: z.string().optional(),
    time_window: z.string().optional(),
  }).passthrough(),
});

// Unified discriminated union
export const EcosystemEventSchema = z.discriminatedUnion('event_type', [
  DeploymentEventSchema,
  AIEventSchema,
  IncidentEventSchema,
  WorkspaceEventSchema,
  ChannelEventSchema,
  MessageEventSchema,
  PipelineEventSchema,
  AnalyticsEventSchema,
]);

export type EcosystemEventInput = z.infer<typeof EcosystemEventSchema>;

// Generic create event body schema (for API endpoint - any valid event)
export const CreateEventBodySchema = BaseEventSchema.extend({
  event_type: z.string().min(1),
});

export type CreateEventBody = z.infer<typeof CreateEventBodySchema>;

// Query schema for event filtering
export const QueryEventsSchema = z.object({
  organization_id: z.string().uuid().optional(),
  workspace_id: z.string().uuid().optional(),
  channel_id: z.string().uuid().optional(),
  source_app: z.string().optional(),
  event_type: z.string().optional(),
  severity: EventSeveritySchema.optional(),
  correlation_id: z.string().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

export type QueryEventsInput = z.infer<typeof QueryEventsSchema>;
