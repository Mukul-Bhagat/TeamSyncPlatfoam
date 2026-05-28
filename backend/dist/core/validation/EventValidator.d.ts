import { z } from 'zod';
export declare const BaseEventSchema: z.ZodObject<{
    event_type: z.ZodString;
    event_version: z.ZodDefault<z.ZodString>;
    timestamp: z.ZodString;
    data: z.ZodRecord<z.ZodString, z.ZodUnknown>;
}, "strip", z.ZodTypeAny, {
    event_version: string;
    event_type: string;
    data: Record<string, unknown>;
    timestamp: string;
}, {
    event_type: string;
    data: Record<string, unknown>;
    timestamp: string;
    event_version?: string | undefined;
}>;
export declare const DeploymentStartedSchema: z.ZodObject<{
    event_version: z.ZodDefault<z.ZodString>;
    timestamp: z.ZodString;
} & {
    event_type: z.ZodLiteral<"deployment.started">;
    data: z.ZodObject<{
        deployment_id: z.ZodString;
        service: z.ZodString;
        environment: z.ZodString;
        version: z.ZodString;
        triggered_by: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        triggered_by: string;
        deployment_id: string;
        service: string;
        environment: string;
        version: string;
    }, {
        triggered_by: string;
        deployment_id: string;
        service: string;
        environment: string;
        version: string;
    }>;
}, "strip", z.ZodTypeAny, {
    event_version: string;
    event_type: "deployment.started";
    data: {
        triggered_by: string;
        deployment_id: string;
        service: string;
        environment: string;
        version: string;
    };
    timestamp: string;
}, {
    event_type: "deployment.started";
    data: {
        triggered_by: string;
        deployment_id: string;
        service: string;
        environment: string;
        version: string;
    };
    timestamp: string;
    event_version?: string | undefined;
}>;
export declare const DeploymentCompletedSchema: z.ZodObject<{
    event_version: z.ZodDefault<z.ZodString>;
    timestamp: z.ZodString;
} & {
    event_type: z.ZodLiteral<"deployment.completed">;
    data: z.ZodObject<{
        deployment_id: z.ZodString;
        service: z.ZodString;
        environment: z.ZodString;
        version: z.ZodString;
        duration_seconds: z.ZodNumber;
        status: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        status: string;
        deployment_id: string;
        service: string;
        environment: string;
        version: string;
        duration_seconds: number;
    }, {
        status: string;
        deployment_id: string;
        service: string;
        environment: string;
        version: string;
        duration_seconds: number;
    }>;
}, "strip", z.ZodTypeAny, {
    event_version: string;
    event_type: "deployment.completed";
    data: {
        status: string;
        deployment_id: string;
        service: string;
        environment: string;
        version: string;
        duration_seconds: number;
    };
    timestamp: string;
}, {
    event_type: "deployment.completed";
    data: {
        status: string;
        deployment_id: string;
        service: string;
        environment: string;
        version: string;
        duration_seconds: number;
    };
    timestamp: string;
    event_version?: string | undefined;
}>;
export declare const DeploymentFailedSchema: z.ZodObject<{
    event_version: z.ZodDefault<z.ZodString>;
    timestamp: z.ZodString;
} & {
    event_type: z.ZodLiteral<"deployment.failed">;
    data: z.ZodObject<{
        deployment_id: z.ZodString;
        service: z.ZodString;
        environment: z.ZodString;
        version: z.ZodString;
        error_message: z.ZodString;
        error_code: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        deployment_id: string;
        service: string;
        environment: string;
        version: string;
        error_message: string;
        error_code?: string | undefined;
    }, {
        deployment_id: string;
        service: string;
        environment: string;
        version: string;
        error_message: string;
        error_code?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    event_version: string;
    event_type: "deployment.failed";
    data: {
        deployment_id: string;
        service: string;
        environment: string;
        version: string;
        error_message: string;
        error_code?: string | undefined;
    };
    timestamp: string;
}, {
    event_type: "deployment.failed";
    data: {
        deployment_id: string;
        service: string;
        environment: string;
        version: string;
        error_message: string;
        error_code?: string | undefined;
    };
    timestamp: string;
    event_version?: string | undefined;
}>;
export declare const AISummaryGeneratedSchema: z.ZodObject<{
    event_version: z.ZodDefault<z.ZodString>;
    timestamp: z.ZodString;
} & {
    event_type: z.ZodLiteral<"ai.summary.generated">;
    data: z.ZodObject<{
        summary_id: z.ZodString;
        summary_type: z.ZodString;
        model: z.ZodString;
        context: z.ZodString;
        token_count: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        summary_id: string;
        summary_type: string;
        model: string;
        context: string;
        token_count?: number | undefined;
    }, {
        summary_id: string;
        summary_type: string;
        model: string;
        context: string;
        token_count?: number | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    event_version: string;
    event_type: "ai.summary.generated";
    data: {
        summary_id: string;
        summary_type: string;
        model: string;
        context: string;
        token_count?: number | undefined;
    };
    timestamp: string;
}, {
    event_type: "ai.summary.generated";
    data: {
        summary_id: string;
        summary_type: string;
        model: string;
        context: string;
        token_count?: number | undefined;
    };
    timestamp: string;
    event_version?: string | undefined;
}>;
export declare const AIInsightDetectedSchema: z.ZodObject<{
    event_version: z.ZodDefault<z.ZodString>;
    timestamp: z.ZodString;
} & {
    event_type: z.ZodLiteral<"ai.insight.detected">;
    data: z.ZodObject<{
        insight_id: z.ZodString;
        insight_type: z.ZodString;
        confidence: z.ZodNumber;
        description: z.ZodString;
        related_entities: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        insight_id: string;
        description: string;
        insight_type: string;
        confidence: number;
        related_entities?: string[] | undefined;
    }, {
        insight_id: string;
        description: string;
        insight_type: string;
        confidence: number;
        related_entities?: string[] | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    event_version: string;
    event_type: "ai.insight.detected";
    data: {
        insight_id: string;
        description: string;
        insight_type: string;
        confidence: number;
        related_entities?: string[] | undefined;
    };
    timestamp: string;
}, {
    event_type: "ai.insight.detected";
    data: {
        insight_id: string;
        description: string;
        insight_type: string;
        confidence: number;
        related_entities?: string[] | undefined;
    };
    timestamp: string;
    event_version?: string | undefined;
}>;
export declare const IncidentCreatedSchema: z.ZodObject<{
    event_version: z.ZodDefault<z.ZodString>;
    timestamp: z.ZodString;
} & {
    event_type: z.ZodLiteral<"incident.created">;
    data: z.ZodObject<{
        incident_id: z.ZodString;
        title: z.ZodString;
        severity: z.ZodEnum<["low", "medium", "high", "critical"]>;
        description: z.ZodString;
        affected_services: z.ZodArray<z.ZodString, "many">;
        triggered_by: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        severity: "critical" | "low" | "medium" | "high";
        triggered_by: string;
        incident_id: string;
        title: string;
        description: string;
        affected_services: string[];
    }, {
        severity: "critical" | "low" | "medium" | "high";
        triggered_by: string;
        incident_id: string;
        title: string;
        description: string;
        affected_services: string[];
    }>;
}, "strip", z.ZodTypeAny, {
    event_version: string;
    event_type: "incident.created";
    data: {
        severity: "critical" | "low" | "medium" | "high";
        triggered_by: string;
        incident_id: string;
        title: string;
        description: string;
        affected_services: string[];
    };
    timestamp: string;
}, {
    event_type: "incident.created";
    data: {
        severity: "critical" | "low" | "medium" | "high";
        triggered_by: string;
        incident_id: string;
        title: string;
        description: string;
        affected_services: string[];
    };
    timestamp: string;
    event_version?: string | undefined;
}>;
export declare const IncidentResolvedSchema: z.ZodObject<{
    event_version: z.ZodDefault<z.ZodString>;
    timestamp: z.ZodString;
} & {
    event_type: z.ZodLiteral<"incident.resolved">;
    data: z.ZodObject<{
        incident_id: z.ZodString;
        resolution_summary: z.ZodString;
        resolved_by: z.ZodString;
        duration_minutes: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        incident_id: string;
        resolved_by: string;
        resolution_summary: string;
        duration_minutes: number;
    }, {
        incident_id: string;
        resolved_by: string;
        resolution_summary: string;
        duration_minutes: number;
    }>;
}, "strip", z.ZodTypeAny, {
    event_version: string;
    event_type: "incident.resolved";
    data: {
        incident_id: string;
        resolved_by: string;
        resolution_summary: string;
        duration_minutes: number;
    };
    timestamp: string;
}, {
    event_type: "incident.resolved";
    data: {
        incident_id: string;
        resolved_by: string;
        resolution_summary: string;
        duration_minutes: number;
    };
    timestamp: string;
    event_version?: string | undefined;
}>;
export declare const IncidentEscalatedSchema: z.ZodObject<{
    event_version: z.ZodDefault<z.ZodString>;
    timestamp: z.ZodString;
} & {
    event_type: z.ZodLiteral<"incident.escalated">;
    data: z.ZodObject<{
        incident_id: z.ZodString;
        previous_severity: z.ZodString;
        new_severity: z.ZodString;
        escalated_by: z.ZodString;
        reason: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        incident_id: string;
        reason: string;
        previous_severity: string;
        new_severity: string;
        escalated_by: string;
    }, {
        incident_id: string;
        reason: string;
        previous_severity: string;
        new_severity: string;
        escalated_by: string;
    }>;
}, "strip", z.ZodTypeAny, {
    event_version: string;
    event_type: "incident.escalated";
    data: {
        incident_id: string;
        reason: string;
        previous_severity: string;
        new_severity: string;
        escalated_by: string;
    };
    timestamp: string;
}, {
    event_type: "incident.escalated";
    data: {
        incident_id: string;
        reason: string;
        previous_severity: string;
        new_severity: string;
        escalated_by: string;
    };
    timestamp: string;
    event_version?: string | undefined;
}>;
export declare const WorkspaceCreatedSchema: z.ZodObject<{
    event_version: z.ZodDefault<z.ZodString>;
    timestamp: z.ZodString;
} & {
    event_type: z.ZodLiteral<"workspace.created">;
    data: z.ZodObject<{
        workspace_id: z.ZodString;
        workspace_name: z.ZodString;
        created_by: z.ZodString;
        visibility: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        workspace_id: string;
        workspace_name: string;
        created_by: string;
        visibility: string;
    }, {
        workspace_id: string;
        workspace_name: string;
        created_by: string;
        visibility: string;
    }>;
}, "strip", z.ZodTypeAny, {
    event_version: string;
    event_type: "workspace.created";
    data: {
        workspace_id: string;
        workspace_name: string;
        created_by: string;
        visibility: string;
    };
    timestamp: string;
}, {
    event_type: "workspace.created";
    data: {
        workspace_id: string;
        workspace_name: string;
        created_by: string;
        visibility: string;
    };
    timestamp: string;
    event_version?: string | undefined;
}>;
export declare const ChannelCreatedSchema: z.ZodObject<{
    event_version: z.ZodDefault<z.ZodString>;
    timestamp: z.ZodString;
} & {
    event_type: z.ZodLiteral<"channel.created">;
    data: z.ZodObject<{
        channel_id: z.ZodString;
        channel_name: z.ZodString;
        workspace_id: z.ZodString;
        channel_type: z.ZodString;
        created_by: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        workspace_id: string;
        channel_id: string;
        channel_name: string;
        channel_type: string;
        created_by: string;
    }, {
        workspace_id: string;
        channel_id: string;
        channel_name: string;
        channel_type: string;
        created_by: string;
    }>;
}, "strip", z.ZodTypeAny, {
    event_version: string;
    event_type: "channel.created";
    data: {
        workspace_id: string;
        channel_id: string;
        channel_name: string;
        channel_type: string;
        created_by: string;
    };
    timestamp: string;
}, {
    event_type: "channel.created";
    data: {
        workspace_id: string;
        channel_id: string;
        channel_name: string;
        channel_type: string;
        created_by: string;
    };
    timestamp: string;
    event_version?: string | undefined;
}>;
export declare const MemberJoinedSchema: z.ZodObject<{
    event_version: z.ZodDefault<z.ZodString>;
    timestamp: z.ZodString;
} & {
    event_type: z.ZodLiteral<"member.joined">;
    data: z.ZodObject<{
        user_id: z.ZodString;
        workspace_id: z.ZodString;
        role: z.ZodString;
        invited_by: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        workspace_id: string;
        user_id: string;
        role: string;
        invited_by: string;
    }, {
        workspace_id: string;
        user_id: string;
        role: string;
        invited_by: string;
    }>;
}, "strip", z.ZodTypeAny, {
    event_version: string;
    event_type: "member.joined";
    data: {
        workspace_id: string;
        user_id: string;
        role: string;
        invited_by: string;
    };
    timestamp: string;
}, {
    event_type: "member.joined";
    data: {
        workspace_id: string;
        user_id: string;
        role: string;
        invited_by: string;
    };
    timestamp: string;
    event_version?: string | undefined;
}>;
export declare const MessageCreatedSchema: z.ZodObject<{
    event_version: z.ZodDefault<z.ZodString>;
    timestamp: z.ZodString;
} & {
    event_type: z.ZodLiteral<"message.created">;
    data: z.ZodObject<{
        message_id: z.ZodString;
        channel_id: z.ZodString;
        user_id: z.ZodString;
        content: z.ZodString;
        message_type: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        channel_id: string;
        content: string;
        message_id: string;
        user_id: string;
        message_type?: string | undefined;
    }, {
        channel_id: string;
        content: string;
        message_id: string;
        user_id: string;
        message_type?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    event_version: string;
    event_type: "message.created";
    data: {
        channel_id: string;
        content: string;
        message_id: string;
        user_id: string;
        message_type?: string | undefined;
    };
    timestamp: string;
}, {
    event_type: "message.created";
    data: {
        channel_id: string;
        content: string;
        message_id: string;
        user_id: string;
        message_type?: string | undefined;
    };
    timestamp: string;
    event_version?: string | undefined;
}>;
export declare const MentionTriggeredSchema: z.ZodObject<{
    event_version: z.ZodDefault<z.ZodString>;
    timestamp: z.ZodString;
} & {
    event_type: z.ZodLiteral<"mention.triggered">;
    data: z.ZodObject<{
        mention_id: z.ZodString;
        mentioned_user_id: z.ZodString;
        message_id: z.ZodString;
        channel_id: z.ZodString;
        mentioned_by: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        channel_id: string;
        message_id: string;
        mention_id: string;
        mentioned_user_id: string;
        mentioned_by: string;
    }, {
        channel_id: string;
        message_id: string;
        mention_id: string;
        mentioned_user_id: string;
        mentioned_by: string;
    }>;
}, "strip", z.ZodTypeAny, {
    event_version: string;
    event_type: "mention.triggered";
    data: {
        channel_id: string;
        message_id: string;
        mention_id: string;
        mentioned_user_id: string;
        mentioned_by: string;
    };
    timestamp: string;
}, {
    event_type: "mention.triggered";
    data: {
        channel_id: string;
        message_id: string;
        mention_id: string;
        mentioned_user_id: string;
        mentioned_by: string;
    };
    timestamp: string;
    event_version?: string | undefined;
}>;
export declare const ThreadStartedSchema: z.ZodObject<{
    event_version: z.ZodDefault<z.ZodString>;
    timestamp: z.ZodString;
} & {
    event_type: z.ZodLiteral<"thread.started">;
    data: z.ZodObject<{
        thread_id: z.ZodString;
        parent_message_id: z.ZodString;
        channel_id: z.ZodString;
        started_by: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        channel_id: string;
        thread_id: string;
        parent_message_id: string;
        started_by: string;
    }, {
        channel_id: string;
        thread_id: string;
        parent_message_id: string;
        started_by: string;
    }>;
}, "strip", z.ZodTypeAny, {
    event_version: string;
    event_type: "thread.started";
    data: {
        channel_id: string;
        thread_id: string;
        parent_message_id: string;
        started_by: string;
    };
    timestamp: string;
}, {
    event_type: "thread.started";
    data: {
        channel_id: string;
        thread_id: string;
        parent_message_id: string;
        started_by: string;
    };
    timestamp: string;
    event_version?: string | undefined;
}>;
export declare const PipelineStartedSchema: z.ZodObject<{
    event_version: z.ZodDefault<z.ZodString>;
    timestamp: z.ZodString;
} & {
    event_type: z.ZodLiteral<"pipeline.started">;
    data: z.ZodObject<{
        pipeline_id: z.ZodString;
        pipeline_name: z.ZodString;
        project: z.ZodString;
        branch: z.ZodString;
        commit_sha: z.ZodString;
        triggered_by: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        triggered_by: string;
        commit_sha: string;
        pipeline_id: string;
        pipeline_name: string;
        project: string;
        branch: string;
    }, {
        triggered_by: string;
        commit_sha: string;
        pipeline_id: string;
        pipeline_name: string;
        project: string;
        branch: string;
    }>;
}, "strip", z.ZodTypeAny, {
    event_version: string;
    event_type: "pipeline.started";
    data: {
        triggered_by: string;
        commit_sha: string;
        pipeline_id: string;
        pipeline_name: string;
        project: string;
        branch: string;
    };
    timestamp: string;
}, {
    event_type: "pipeline.started";
    data: {
        triggered_by: string;
        commit_sha: string;
        pipeline_id: string;
        pipeline_name: string;
        project: string;
        branch: string;
    };
    timestamp: string;
    event_version?: string | undefined;
}>;
export declare const PipelineCompletedSchema: z.ZodObject<{
    event_version: z.ZodDefault<z.ZodString>;
    timestamp: z.ZodString;
} & {
    event_type: z.ZodLiteral<"pipeline.completed">;
    data: z.ZodObject<{
        pipeline_id: z.ZodString;
        status: z.ZodString;
        duration_seconds: z.ZodNumber;
        stages: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            status: z.ZodString;
            duration_seconds: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            status: string;
            name: string;
            duration_seconds?: number | undefined;
        }, {
            status: string;
            name: string;
            duration_seconds?: number | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        status: string;
        pipeline_id: string;
        duration_seconds: number;
        stages: {
            status: string;
            name: string;
            duration_seconds?: number | undefined;
        }[];
    }, {
        status: string;
        pipeline_id: string;
        duration_seconds: number;
        stages: {
            status: string;
            name: string;
            duration_seconds?: number | undefined;
        }[];
    }>;
}, "strip", z.ZodTypeAny, {
    event_version: string;
    event_type: "pipeline.completed";
    data: {
        status: string;
        pipeline_id: string;
        duration_seconds: number;
        stages: {
            status: string;
            name: string;
            duration_seconds?: number | undefined;
        }[];
    };
    timestamp: string;
}, {
    event_type: "pipeline.completed";
    data: {
        status: string;
        pipeline_id: string;
        duration_seconds: number;
        stages: {
            status: string;
            name: string;
            duration_seconds?: number | undefined;
        }[];
    };
    timestamp: string;
    event_version?: string | undefined;
}>;
export declare const PipelineFailedSchema: z.ZodObject<{
    event_version: z.ZodDefault<z.ZodString>;
    timestamp: z.ZodString;
} & {
    event_type: z.ZodLiteral<"pipeline.failed">;
    data: z.ZodObject<{
        pipeline_id: z.ZodString;
        failed_stage: z.ZodString;
        error_message: z.ZodString;
        commit_sha: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        commit_sha: string;
        error_message: string;
        pipeline_id: string;
        failed_stage: string;
    }, {
        commit_sha: string;
        error_message: string;
        pipeline_id: string;
        failed_stage: string;
    }>;
}, "strip", z.ZodTypeAny, {
    event_version: string;
    event_type: "pipeline.failed";
    data: {
        commit_sha: string;
        error_message: string;
        pipeline_id: string;
        failed_stage: string;
    };
    timestamp: string;
}, {
    event_type: "pipeline.failed";
    data: {
        commit_sha: string;
        error_message: string;
        pipeline_id: string;
        failed_stage: string;
    };
    timestamp: string;
    event_version?: string | undefined;
}>;
export declare const AnalyticsAlertSchema: z.ZodObject<{
    event_version: z.ZodDefault<z.ZodString>;
    timestamp: z.ZodString;
} & {
    event_type: z.ZodLiteral<"analytics.alert">;
    data: z.ZodObject<{
        alert_id: z.ZodString;
        metric_name: z.ZodString;
        threshold_value: z.ZodNumber;
        actual_value: z.ZodNumber;
        severity: z.ZodEnum<["info", "warning", "critical"]>;
        time_window: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        severity: "info" | "warning" | "critical";
        alert_id: string;
        metric_name: string;
        threshold_value: number;
        actual_value: number;
        time_window: string;
    }, {
        severity: "info" | "warning" | "critical";
        alert_id: string;
        metric_name: string;
        threshold_value: number;
        actual_value: number;
        time_window: string;
    }>;
}, "strip", z.ZodTypeAny, {
    event_version: string;
    event_type: "analytics.alert";
    data: {
        severity: "info" | "warning" | "critical";
        alert_id: string;
        metric_name: string;
        threshold_value: number;
        actual_value: number;
        time_window: string;
    };
    timestamp: string;
}, {
    event_type: "analytics.alert";
    data: {
        severity: "info" | "warning" | "critical";
        alert_id: string;
        metric_name: string;
        threshold_value: number;
        actual_value: number;
        time_window: string;
    };
    timestamp: string;
    event_version?: string | undefined;
}>;
export declare const MetricsThresholdSchema: z.ZodObject<{
    event_version: z.ZodDefault<z.ZodString>;
    timestamp: z.ZodString;
} & {
    event_type: z.ZodLiteral<"metrics.threshold">;
    data: z.ZodObject<{
        metric_id: z.ZodString;
        metric_name: z.ZodString;
        threshold_type: z.ZodString;
        condition: z.ZodString;
        value: z.ZodNumber;
        previous_value: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        value: number;
        metric_id: string;
        metric_name: string;
        condition: string;
        threshold_type: string;
        previous_value?: number | undefined;
    }, {
        value: number;
        metric_id: string;
        metric_name: string;
        condition: string;
        threshold_type: string;
        previous_value?: number | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    event_version: string;
    event_type: "metrics.threshold";
    data: {
        value: number;
        metric_id: string;
        metric_name: string;
        condition: string;
        threshold_type: string;
        previous_value?: number | undefined;
    };
    timestamp: string;
}, {
    event_type: "metrics.threshold";
    data: {
        value: number;
        metric_id: string;
        metric_name: string;
        condition: string;
        threshold_type: string;
        previous_value?: number | undefined;
    };
    timestamp: string;
    event_version?: string | undefined;
}>;
export declare const AnyEventSchema: z.ZodDiscriminatedUnion<"event_type", [z.ZodObject<{
    event_version: z.ZodDefault<z.ZodString>;
    timestamp: z.ZodString;
} & {
    event_type: z.ZodLiteral<"deployment.started">;
    data: z.ZodObject<{
        deployment_id: z.ZodString;
        service: z.ZodString;
        environment: z.ZodString;
        version: z.ZodString;
        triggered_by: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        triggered_by: string;
        deployment_id: string;
        service: string;
        environment: string;
        version: string;
    }, {
        triggered_by: string;
        deployment_id: string;
        service: string;
        environment: string;
        version: string;
    }>;
}, "strip", z.ZodTypeAny, {
    event_version: string;
    event_type: "deployment.started";
    data: {
        triggered_by: string;
        deployment_id: string;
        service: string;
        environment: string;
        version: string;
    };
    timestamp: string;
}, {
    event_type: "deployment.started";
    data: {
        triggered_by: string;
        deployment_id: string;
        service: string;
        environment: string;
        version: string;
    };
    timestamp: string;
    event_version?: string | undefined;
}>, z.ZodObject<{
    event_version: z.ZodDefault<z.ZodString>;
    timestamp: z.ZodString;
} & {
    event_type: z.ZodLiteral<"deployment.completed">;
    data: z.ZodObject<{
        deployment_id: z.ZodString;
        service: z.ZodString;
        environment: z.ZodString;
        version: z.ZodString;
        duration_seconds: z.ZodNumber;
        status: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        status: string;
        deployment_id: string;
        service: string;
        environment: string;
        version: string;
        duration_seconds: number;
    }, {
        status: string;
        deployment_id: string;
        service: string;
        environment: string;
        version: string;
        duration_seconds: number;
    }>;
}, "strip", z.ZodTypeAny, {
    event_version: string;
    event_type: "deployment.completed";
    data: {
        status: string;
        deployment_id: string;
        service: string;
        environment: string;
        version: string;
        duration_seconds: number;
    };
    timestamp: string;
}, {
    event_type: "deployment.completed";
    data: {
        status: string;
        deployment_id: string;
        service: string;
        environment: string;
        version: string;
        duration_seconds: number;
    };
    timestamp: string;
    event_version?: string | undefined;
}>, z.ZodObject<{
    event_version: z.ZodDefault<z.ZodString>;
    timestamp: z.ZodString;
} & {
    event_type: z.ZodLiteral<"deployment.failed">;
    data: z.ZodObject<{
        deployment_id: z.ZodString;
        service: z.ZodString;
        environment: z.ZodString;
        version: z.ZodString;
        error_message: z.ZodString;
        error_code: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        deployment_id: string;
        service: string;
        environment: string;
        version: string;
        error_message: string;
        error_code?: string | undefined;
    }, {
        deployment_id: string;
        service: string;
        environment: string;
        version: string;
        error_message: string;
        error_code?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    event_version: string;
    event_type: "deployment.failed";
    data: {
        deployment_id: string;
        service: string;
        environment: string;
        version: string;
        error_message: string;
        error_code?: string | undefined;
    };
    timestamp: string;
}, {
    event_type: "deployment.failed";
    data: {
        deployment_id: string;
        service: string;
        environment: string;
        version: string;
        error_message: string;
        error_code?: string | undefined;
    };
    timestamp: string;
    event_version?: string | undefined;
}>, z.ZodObject<{
    event_version: z.ZodDefault<z.ZodString>;
    timestamp: z.ZodString;
} & {
    event_type: z.ZodLiteral<"ai.summary.generated">;
    data: z.ZodObject<{
        summary_id: z.ZodString;
        summary_type: z.ZodString;
        model: z.ZodString;
        context: z.ZodString;
        token_count: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        summary_id: string;
        summary_type: string;
        model: string;
        context: string;
        token_count?: number | undefined;
    }, {
        summary_id: string;
        summary_type: string;
        model: string;
        context: string;
        token_count?: number | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    event_version: string;
    event_type: "ai.summary.generated";
    data: {
        summary_id: string;
        summary_type: string;
        model: string;
        context: string;
        token_count?: number | undefined;
    };
    timestamp: string;
}, {
    event_type: "ai.summary.generated";
    data: {
        summary_id: string;
        summary_type: string;
        model: string;
        context: string;
        token_count?: number | undefined;
    };
    timestamp: string;
    event_version?: string | undefined;
}>, z.ZodObject<{
    event_version: z.ZodDefault<z.ZodString>;
    timestamp: z.ZodString;
} & {
    event_type: z.ZodLiteral<"ai.insight.detected">;
    data: z.ZodObject<{
        insight_id: z.ZodString;
        insight_type: z.ZodString;
        confidence: z.ZodNumber;
        description: z.ZodString;
        related_entities: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        insight_id: string;
        description: string;
        insight_type: string;
        confidence: number;
        related_entities?: string[] | undefined;
    }, {
        insight_id: string;
        description: string;
        insight_type: string;
        confidence: number;
        related_entities?: string[] | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    event_version: string;
    event_type: "ai.insight.detected";
    data: {
        insight_id: string;
        description: string;
        insight_type: string;
        confidence: number;
        related_entities?: string[] | undefined;
    };
    timestamp: string;
}, {
    event_type: "ai.insight.detected";
    data: {
        insight_id: string;
        description: string;
        insight_type: string;
        confidence: number;
        related_entities?: string[] | undefined;
    };
    timestamp: string;
    event_version?: string | undefined;
}>, z.ZodObject<{
    event_version: z.ZodDefault<z.ZodString>;
    timestamp: z.ZodString;
} & {
    event_type: z.ZodLiteral<"incident.created">;
    data: z.ZodObject<{
        incident_id: z.ZodString;
        title: z.ZodString;
        severity: z.ZodEnum<["low", "medium", "high", "critical"]>;
        description: z.ZodString;
        affected_services: z.ZodArray<z.ZodString, "many">;
        triggered_by: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        severity: "critical" | "low" | "medium" | "high";
        triggered_by: string;
        incident_id: string;
        title: string;
        description: string;
        affected_services: string[];
    }, {
        severity: "critical" | "low" | "medium" | "high";
        triggered_by: string;
        incident_id: string;
        title: string;
        description: string;
        affected_services: string[];
    }>;
}, "strip", z.ZodTypeAny, {
    event_version: string;
    event_type: "incident.created";
    data: {
        severity: "critical" | "low" | "medium" | "high";
        triggered_by: string;
        incident_id: string;
        title: string;
        description: string;
        affected_services: string[];
    };
    timestamp: string;
}, {
    event_type: "incident.created";
    data: {
        severity: "critical" | "low" | "medium" | "high";
        triggered_by: string;
        incident_id: string;
        title: string;
        description: string;
        affected_services: string[];
    };
    timestamp: string;
    event_version?: string | undefined;
}>, z.ZodObject<{
    event_version: z.ZodDefault<z.ZodString>;
    timestamp: z.ZodString;
} & {
    event_type: z.ZodLiteral<"incident.resolved">;
    data: z.ZodObject<{
        incident_id: z.ZodString;
        resolution_summary: z.ZodString;
        resolved_by: z.ZodString;
        duration_minutes: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        incident_id: string;
        resolved_by: string;
        resolution_summary: string;
        duration_minutes: number;
    }, {
        incident_id: string;
        resolved_by: string;
        resolution_summary: string;
        duration_minutes: number;
    }>;
}, "strip", z.ZodTypeAny, {
    event_version: string;
    event_type: "incident.resolved";
    data: {
        incident_id: string;
        resolved_by: string;
        resolution_summary: string;
        duration_minutes: number;
    };
    timestamp: string;
}, {
    event_type: "incident.resolved";
    data: {
        incident_id: string;
        resolved_by: string;
        resolution_summary: string;
        duration_minutes: number;
    };
    timestamp: string;
    event_version?: string | undefined;
}>, z.ZodObject<{
    event_version: z.ZodDefault<z.ZodString>;
    timestamp: z.ZodString;
} & {
    event_type: z.ZodLiteral<"incident.escalated">;
    data: z.ZodObject<{
        incident_id: z.ZodString;
        previous_severity: z.ZodString;
        new_severity: z.ZodString;
        escalated_by: z.ZodString;
        reason: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        incident_id: string;
        reason: string;
        previous_severity: string;
        new_severity: string;
        escalated_by: string;
    }, {
        incident_id: string;
        reason: string;
        previous_severity: string;
        new_severity: string;
        escalated_by: string;
    }>;
}, "strip", z.ZodTypeAny, {
    event_version: string;
    event_type: "incident.escalated";
    data: {
        incident_id: string;
        reason: string;
        previous_severity: string;
        new_severity: string;
        escalated_by: string;
    };
    timestamp: string;
}, {
    event_type: "incident.escalated";
    data: {
        incident_id: string;
        reason: string;
        previous_severity: string;
        new_severity: string;
        escalated_by: string;
    };
    timestamp: string;
    event_version?: string | undefined;
}>, z.ZodObject<{
    event_version: z.ZodDefault<z.ZodString>;
    timestamp: z.ZodString;
} & {
    event_type: z.ZodLiteral<"workspace.created">;
    data: z.ZodObject<{
        workspace_id: z.ZodString;
        workspace_name: z.ZodString;
        created_by: z.ZodString;
        visibility: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        workspace_id: string;
        workspace_name: string;
        created_by: string;
        visibility: string;
    }, {
        workspace_id: string;
        workspace_name: string;
        created_by: string;
        visibility: string;
    }>;
}, "strip", z.ZodTypeAny, {
    event_version: string;
    event_type: "workspace.created";
    data: {
        workspace_id: string;
        workspace_name: string;
        created_by: string;
        visibility: string;
    };
    timestamp: string;
}, {
    event_type: "workspace.created";
    data: {
        workspace_id: string;
        workspace_name: string;
        created_by: string;
        visibility: string;
    };
    timestamp: string;
    event_version?: string | undefined;
}>, z.ZodObject<{
    event_version: z.ZodDefault<z.ZodString>;
    timestamp: z.ZodString;
} & {
    event_type: z.ZodLiteral<"channel.created">;
    data: z.ZodObject<{
        channel_id: z.ZodString;
        channel_name: z.ZodString;
        workspace_id: z.ZodString;
        channel_type: z.ZodString;
        created_by: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        workspace_id: string;
        channel_id: string;
        channel_name: string;
        channel_type: string;
        created_by: string;
    }, {
        workspace_id: string;
        channel_id: string;
        channel_name: string;
        channel_type: string;
        created_by: string;
    }>;
}, "strip", z.ZodTypeAny, {
    event_version: string;
    event_type: "channel.created";
    data: {
        workspace_id: string;
        channel_id: string;
        channel_name: string;
        channel_type: string;
        created_by: string;
    };
    timestamp: string;
}, {
    event_type: "channel.created";
    data: {
        workspace_id: string;
        channel_id: string;
        channel_name: string;
        channel_type: string;
        created_by: string;
    };
    timestamp: string;
    event_version?: string | undefined;
}>, z.ZodObject<{
    event_version: z.ZodDefault<z.ZodString>;
    timestamp: z.ZodString;
} & {
    event_type: z.ZodLiteral<"member.joined">;
    data: z.ZodObject<{
        user_id: z.ZodString;
        workspace_id: z.ZodString;
        role: z.ZodString;
        invited_by: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        workspace_id: string;
        user_id: string;
        role: string;
        invited_by: string;
    }, {
        workspace_id: string;
        user_id: string;
        role: string;
        invited_by: string;
    }>;
}, "strip", z.ZodTypeAny, {
    event_version: string;
    event_type: "member.joined";
    data: {
        workspace_id: string;
        user_id: string;
        role: string;
        invited_by: string;
    };
    timestamp: string;
}, {
    event_type: "member.joined";
    data: {
        workspace_id: string;
        user_id: string;
        role: string;
        invited_by: string;
    };
    timestamp: string;
    event_version?: string | undefined;
}>, z.ZodObject<{
    event_version: z.ZodDefault<z.ZodString>;
    timestamp: z.ZodString;
} & {
    event_type: z.ZodLiteral<"message.created">;
    data: z.ZodObject<{
        message_id: z.ZodString;
        channel_id: z.ZodString;
        user_id: z.ZodString;
        content: z.ZodString;
        message_type: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        channel_id: string;
        content: string;
        message_id: string;
        user_id: string;
        message_type?: string | undefined;
    }, {
        channel_id: string;
        content: string;
        message_id: string;
        user_id: string;
        message_type?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    event_version: string;
    event_type: "message.created";
    data: {
        channel_id: string;
        content: string;
        message_id: string;
        user_id: string;
        message_type?: string | undefined;
    };
    timestamp: string;
}, {
    event_type: "message.created";
    data: {
        channel_id: string;
        content: string;
        message_id: string;
        user_id: string;
        message_type?: string | undefined;
    };
    timestamp: string;
    event_version?: string | undefined;
}>, z.ZodObject<{
    event_version: z.ZodDefault<z.ZodString>;
    timestamp: z.ZodString;
} & {
    event_type: z.ZodLiteral<"mention.triggered">;
    data: z.ZodObject<{
        mention_id: z.ZodString;
        mentioned_user_id: z.ZodString;
        message_id: z.ZodString;
        channel_id: z.ZodString;
        mentioned_by: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        channel_id: string;
        message_id: string;
        mention_id: string;
        mentioned_user_id: string;
        mentioned_by: string;
    }, {
        channel_id: string;
        message_id: string;
        mention_id: string;
        mentioned_user_id: string;
        mentioned_by: string;
    }>;
}, "strip", z.ZodTypeAny, {
    event_version: string;
    event_type: "mention.triggered";
    data: {
        channel_id: string;
        message_id: string;
        mention_id: string;
        mentioned_user_id: string;
        mentioned_by: string;
    };
    timestamp: string;
}, {
    event_type: "mention.triggered";
    data: {
        channel_id: string;
        message_id: string;
        mention_id: string;
        mentioned_user_id: string;
        mentioned_by: string;
    };
    timestamp: string;
    event_version?: string | undefined;
}>, z.ZodObject<{
    event_version: z.ZodDefault<z.ZodString>;
    timestamp: z.ZodString;
} & {
    event_type: z.ZodLiteral<"thread.started">;
    data: z.ZodObject<{
        thread_id: z.ZodString;
        parent_message_id: z.ZodString;
        channel_id: z.ZodString;
        started_by: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        channel_id: string;
        thread_id: string;
        parent_message_id: string;
        started_by: string;
    }, {
        channel_id: string;
        thread_id: string;
        parent_message_id: string;
        started_by: string;
    }>;
}, "strip", z.ZodTypeAny, {
    event_version: string;
    event_type: "thread.started";
    data: {
        channel_id: string;
        thread_id: string;
        parent_message_id: string;
        started_by: string;
    };
    timestamp: string;
}, {
    event_type: "thread.started";
    data: {
        channel_id: string;
        thread_id: string;
        parent_message_id: string;
        started_by: string;
    };
    timestamp: string;
    event_version?: string | undefined;
}>, z.ZodObject<{
    event_version: z.ZodDefault<z.ZodString>;
    timestamp: z.ZodString;
} & {
    event_type: z.ZodLiteral<"pipeline.started">;
    data: z.ZodObject<{
        pipeline_id: z.ZodString;
        pipeline_name: z.ZodString;
        project: z.ZodString;
        branch: z.ZodString;
        commit_sha: z.ZodString;
        triggered_by: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        triggered_by: string;
        commit_sha: string;
        pipeline_id: string;
        pipeline_name: string;
        project: string;
        branch: string;
    }, {
        triggered_by: string;
        commit_sha: string;
        pipeline_id: string;
        pipeline_name: string;
        project: string;
        branch: string;
    }>;
}, "strip", z.ZodTypeAny, {
    event_version: string;
    event_type: "pipeline.started";
    data: {
        triggered_by: string;
        commit_sha: string;
        pipeline_id: string;
        pipeline_name: string;
        project: string;
        branch: string;
    };
    timestamp: string;
}, {
    event_type: "pipeline.started";
    data: {
        triggered_by: string;
        commit_sha: string;
        pipeline_id: string;
        pipeline_name: string;
        project: string;
        branch: string;
    };
    timestamp: string;
    event_version?: string | undefined;
}>, z.ZodObject<{
    event_version: z.ZodDefault<z.ZodString>;
    timestamp: z.ZodString;
} & {
    event_type: z.ZodLiteral<"pipeline.completed">;
    data: z.ZodObject<{
        pipeline_id: z.ZodString;
        status: z.ZodString;
        duration_seconds: z.ZodNumber;
        stages: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            status: z.ZodString;
            duration_seconds: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            status: string;
            name: string;
            duration_seconds?: number | undefined;
        }, {
            status: string;
            name: string;
            duration_seconds?: number | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        status: string;
        pipeline_id: string;
        duration_seconds: number;
        stages: {
            status: string;
            name: string;
            duration_seconds?: number | undefined;
        }[];
    }, {
        status: string;
        pipeline_id: string;
        duration_seconds: number;
        stages: {
            status: string;
            name: string;
            duration_seconds?: number | undefined;
        }[];
    }>;
}, "strip", z.ZodTypeAny, {
    event_version: string;
    event_type: "pipeline.completed";
    data: {
        status: string;
        pipeline_id: string;
        duration_seconds: number;
        stages: {
            status: string;
            name: string;
            duration_seconds?: number | undefined;
        }[];
    };
    timestamp: string;
}, {
    event_type: "pipeline.completed";
    data: {
        status: string;
        pipeline_id: string;
        duration_seconds: number;
        stages: {
            status: string;
            name: string;
            duration_seconds?: number | undefined;
        }[];
    };
    timestamp: string;
    event_version?: string | undefined;
}>, z.ZodObject<{
    event_version: z.ZodDefault<z.ZodString>;
    timestamp: z.ZodString;
} & {
    event_type: z.ZodLiteral<"pipeline.failed">;
    data: z.ZodObject<{
        pipeline_id: z.ZodString;
        failed_stage: z.ZodString;
        error_message: z.ZodString;
        commit_sha: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        commit_sha: string;
        error_message: string;
        pipeline_id: string;
        failed_stage: string;
    }, {
        commit_sha: string;
        error_message: string;
        pipeline_id: string;
        failed_stage: string;
    }>;
}, "strip", z.ZodTypeAny, {
    event_version: string;
    event_type: "pipeline.failed";
    data: {
        commit_sha: string;
        error_message: string;
        pipeline_id: string;
        failed_stage: string;
    };
    timestamp: string;
}, {
    event_type: "pipeline.failed";
    data: {
        commit_sha: string;
        error_message: string;
        pipeline_id: string;
        failed_stage: string;
    };
    timestamp: string;
    event_version?: string | undefined;
}>, z.ZodObject<{
    event_version: z.ZodDefault<z.ZodString>;
    timestamp: z.ZodString;
} & {
    event_type: z.ZodLiteral<"analytics.alert">;
    data: z.ZodObject<{
        alert_id: z.ZodString;
        metric_name: z.ZodString;
        threshold_value: z.ZodNumber;
        actual_value: z.ZodNumber;
        severity: z.ZodEnum<["info", "warning", "critical"]>;
        time_window: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        severity: "info" | "warning" | "critical";
        alert_id: string;
        metric_name: string;
        threshold_value: number;
        actual_value: number;
        time_window: string;
    }, {
        severity: "info" | "warning" | "critical";
        alert_id: string;
        metric_name: string;
        threshold_value: number;
        actual_value: number;
        time_window: string;
    }>;
}, "strip", z.ZodTypeAny, {
    event_version: string;
    event_type: "analytics.alert";
    data: {
        severity: "info" | "warning" | "critical";
        alert_id: string;
        metric_name: string;
        threshold_value: number;
        actual_value: number;
        time_window: string;
    };
    timestamp: string;
}, {
    event_type: "analytics.alert";
    data: {
        severity: "info" | "warning" | "critical";
        alert_id: string;
        metric_name: string;
        threshold_value: number;
        actual_value: number;
        time_window: string;
    };
    timestamp: string;
    event_version?: string | undefined;
}>, z.ZodObject<{
    event_version: z.ZodDefault<z.ZodString>;
    timestamp: z.ZodString;
} & {
    event_type: z.ZodLiteral<"metrics.threshold">;
    data: z.ZodObject<{
        metric_id: z.ZodString;
        metric_name: z.ZodString;
        threshold_type: z.ZodString;
        condition: z.ZodString;
        value: z.ZodNumber;
        previous_value: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        value: number;
        metric_id: string;
        metric_name: string;
        condition: string;
        threshold_type: string;
        previous_value?: number | undefined;
    }, {
        value: number;
        metric_id: string;
        metric_name: string;
        condition: string;
        threshold_type: string;
        previous_value?: number | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    event_version: string;
    event_type: "metrics.threshold";
    data: {
        value: number;
        metric_id: string;
        metric_name: string;
        condition: string;
        threshold_type: string;
        previous_value?: number | undefined;
    };
    timestamp: string;
}, {
    event_type: "metrics.threshold";
    data: {
        value: number;
        metric_id: string;
        metric_name: string;
        condition: string;
        threshold_type: string;
        previous_value?: number | undefined;
    };
    timestamp: string;
    event_version?: string | undefined;
}>]>;
export type ValidatedEvent = z.infer<typeof AnyEventSchema>;
//# sourceMappingURL=EventValidator.d.ts.map