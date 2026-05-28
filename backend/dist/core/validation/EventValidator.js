"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnyEventSchema = exports.MetricsThresholdSchema = exports.AnalyticsAlertSchema = exports.PipelineFailedSchema = exports.PipelineCompletedSchema = exports.PipelineStartedSchema = exports.ThreadStartedSchema = exports.MentionTriggeredSchema = exports.MessageCreatedSchema = exports.MemberJoinedSchema = exports.ChannelCreatedSchema = exports.WorkspaceCreatedSchema = exports.IncidentEscalatedSchema = exports.IncidentResolvedSchema = exports.IncidentCreatedSchema = exports.AIInsightDetectedSchema = exports.AISummaryGeneratedSchema = exports.DeploymentFailedSchema = exports.DeploymentCompletedSchema = exports.DeploymentStartedSchema = exports.BaseEventSchema = void 0;
const zod_1 = require("zod");
// Base event schema
exports.BaseEventSchema = zod_1.z.object({
    event_type: zod_1.z.string(),
    event_version: zod_1.z.string().default('1.0'),
    timestamp: zod_1.z.string().datetime(),
    data: zod_1.z.record(zod_1.z.unknown()),
});
// Deployment event schemas
exports.DeploymentStartedSchema = exports.BaseEventSchema.extend({
    event_type: zod_1.z.literal('deployment.started'),
    data: zod_1.z.object({
        deployment_id: zod_1.z.string(),
        service: zod_1.z.string(),
        environment: zod_1.z.string(),
        version: zod_1.z.string(),
        triggered_by: zod_1.z.string(),
    }),
});
exports.DeploymentCompletedSchema = exports.BaseEventSchema.extend({
    event_type: zod_1.z.literal('deployment.completed'),
    data: zod_1.z.object({
        deployment_id: zod_1.z.string(),
        service: zod_1.z.string(),
        environment: zod_1.z.string(),
        version: zod_1.z.string(),
        duration_seconds: zod_1.z.number(),
        status: zod_1.z.string(),
    }),
});
exports.DeploymentFailedSchema = exports.BaseEventSchema.extend({
    event_type: zod_1.z.literal('deployment.failed'),
    data: zod_1.z.object({
        deployment_id: zod_1.z.string(),
        service: zod_1.z.string(),
        environment: zod_1.z.string(),
        version: zod_1.z.string(),
        error_message: zod_1.z.string(),
        error_code: zod_1.z.string().optional(),
    }),
});
// AI event schemas
exports.AISummaryGeneratedSchema = exports.BaseEventSchema.extend({
    event_type: zod_1.z.literal('ai.summary.generated'),
    data: zod_1.z.object({
        summary_id: zod_1.z.string(),
        summary_type: zod_1.z.string(),
        model: zod_1.z.string(),
        context: zod_1.z.string(),
        token_count: zod_1.z.number().optional(),
    }),
});
exports.AIInsightDetectedSchema = exports.BaseEventSchema.extend({
    event_type: zod_1.z.literal('ai.insight.detected'),
    data: zod_1.z.object({
        insight_id: zod_1.z.string(),
        insight_type: zod_1.z.string(),
        confidence: zod_1.z.number().min(0).max(1),
        description: zod_1.z.string(),
        related_entities: zod_1.z.array(zod_1.z.string()).optional(),
    }),
});
// Incident event schemas
exports.IncidentCreatedSchema = exports.BaseEventSchema.extend({
    event_type: zod_1.z.literal('incident.created'),
    data: zod_1.z.object({
        incident_id: zod_1.z.string(),
        title: zod_1.z.string(),
        severity: zod_1.z.enum(['low', 'medium', 'high', 'critical']),
        description: zod_1.z.string(),
        affected_services: zod_1.z.array(zod_1.z.string()),
        triggered_by: zod_1.z.string(),
    }),
});
exports.IncidentResolvedSchema = exports.BaseEventSchema.extend({
    event_type: zod_1.z.literal('incident.resolved'),
    data: zod_1.z.object({
        incident_id: zod_1.z.string(),
        resolution_summary: zod_1.z.string(),
        resolved_by: zod_1.z.string(),
        duration_minutes: zod_1.z.number(),
    }),
});
exports.IncidentEscalatedSchema = exports.BaseEventSchema.extend({
    event_type: zod_1.z.literal('incident.escalated'),
    data: zod_1.z.object({
        incident_id: zod_1.z.string(),
        previous_severity: zod_1.z.string(),
        new_severity: zod_1.z.string(),
        escalated_by: zod_1.z.string(),
        reason: zod_1.z.string(),
    }),
});
// Workspace event schemas
exports.WorkspaceCreatedSchema = exports.BaseEventSchema.extend({
    event_type: zod_1.z.literal('workspace.created'),
    data: zod_1.z.object({
        workspace_id: zod_1.z.string(),
        workspace_name: zod_1.z.string(),
        created_by: zod_1.z.string(),
        visibility: zod_1.z.string(),
    }),
});
exports.ChannelCreatedSchema = exports.BaseEventSchema.extend({
    event_type: zod_1.z.literal('channel.created'),
    data: zod_1.z.object({
        channel_id: zod_1.z.string(),
        channel_name: zod_1.z.string(),
        workspace_id: zod_1.z.string(),
        channel_type: zod_1.z.string(),
        created_by: zod_1.z.string(),
    }),
});
exports.MemberJoinedSchema = exports.BaseEventSchema.extend({
    event_type: zod_1.z.literal('member.joined'),
    data: zod_1.z.object({
        user_id: zod_1.z.string(),
        workspace_id: zod_1.z.string(),
        role: zod_1.z.string(),
        invited_by: zod_1.z.string(),
    }),
});
// Message event schemas
exports.MessageCreatedSchema = exports.BaseEventSchema.extend({
    event_type: zod_1.z.literal('message.created'),
    data: zod_1.z.object({
        message_id: zod_1.z.string(),
        channel_id: zod_1.z.string(),
        user_id: zod_1.z.string(),
        content: zod_1.z.string(),
        message_type: zod_1.z.string().optional(),
    }),
});
exports.MentionTriggeredSchema = exports.BaseEventSchema.extend({
    event_type: zod_1.z.literal('mention.triggered'),
    data: zod_1.z.object({
        mention_id: zod_1.z.string(),
        mentioned_user_id: zod_1.z.string(),
        message_id: zod_1.z.string(),
        channel_id: zod_1.z.string(),
        mentioned_by: zod_1.z.string(),
    }),
});
exports.ThreadStartedSchema = exports.BaseEventSchema.extend({
    event_type: zod_1.z.literal('thread.started'),
    data: zod_1.z.object({
        thread_id: zod_1.z.string(),
        parent_message_id: zod_1.z.string(),
        channel_id: zod_1.z.string(),
        started_by: zod_1.z.string(),
    }),
});
// Pipeline event schemas
exports.PipelineStartedSchema = exports.BaseEventSchema.extend({
    event_type: zod_1.z.literal('pipeline.started'),
    data: zod_1.z.object({
        pipeline_id: zod_1.z.string(),
        pipeline_name: zod_1.z.string(),
        project: zod_1.z.string(),
        branch: zod_1.z.string(),
        commit_sha: zod_1.z.string(),
        triggered_by: zod_1.z.string(),
    }),
});
exports.PipelineCompletedSchema = exports.BaseEventSchema.extend({
    event_type: zod_1.z.literal('pipeline.completed'),
    data: zod_1.z.object({
        pipeline_id: zod_1.z.string(),
        status: zod_1.z.string(),
        duration_seconds: zod_1.z.number(),
        stages: zod_1.z.array(zod_1.z.object({
            name: zod_1.z.string(),
            status: zod_1.z.string(),
            duration_seconds: zod_1.z.number().optional(),
        })),
    }),
});
exports.PipelineFailedSchema = exports.BaseEventSchema.extend({
    event_type: zod_1.z.literal('pipeline.failed'),
    data: zod_1.z.object({
        pipeline_id: zod_1.z.string(),
        failed_stage: zod_1.z.string(),
        error_message: zod_1.z.string(),
        commit_sha: zod_1.z.string(),
    }),
});
// Analytics event schemas
exports.AnalyticsAlertSchema = exports.BaseEventSchema.extend({
    event_type: zod_1.z.literal('analytics.alert'),
    data: zod_1.z.object({
        alert_id: zod_1.z.string(),
        metric_name: zod_1.z.string(),
        threshold_value: zod_1.z.number(),
        actual_value: zod_1.z.number(),
        severity: zod_1.z.enum(['info', 'warning', 'critical']),
        time_window: zod_1.z.string(),
    }),
});
exports.MetricsThresholdSchema = exports.BaseEventSchema.extend({
    event_type: zod_1.z.literal('metrics.threshold'),
    data: zod_1.z.object({
        metric_id: zod_1.z.string(),
        metric_name: zod_1.z.string(),
        threshold_type: zod_1.z.string(),
        condition: zod_1.z.string(),
        value: zod_1.z.number(),
        previous_value: zod_1.z.number().optional(),
    }),
});
// Union of all event schemas
exports.AnyEventSchema = zod_1.z.discriminatedUnion('event_type', [
    exports.DeploymentStartedSchema,
    exports.DeploymentCompletedSchema,
    exports.DeploymentFailedSchema,
    exports.AISummaryGeneratedSchema,
    exports.AIInsightDetectedSchema,
    exports.IncidentCreatedSchema,
    exports.IncidentResolvedSchema,
    exports.IncidentEscalatedSchema,
    exports.WorkspaceCreatedSchema,
    exports.ChannelCreatedSchema,
    exports.MemberJoinedSchema,
    exports.MessageCreatedSchema,
    exports.MentionTriggeredSchema,
    exports.ThreadStartedSchema,
    exports.PipelineStartedSchema,
    exports.PipelineCompletedSchema,
    exports.PipelineFailedSchema,
    exports.AnalyticsAlertSchema,
    exports.MetricsThresholdSchema,
]);
//# sourceMappingURL=EventValidator.js.map