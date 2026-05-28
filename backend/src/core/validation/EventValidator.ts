import { z } from 'zod';

// Base event schema
export const BaseEventSchema = z.object({
  event_type: z.string(),
  event_version: z.string().default('1.0'),
  timestamp: z.string().datetime(),
  data: z.record(z.unknown()),
});

// Deployment event schemas
export const DeploymentStartedSchema = BaseEventSchema.extend({
  event_type: z.literal('deployment.started'),
  data: z.object({
    deployment_id: z.string(),
    service: z.string(),
    environment: z.string(),
    version: z.string(),
    triggered_by: z.string(),
  }),
});

export const DeploymentCompletedSchema = BaseEventSchema.extend({
  event_type: z.literal('deployment.completed'),
  data: z.object({
    deployment_id: z.string(),
    service: z.string(),
    environment: z.string(),
    version: z.string(),
    duration_seconds: z.number(),
    status: z.string(),
  }),
});

export const DeploymentFailedSchema = BaseEventSchema.extend({
  event_type: z.literal('deployment.failed'),
  data: z.object({
    deployment_id: z.string(),
    service: z.string(),
    environment: z.string(),
    version: z.string(),
    error_message: z.string(),
    error_code: z.string().optional(),
  }),
});

// AI event schemas
export const AISummaryGeneratedSchema = BaseEventSchema.extend({
  event_type: z.literal('ai.summary.generated'),
  data: z.object({
    summary_id: z.string(),
    summary_type: z.string(),
    model: z.string(),
    context: z.string(),
    token_count: z.number().optional(),
  }),
});

export const AIInsightDetectedSchema = BaseEventSchema.extend({
  event_type: z.literal('ai.insight.detected'),
  data: z.object({
    insight_id: z.string(),
    insight_type: z.string(),
    confidence: z.number().min(0).max(1),
    description: z.string(),
    related_entities: z.array(z.string()).optional(),
  }),
});

// Incident event schemas
export const IncidentCreatedSchema = BaseEventSchema.extend({
  event_type: z.literal('incident.created'),
  data: z.object({
    incident_id: z.string(),
    title: z.string(),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    description: z.string(),
    affected_services: z.array(z.string()),
    triggered_by: z.string(),
  }),
});

export const IncidentResolvedSchema = BaseEventSchema.extend({
  event_type: z.literal('incident.resolved'),
  data: z.object({
    incident_id: z.string(),
    resolution_summary: z.string(),
    resolved_by: z.string(),
    duration_minutes: z.number(),
  }),
});

export const IncidentEscalatedSchema = BaseEventSchema.extend({
  event_type: z.literal('incident.escalated'),
  data: z.object({
    incident_id: z.string(),
    previous_severity: z.string(),
    new_severity: z.string(),
    escalated_by: z.string(),
    reason: z.string(),
  }),
});

// Workspace event schemas
export const WorkspaceCreatedSchema = BaseEventSchema.extend({
  event_type: z.literal('workspace.created'),
  data: z.object({
    workspace_id: z.string(),
    workspace_name: z.string(),
    created_by: z.string(),
    visibility: z.string(),
  }),
});

export const ChannelCreatedSchema = BaseEventSchema.extend({
  event_type: z.literal('channel.created'),
  data: z.object({
    channel_id: z.string(),
    channel_name: z.string(),
    workspace_id: z.string(),
    channel_type: z.string(),
    created_by: z.string(),
  }),
});

export const MemberJoinedSchema = BaseEventSchema.extend({
  event_type: z.literal('member.joined'),
  data: z.object({
    user_id: z.string(),
    workspace_id: z.string(),
    role: z.string(),
    invited_by: z.string(),
  }),
});

// Message event schemas
export const MessageCreatedSchema = BaseEventSchema.extend({
  event_type: z.literal('message.created'),
  data: z.object({
    message_id: z.string(),
    channel_id: z.string(),
    user_id: z.string(),
    content: z.string(),
    message_type: z.string().optional(),
  }),
});

export const MentionTriggeredSchema = BaseEventSchema.extend({
  event_type: z.literal('mention.triggered'),
  data: z.object({
    mention_id: z.string(),
    mentioned_user_id: z.string(),
    message_id: z.string(),
    channel_id: z.string(),
    mentioned_by: z.string(),
  }),
});

export const ThreadStartedSchema = BaseEventSchema.extend({
  event_type: z.literal('thread.started'),
  data: z.object({
    thread_id: z.string(),
    parent_message_id: z.string(),
    channel_id: z.string(),
    started_by: z.string(),
  }),
});

// Pipeline event schemas
export const PipelineStartedSchema = BaseEventSchema.extend({
  event_type: z.literal('pipeline.started'),
  data: z.object({
    pipeline_id: z.string(),
    pipeline_name: z.string(),
    project: z.string(),
    branch: z.string(),
    commit_sha: z.string(),
    triggered_by: z.string(),
  }),
});

export const PipelineCompletedSchema = BaseEventSchema.extend({
  event_type: z.literal('pipeline.completed'),
  data: z.object({
    pipeline_id: z.string(),
    status: z.string(),
    duration_seconds: z.number(),
    stages: z.array(z.object({
      name: z.string(),
      status: z.string(),
      duration_seconds: z.number().optional(),
    })),
  }),
});

export const PipelineFailedSchema = BaseEventSchema.extend({
  event_type: z.literal('pipeline.failed'),
  data: z.object({
    pipeline_id: z.string(),
    failed_stage: z.string(),
    error_message: z.string(),
    commit_sha: z.string(),
  }),
});

// Analytics event schemas
export const AnalyticsAlertSchema = BaseEventSchema.extend({
  event_type: z.literal('analytics.alert'),
  data: z.object({
    alert_id: z.string(),
    metric_name: z.string(),
    threshold_value: z.number(),
    actual_value: z.number(),
    severity: z.enum(['info', 'warning', 'critical']),
    time_window: z.string(),
  }),
});

export const MetricsThresholdSchema = BaseEventSchema.extend({
  event_type: z.literal('metrics.threshold'),
  data: z.object({
    metric_id: z.string(),
    metric_name: z.string(),
    threshold_type: z.string(),
    condition: z.string(),
    value: z.number(),
    previous_value: z.number().optional(),
  }),
});

// Union of all event schemas
export const AnyEventSchema = z.discriminatedUnion('event_type', [
  DeploymentStartedSchema,
  DeploymentCompletedSchema,
  DeploymentFailedSchema,
  AISummaryGeneratedSchema,
  AIInsightDetectedSchema,
  IncidentCreatedSchema,
  IncidentResolvedSchema,
  IncidentEscalatedSchema,
  WorkspaceCreatedSchema,
  ChannelCreatedSchema,
  MemberJoinedSchema,
  MessageCreatedSchema,
  MentionTriggeredSchema,
  ThreadStartedSchema,
  PipelineStartedSchema,
  PipelineCompletedSchema,
  PipelineFailedSchema,
  AnalyticsAlertSchema,
  MetricsThresholdSchema,
]);

export type ValidatedEvent = z.infer<typeof AnyEventSchema>;
