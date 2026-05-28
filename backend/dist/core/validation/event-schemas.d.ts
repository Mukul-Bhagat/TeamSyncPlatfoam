import { z } from 'zod';
export declare const EventSeveritySchema: z.ZodEnum<["info", "warning", "critical"]>;
export declare const BaseEventSchema: z.ZodObject<{
    source_app: z.ZodString;
    organization_id: z.ZodString;
    workspace_id: z.ZodOptional<z.ZodString>;
    channel_id: z.ZodOptional<z.ZodString>;
    event_version: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    payload: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    severity: z.ZodDefault<z.ZodEnum<["info", "warning", "critical"]>>;
    correlation_id: z.ZodOptional<z.ZodString>;
    triggered_by: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    event_version: string;
    severity: "info" | "warning" | "critical";
    metadata: Record<string, unknown>;
    source_app: string;
    organization_id: string;
    payload: Record<string, unknown>;
    workspace_id?: string | undefined;
    channel_id?: string | undefined;
    correlation_id?: string | undefined;
    triggered_by?: string | undefined;
}, {
    source_app: string;
    organization_id: string;
    event_version?: string | undefined;
    severity?: "info" | "warning" | "critical" | undefined;
    metadata?: Record<string, unknown> | undefined;
    workspace_id?: string | undefined;
    channel_id?: string | undefined;
    payload?: Record<string, unknown> | undefined;
    correlation_id?: string | undefined;
    triggered_by?: string | undefined;
}>;
export declare const DeploymentEventTypeSchema: z.ZodEnum<["deployment.started", "deployment.completed", "deployment.failed"]>;
export declare const DeploymentEventSchema: z.ZodObject<{
    source_app: z.ZodString;
    organization_id: z.ZodString;
    workspace_id: z.ZodOptional<z.ZodString>;
    channel_id: z.ZodOptional<z.ZodString>;
    event_version: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    severity: z.ZodDefault<z.ZodEnum<["info", "warning", "critical"]>>;
    correlation_id: z.ZodOptional<z.ZodString>;
    triggered_by: z.ZodOptional<z.ZodString>;
} & {
    event_type: z.ZodEnum<["deployment.started", "deployment.completed", "deployment.failed"]>;
    payload: z.ZodObject<{
        deployment_id: z.ZodString;
        service: z.ZodString;
        environment: z.ZodString;
        version: z.ZodString;
        commit_sha: z.ZodOptional<z.ZodString>;
        duration_ms: z.ZodOptional<z.ZodNumber>;
        url: z.ZodOptional<z.ZodString>;
        error_message: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        deployment_id: z.ZodString;
        service: z.ZodString;
        environment: z.ZodString;
        version: z.ZodString;
        commit_sha: z.ZodOptional<z.ZodString>;
        duration_ms: z.ZodOptional<z.ZodNumber>;
        url: z.ZodOptional<z.ZodString>;
        error_message: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        deployment_id: z.ZodString;
        service: z.ZodString;
        environment: z.ZodString;
        version: z.ZodString;
        commit_sha: z.ZodOptional<z.ZodString>;
        duration_ms: z.ZodOptional<z.ZodNumber>;
        url: z.ZodOptional<z.ZodString>;
        error_message: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>;
}, "strip", z.ZodTypeAny, {
    event_version: string;
    severity: "info" | "warning" | "critical";
    metadata: Record<string, unknown>;
    source_app: string;
    organization_id: string;
    event_type: "deployment.started" | "deployment.completed" | "deployment.failed";
    payload: {
        deployment_id: string;
        service: string;
        environment: string;
        version: string;
        commit_sha?: string | undefined;
        duration_ms?: number | undefined;
        url?: string | undefined;
        error_message?: string | undefined;
    } & {
        [k: string]: unknown;
    };
    workspace_id?: string | undefined;
    channel_id?: string | undefined;
    correlation_id?: string | undefined;
    triggered_by?: string | undefined;
}, {
    source_app: string;
    organization_id: string;
    event_type: "deployment.started" | "deployment.completed" | "deployment.failed";
    payload: {
        deployment_id: string;
        service: string;
        environment: string;
        version: string;
        commit_sha?: string | undefined;
        duration_ms?: number | undefined;
        url?: string | undefined;
        error_message?: string | undefined;
    } & {
        [k: string]: unknown;
    };
    event_version?: string | undefined;
    severity?: "info" | "warning" | "critical" | undefined;
    metadata?: Record<string, unknown> | undefined;
    workspace_id?: string | undefined;
    channel_id?: string | undefined;
    correlation_id?: string | undefined;
    triggered_by?: string | undefined;
}>;
export declare const AIEventTypeSchema: z.ZodEnum<["ai.summary.generated", "ai.insight.detected"]>;
export declare const AIEventSchema: z.ZodObject<{
    source_app: z.ZodString;
    organization_id: z.ZodString;
    workspace_id: z.ZodOptional<z.ZodString>;
    channel_id: z.ZodOptional<z.ZodString>;
    event_version: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    severity: z.ZodDefault<z.ZodEnum<["info", "warning", "critical"]>>;
    correlation_id: z.ZodOptional<z.ZodString>;
    triggered_by: z.ZodOptional<z.ZodString>;
} & {
    event_type: z.ZodEnum<["ai.summary.generated", "ai.insight.detected"]>;
    payload: z.ZodObject<{
        summary_id: z.ZodOptional<z.ZodString>;
        insight_id: z.ZodOptional<z.ZodString>;
        summary_type: z.ZodOptional<z.ZodString>;
        channel_id: z.ZodOptional<z.ZodString>;
        model: z.ZodOptional<z.ZodString>;
        token_count: z.ZodOptional<z.ZodNumber>;
        content: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        summary_id: z.ZodOptional<z.ZodString>;
        insight_id: z.ZodOptional<z.ZodString>;
        summary_type: z.ZodOptional<z.ZodString>;
        channel_id: z.ZodOptional<z.ZodString>;
        model: z.ZodOptional<z.ZodString>;
        token_count: z.ZodOptional<z.ZodNumber>;
        content: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        summary_id: z.ZodOptional<z.ZodString>;
        insight_id: z.ZodOptional<z.ZodString>;
        summary_type: z.ZodOptional<z.ZodString>;
        channel_id: z.ZodOptional<z.ZodString>;
        model: z.ZodOptional<z.ZodString>;
        token_count: z.ZodOptional<z.ZodNumber>;
        content: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>;
}, "strip", z.ZodTypeAny, {
    event_version: string;
    severity: "info" | "warning" | "critical";
    metadata: Record<string, unknown>;
    source_app: string;
    organization_id: string;
    event_type: "ai.summary.generated" | "ai.insight.detected";
    payload: {
        channel_id?: string | undefined;
        summary_id?: string | undefined;
        insight_id?: string | undefined;
        summary_type?: string | undefined;
        model?: string | undefined;
        token_count?: number | undefined;
        content?: string | undefined;
    } & {
        [k: string]: unknown;
    };
    workspace_id?: string | undefined;
    channel_id?: string | undefined;
    correlation_id?: string | undefined;
    triggered_by?: string | undefined;
}, {
    source_app: string;
    organization_id: string;
    event_type: "ai.summary.generated" | "ai.insight.detected";
    payload: {
        channel_id?: string | undefined;
        summary_id?: string | undefined;
        insight_id?: string | undefined;
        summary_type?: string | undefined;
        model?: string | undefined;
        token_count?: number | undefined;
        content?: string | undefined;
    } & {
        [k: string]: unknown;
    };
    event_version?: string | undefined;
    severity?: "info" | "warning" | "critical" | undefined;
    metadata?: Record<string, unknown> | undefined;
    workspace_id?: string | undefined;
    channel_id?: string | undefined;
    correlation_id?: string | undefined;
    triggered_by?: string | undefined;
}>;
export declare const IncidentEventTypeSchema: z.ZodEnum<["incident.created", "incident.updated", "incident.resolved"]>;
export declare const IncidentEventSchema: z.ZodObject<{
    source_app: z.ZodString;
    organization_id: z.ZodString;
    workspace_id: z.ZodOptional<z.ZodString>;
    channel_id: z.ZodOptional<z.ZodString>;
    event_version: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    severity: z.ZodDefault<z.ZodEnum<["info", "warning", "critical"]>>;
    correlation_id: z.ZodOptional<z.ZodString>;
    triggered_by: z.ZodOptional<z.ZodString>;
} & {
    event_type: z.ZodEnum<["incident.created", "incident.updated", "incident.resolved"]>;
    payload: z.ZodObject<{
        incident_id: z.ZodString;
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        severity: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodString>;
        affected_services: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        resolved_by: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        incident_id: z.ZodString;
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        severity: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodString>;
        affected_services: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        resolved_by: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        incident_id: z.ZodString;
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        severity: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodString>;
        affected_services: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        resolved_by: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>;
}, "strip", z.ZodTypeAny, {
    event_version: string;
    severity: "info" | "warning" | "critical";
    metadata: Record<string, unknown>;
    source_app: string;
    organization_id: string;
    event_type: "incident.created" | "incident.updated" | "incident.resolved";
    payload: {
        incident_id: string;
        title: string;
        status?: string | undefined;
        severity?: string | undefined;
        description?: string | undefined;
        affected_services?: string[] | undefined;
        resolved_by?: string | undefined;
    } & {
        [k: string]: unknown;
    };
    workspace_id?: string | undefined;
    channel_id?: string | undefined;
    correlation_id?: string | undefined;
    triggered_by?: string | undefined;
}, {
    source_app: string;
    organization_id: string;
    event_type: "incident.created" | "incident.updated" | "incident.resolved";
    payload: {
        incident_id: string;
        title: string;
        status?: string | undefined;
        severity?: string | undefined;
        description?: string | undefined;
        affected_services?: string[] | undefined;
        resolved_by?: string | undefined;
    } & {
        [k: string]: unknown;
    };
    event_version?: string | undefined;
    severity?: "info" | "warning" | "critical" | undefined;
    metadata?: Record<string, unknown> | undefined;
    workspace_id?: string | undefined;
    channel_id?: string | undefined;
    correlation_id?: string | undefined;
    triggered_by?: string | undefined;
}>;
export declare const WorkspaceEventTypeSchema: z.ZodEnum<["workspace.created", "workspace.updated", "workspace.deleted"]>;
export declare const WorkspaceEventSchema: z.ZodObject<{
    source_app: z.ZodString;
    organization_id: z.ZodString;
    workspace_id: z.ZodOptional<z.ZodString>;
    channel_id: z.ZodOptional<z.ZodString>;
    event_version: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    severity: z.ZodDefault<z.ZodEnum<["info", "warning", "critical"]>>;
    correlation_id: z.ZodOptional<z.ZodString>;
    triggered_by: z.ZodOptional<z.ZodString>;
} & {
    event_type: z.ZodEnum<["workspace.created", "workspace.updated", "workspace.deleted"]>;
    payload: z.ZodObject<{
        workspace_id: z.ZodString;
        workspace_name: z.ZodString;
        action: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        workspace_id: z.ZodString;
        workspace_name: z.ZodString;
        action: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        workspace_id: z.ZodString;
        workspace_name: z.ZodString;
        action: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>;
}, "strip", z.ZodTypeAny, {
    event_version: string;
    severity: "info" | "warning" | "critical";
    metadata: Record<string, unknown>;
    source_app: string;
    organization_id: string;
    event_type: "workspace.created" | "workspace.updated" | "workspace.deleted";
    payload: {
        workspace_id: string;
        workspace_name: string;
        action?: string | undefined;
    } & {
        [k: string]: unknown;
    };
    workspace_id?: string | undefined;
    channel_id?: string | undefined;
    correlation_id?: string | undefined;
    triggered_by?: string | undefined;
}, {
    source_app: string;
    organization_id: string;
    event_type: "workspace.created" | "workspace.updated" | "workspace.deleted";
    payload: {
        workspace_id: string;
        workspace_name: string;
        action?: string | undefined;
    } & {
        [k: string]: unknown;
    };
    event_version?: string | undefined;
    severity?: "info" | "warning" | "critical" | undefined;
    metadata?: Record<string, unknown> | undefined;
    workspace_id?: string | undefined;
    channel_id?: string | undefined;
    correlation_id?: string | undefined;
    triggered_by?: string | undefined;
}>;
export declare const ChannelEventTypeSchema: z.ZodEnum<["channel.created", "channel.updated", "channel.deleted"]>;
export declare const ChannelEventSchema: z.ZodObject<{
    source_app: z.ZodString;
    organization_id: z.ZodString;
    workspace_id: z.ZodOptional<z.ZodString>;
    channel_id: z.ZodOptional<z.ZodString>;
    event_version: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    severity: z.ZodDefault<z.ZodEnum<["info", "warning", "critical"]>>;
    correlation_id: z.ZodOptional<z.ZodString>;
    triggered_by: z.ZodOptional<z.ZodString>;
} & {
    event_type: z.ZodEnum<["channel.created", "channel.updated", "channel.deleted"]>;
    payload: z.ZodObject<{
        channel_id: z.ZodString;
        channel_name: z.ZodString;
        channel_type: z.ZodOptional<z.ZodString>;
        action: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        channel_id: z.ZodString;
        channel_name: z.ZodString;
        channel_type: z.ZodOptional<z.ZodString>;
        action: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        channel_id: z.ZodString;
        channel_name: z.ZodString;
        channel_type: z.ZodOptional<z.ZodString>;
        action: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>;
}, "strip", z.ZodTypeAny, {
    event_version: string;
    severity: "info" | "warning" | "critical";
    metadata: Record<string, unknown>;
    source_app: string;
    organization_id: string;
    event_type: "channel.created" | "channel.updated" | "channel.deleted";
    payload: {
        channel_id: string;
        channel_name: string;
        action?: string | undefined;
        channel_type?: string | undefined;
    } & {
        [k: string]: unknown;
    };
    workspace_id?: string | undefined;
    channel_id?: string | undefined;
    correlation_id?: string | undefined;
    triggered_by?: string | undefined;
}, {
    source_app: string;
    organization_id: string;
    event_type: "channel.created" | "channel.updated" | "channel.deleted";
    payload: {
        channel_id: string;
        channel_name: string;
        action?: string | undefined;
        channel_type?: string | undefined;
    } & {
        [k: string]: unknown;
    };
    event_version?: string | undefined;
    severity?: "info" | "warning" | "critical" | undefined;
    metadata?: Record<string, unknown> | undefined;
    workspace_id?: string | undefined;
    channel_id?: string | undefined;
    correlation_id?: string | undefined;
    triggered_by?: string | undefined;
}>;
export declare const MessageEventTypeSchema: z.ZodEnum<["message.created", "message.updated", "message.deleted", "mention.triggered"]>;
export declare const MessageEventSchema: z.ZodObject<{
    source_app: z.ZodString;
    organization_id: z.ZodString;
    workspace_id: z.ZodOptional<z.ZodString>;
    channel_id: z.ZodOptional<z.ZodString>;
    event_version: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    severity: z.ZodDefault<z.ZodEnum<["info", "warning", "critical"]>>;
    correlation_id: z.ZodOptional<z.ZodString>;
    triggered_by: z.ZodOptional<z.ZodString>;
} & {
    event_type: z.ZodEnum<["message.created", "message.updated", "message.deleted", "mention.triggered"]>;
    payload: z.ZodObject<{
        message_id: z.ZodString;
        channel_id: z.ZodOptional<z.ZodString>;
        author_id: z.ZodOptional<z.ZodString>;
        content_preview: z.ZodOptional<z.ZodString>;
        mentioned_user_ids: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        message_id: z.ZodString;
        channel_id: z.ZodOptional<z.ZodString>;
        author_id: z.ZodOptional<z.ZodString>;
        content_preview: z.ZodOptional<z.ZodString>;
        mentioned_user_ids: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        message_id: z.ZodString;
        channel_id: z.ZodOptional<z.ZodString>;
        author_id: z.ZodOptional<z.ZodString>;
        content_preview: z.ZodOptional<z.ZodString>;
        mentioned_user_ids: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, z.ZodTypeAny, "passthrough">>;
}, "strip", z.ZodTypeAny, {
    event_version: string;
    severity: "info" | "warning" | "critical";
    metadata: Record<string, unknown>;
    source_app: string;
    organization_id: string;
    event_type: "message.created" | "message.updated" | "message.deleted" | "mention.triggered";
    payload: {
        message_id: string;
        channel_id?: string | undefined;
        author_id?: string | undefined;
        content_preview?: string | undefined;
        mentioned_user_ids?: string[] | undefined;
    } & {
        [k: string]: unknown;
    };
    workspace_id?: string | undefined;
    channel_id?: string | undefined;
    correlation_id?: string | undefined;
    triggered_by?: string | undefined;
}, {
    source_app: string;
    organization_id: string;
    event_type: "message.created" | "message.updated" | "message.deleted" | "mention.triggered";
    payload: {
        message_id: string;
        channel_id?: string | undefined;
        author_id?: string | undefined;
        content_preview?: string | undefined;
        mentioned_user_ids?: string[] | undefined;
    } & {
        [k: string]: unknown;
    };
    event_version?: string | undefined;
    severity?: "info" | "warning" | "critical" | undefined;
    metadata?: Record<string, unknown> | undefined;
    workspace_id?: string | undefined;
    channel_id?: string | undefined;
    correlation_id?: string | undefined;
    triggered_by?: string | undefined;
}>;
export declare const PipelineEventTypeSchema: z.ZodEnum<["pipeline.started", "pipeline.completed", "pipeline.failed"]>;
export declare const PipelineEventSchema: z.ZodObject<{
    source_app: z.ZodString;
    organization_id: z.ZodString;
    workspace_id: z.ZodOptional<z.ZodString>;
    channel_id: z.ZodOptional<z.ZodString>;
    event_version: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    severity: z.ZodDefault<z.ZodEnum<["info", "warning", "critical"]>>;
    correlation_id: z.ZodOptional<z.ZodString>;
    triggered_by: z.ZodOptional<z.ZodString>;
} & {
    event_type: z.ZodEnum<["pipeline.started", "pipeline.completed", "pipeline.failed"]>;
    payload: z.ZodObject<{
        pipeline_id: z.ZodString;
        pipeline_name: z.ZodOptional<z.ZodString>;
        project: z.ZodOptional<z.ZodString>;
        branch: z.ZodOptional<z.ZodString>;
        commit_sha: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodString>;
        duration_seconds: z.ZodOptional<z.ZodNumber>;
        stages: z.ZodOptional<z.ZodArray<z.ZodObject<{
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
        }>, "many">>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        pipeline_id: z.ZodString;
        pipeline_name: z.ZodOptional<z.ZodString>;
        project: z.ZodOptional<z.ZodString>;
        branch: z.ZodOptional<z.ZodString>;
        commit_sha: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodString>;
        duration_seconds: z.ZodOptional<z.ZodNumber>;
        stages: z.ZodOptional<z.ZodArray<z.ZodObject<{
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
        }>, "many">>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        pipeline_id: z.ZodString;
        pipeline_name: z.ZodOptional<z.ZodString>;
        project: z.ZodOptional<z.ZodString>;
        branch: z.ZodOptional<z.ZodString>;
        commit_sha: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodString>;
        duration_seconds: z.ZodOptional<z.ZodNumber>;
        stages: z.ZodOptional<z.ZodArray<z.ZodObject<{
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
        }>, "many">>;
    }, z.ZodTypeAny, "passthrough">>;
}, "strip", z.ZodTypeAny, {
    event_version: string;
    severity: "info" | "warning" | "critical";
    metadata: Record<string, unknown>;
    source_app: string;
    organization_id: string;
    event_type: "pipeline.started" | "pipeline.completed" | "pipeline.failed";
    payload: {
        pipeline_id: string;
        status?: string | undefined;
        commit_sha?: string | undefined;
        pipeline_name?: string | undefined;
        project?: string | undefined;
        branch?: string | undefined;
        duration_seconds?: number | undefined;
        stages?: {
            status: string;
            name: string;
            duration_seconds?: number | undefined;
        }[] | undefined;
    } & {
        [k: string]: unknown;
    };
    workspace_id?: string | undefined;
    channel_id?: string | undefined;
    correlation_id?: string | undefined;
    triggered_by?: string | undefined;
}, {
    source_app: string;
    organization_id: string;
    event_type: "pipeline.started" | "pipeline.completed" | "pipeline.failed";
    payload: {
        pipeline_id: string;
        status?: string | undefined;
        commit_sha?: string | undefined;
        pipeline_name?: string | undefined;
        project?: string | undefined;
        branch?: string | undefined;
        duration_seconds?: number | undefined;
        stages?: {
            status: string;
            name: string;
            duration_seconds?: number | undefined;
        }[] | undefined;
    } & {
        [k: string]: unknown;
    };
    event_version?: string | undefined;
    severity?: "info" | "warning" | "critical" | undefined;
    metadata?: Record<string, unknown> | undefined;
    workspace_id?: string | undefined;
    channel_id?: string | undefined;
    correlation_id?: string | undefined;
    triggered_by?: string | undefined;
}>;
export declare const AnalyticsEventTypeSchema: z.ZodEnum<["analytics.alert", "metrics.threshold"]>;
export declare const AnalyticsEventSchema: z.ZodObject<{
    source_app: z.ZodString;
    organization_id: z.ZodString;
    workspace_id: z.ZodOptional<z.ZodString>;
    channel_id: z.ZodOptional<z.ZodString>;
    event_version: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    severity: z.ZodDefault<z.ZodEnum<["info", "warning", "critical"]>>;
    correlation_id: z.ZodOptional<z.ZodString>;
    triggered_by: z.ZodOptional<z.ZodString>;
} & {
    event_type: z.ZodEnum<["analytics.alert", "metrics.threshold"]>;
    payload: z.ZodObject<{
        alert_id: z.ZodOptional<z.ZodString>;
        metric_id: z.ZodOptional<z.ZodString>;
        metric_name: z.ZodOptional<z.ZodString>;
        threshold_value: z.ZodOptional<z.ZodNumber>;
        actual_value: z.ZodOptional<z.ZodNumber>;
        condition: z.ZodOptional<z.ZodString>;
        time_window: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        alert_id: z.ZodOptional<z.ZodString>;
        metric_id: z.ZodOptional<z.ZodString>;
        metric_name: z.ZodOptional<z.ZodString>;
        threshold_value: z.ZodOptional<z.ZodNumber>;
        actual_value: z.ZodOptional<z.ZodNumber>;
        condition: z.ZodOptional<z.ZodString>;
        time_window: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        alert_id: z.ZodOptional<z.ZodString>;
        metric_id: z.ZodOptional<z.ZodString>;
        metric_name: z.ZodOptional<z.ZodString>;
        threshold_value: z.ZodOptional<z.ZodNumber>;
        actual_value: z.ZodOptional<z.ZodNumber>;
        condition: z.ZodOptional<z.ZodString>;
        time_window: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>;
}, "strip", z.ZodTypeAny, {
    event_version: string;
    severity: "info" | "warning" | "critical";
    metadata: Record<string, unknown>;
    source_app: string;
    organization_id: string;
    event_type: "analytics.alert" | "metrics.threshold";
    payload: {
        alert_id?: string | undefined;
        metric_id?: string | undefined;
        metric_name?: string | undefined;
        threshold_value?: number | undefined;
        actual_value?: number | undefined;
        condition?: string | undefined;
        time_window?: string | undefined;
    } & {
        [k: string]: unknown;
    };
    workspace_id?: string | undefined;
    channel_id?: string | undefined;
    correlation_id?: string | undefined;
    triggered_by?: string | undefined;
}, {
    source_app: string;
    organization_id: string;
    event_type: "analytics.alert" | "metrics.threshold";
    payload: {
        alert_id?: string | undefined;
        metric_id?: string | undefined;
        metric_name?: string | undefined;
        threshold_value?: number | undefined;
        actual_value?: number | undefined;
        condition?: string | undefined;
        time_window?: string | undefined;
    } & {
        [k: string]: unknown;
    };
    event_version?: string | undefined;
    severity?: "info" | "warning" | "critical" | undefined;
    metadata?: Record<string, unknown> | undefined;
    workspace_id?: string | undefined;
    channel_id?: string | undefined;
    correlation_id?: string | undefined;
    triggered_by?: string | undefined;
}>;
export declare const EcosystemEventSchema: z.ZodDiscriminatedUnion<"event_type", [z.ZodObject<{
    source_app: z.ZodString;
    organization_id: z.ZodString;
    workspace_id: z.ZodOptional<z.ZodString>;
    channel_id: z.ZodOptional<z.ZodString>;
    event_version: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    severity: z.ZodDefault<z.ZodEnum<["info", "warning", "critical"]>>;
    correlation_id: z.ZodOptional<z.ZodString>;
    triggered_by: z.ZodOptional<z.ZodString>;
} & {
    event_type: z.ZodEnum<["deployment.started", "deployment.completed", "deployment.failed"]>;
    payload: z.ZodObject<{
        deployment_id: z.ZodString;
        service: z.ZodString;
        environment: z.ZodString;
        version: z.ZodString;
        commit_sha: z.ZodOptional<z.ZodString>;
        duration_ms: z.ZodOptional<z.ZodNumber>;
        url: z.ZodOptional<z.ZodString>;
        error_message: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        deployment_id: z.ZodString;
        service: z.ZodString;
        environment: z.ZodString;
        version: z.ZodString;
        commit_sha: z.ZodOptional<z.ZodString>;
        duration_ms: z.ZodOptional<z.ZodNumber>;
        url: z.ZodOptional<z.ZodString>;
        error_message: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        deployment_id: z.ZodString;
        service: z.ZodString;
        environment: z.ZodString;
        version: z.ZodString;
        commit_sha: z.ZodOptional<z.ZodString>;
        duration_ms: z.ZodOptional<z.ZodNumber>;
        url: z.ZodOptional<z.ZodString>;
        error_message: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>;
}, "strip", z.ZodTypeAny, {
    event_version: string;
    severity: "info" | "warning" | "critical";
    metadata: Record<string, unknown>;
    source_app: string;
    organization_id: string;
    event_type: "deployment.started" | "deployment.completed" | "deployment.failed";
    payload: {
        deployment_id: string;
        service: string;
        environment: string;
        version: string;
        commit_sha?: string | undefined;
        duration_ms?: number | undefined;
        url?: string | undefined;
        error_message?: string | undefined;
    } & {
        [k: string]: unknown;
    };
    workspace_id?: string | undefined;
    channel_id?: string | undefined;
    correlation_id?: string | undefined;
    triggered_by?: string | undefined;
}, {
    source_app: string;
    organization_id: string;
    event_type: "deployment.started" | "deployment.completed" | "deployment.failed";
    payload: {
        deployment_id: string;
        service: string;
        environment: string;
        version: string;
        commit_sha?: string | undefined;
        duration_ms?: number | undefined;
        url?: string | undefined;
        error_message?: string | undefined;
    } & {
        [k: string]: unknown;
    };
    event_version?: string | undefined;
    severity?: "info" | "warning" | "critical" | undefined;
    metadata?: Record<string, unknown> | undefined;
    workspace_id?: string | undefined;
    channel_id?: string | undefined;
    correlation_id?: string | undefined;
    triggered_by?: string | undefined;
}>, z.ZodObject<{
    source_app: z.ZodString;
    organization_id: z.ZodString;
    workspace_id: z.ZodOptional<z.ZodString>;
    channel_id: z.ZodOptional<z.ZodString>;
    event_version: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    severity: z.ZodDefault<z.ZodEnum<["info", "warning", "critical"]>>;
    correlation_id: z.ZodOptional<z.ZodString>;
    triggered_by: z.ZodOptional<z.ZodString>;
} & {
    event_type: z.ZodEnum<["ai.summary.generated", "ai.insight.detected"]>;
    payload: z.ZodObject<{
        summary_id: z.ZodOptional<z.ZodString>;
        insight_id: z.ZodOptional<z.ZodString>;
        summary_type: z.ZodOptional<z.ZodString>;
        channel_id: z.ZodOptional<z.ZodString>;
        model: z.ZodOptional<z.ZodString>;
        token_count: z.ZodOptional<z.ZodNumber>;
        content: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        summary_id: z.ZodOptional<z.ZodString>;
        insight_id: z.ZodOptional<z.ZodString>;
        summary_type: z.ZodOptional<z.ZodString>;
        channel_id: z.ZodOptional<z.ZodString>;
        model: z.ZodOptional<z.ZodString>;
        token_count: z.ZodOptional<z.ZodNumber>;
        content: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        summary_id: z.ZodOptional<z.ZodString>;
        insight_id: z.ZodOptional<z.ZodString>;
        summary_type: z.ZodOptional<z.ZodString>;
        channel_id: z.ZodOptional<z.ZodString>;
        model: z.ZodOptional<z.ZodString>;
        token_count: z.ZodOptional<z.ZodNumber>;
        content: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>;
}, "strip", z.ZodTypeAny, {
    event_version: string;
    severity: "info" | "warning" | "critical";
    metadata: Record<string, unknown>;
    source_app: string;
    organization_id: string;
    event_type: "ai.summary.generated" | "ai.insight.detected";
    payload: {
        channel_id?: string | undefined;
        summary_id?: string | undefined;
        insight_id?: string | undefined;
        summary_type?: string | undefined;
        model?: string | undefined;
        token_count?: number | undefined;
        content?: string | undefined;
    } & {
        [k: string]: unknown;
    };
    workspace_id?: string | undefined;
    channel_id?: string | undefined;
    correlation_id?: string | undefined;
    triggered_by?: string | undefined;
}, {
    source_app: string;
    organization_id: string;
    event_type: "ai.summary.generated" | "ai.insight.detected";
    payload: {
        channel_id?: string | undefined;
        summary_id?: string | undefined;
        insight_id?: string | undefined;
        summary_type?: string | undefined;
        model?: string | undefined;
        token_count?: number | undefined;
        content?: string | undefined;
    } & {
        [k: string]: unknown;
    };
    event_version?: string | undefined;
    severity?: "info" | "warning" | "critical" | undefined;
    metadata?: Record<string, unknown> | undefined;
    workspace_id?: string | undefined;
    channel_id?: string | undefined;
    correlation_id?: string | undefined;
    triggered_by?: string | undefined;
}>, z.ZodObject<{
    source_app: z.ZodString;
    organization_id: z.ZodString;
    workspace_id: z.ZodOptional<z.ZodString>;
    channel_id: z.ZodOptional<z.ZodString>;
    event_version: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    severity: z.ZodDefault<z.ZodEnum<["info", "warning", "critical"]>>;
    correlation_id: z.ZodOptional<z.ZodString>;
    triggered_by: z.ZodOptional<z.ZodString>;
} & {
    event_type: z.ZodEnum<["incident.created", "incident.updated", "incident.resolved"]>;
    payload: z.ZodObject<{
        incident_id: z.ZodString;
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        severity: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodString>;
        affected_services: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        resolved_by: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        incident_id: z.ZodString;
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        severity: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodString>;
        affected_services: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        resolved_by: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        incident_id: z.ZodString;
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        severity: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodString>;
        affected_services: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        resolved_by: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>;
}, "strip", z.ZodTypeAny, {
    event_version: string;
    severity: "info" | "warning" | "critical";
    metadata: Record<string, unknown>;
    source_app: string;
    organization_id: string;
    event_type: "incident.created" | "incident.updated" | "incident.resolved";
    payload: {
        incident_id: string;
        title: string;
        status?: string | undefined;
        severity?: string | undefined;
        description?: string | undefined;
        affected_services?: string[] | undefined;
        resolved_by?: string | undefined;
    } & {
        [k: string]: unknown;
    };
    workspace_id?: string | undefined;
    channel_id?: string | undefined;
    correlation_id?: string | undefined;
    triggered_by?: string | undefined;
}, {
    source_app: string;
    organization_id: string;
    event_type: "incident.created" | "incident.updated" | "incident.resolved";
    payload: {
        incident_id: string;
        title: string;
        status?: string | undefined;
        severity?: string | undefined;
        description?: string | undefined;
        affected_services?: string[] | undefined;
        resolved_by?: string | undefined;
    } & {
        [k: string]: unknown;
    };
    event_version?: string | undefined;
    severity?: "info" | "warning" | "critical" | undefined;
    metadata?: Record<string, unknown> | undefined;
    workspace_id?: string | undefined;
    channel_id?: string | undefined;
    correlation_id?: string | undefined;
    triggered_by?: string | undefined;
}>, z.ZodObject<{
    source_app: z.ZodString;
    organization_id: z.ZodString;
    workspace_id: z.ZodOptional<z.ZodString>;
    channel_id: z.ZodOptional<z.ZodString>;
    event_version: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    severity: z.ZodDefault<z.ZodEnum<["info", "warning", "critical"]>>;
    correlation_id: z.ZodOptional<z.ZodString>;
    triggered_by: z.ZodOptional<z.ZodString>;
} & {
    event_type: z.ZodEnum<["workspace.created", "workspace.updated", "workspace.deleted"]>;
    payload: z.ZodObject<{
        workspace_id: z.ZodString;
        workspace_name: z.ZodString;
        action: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        workspace_id: z.ZodString;
        workspace_name: z.ZodString;
        action: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        workspace_id: z.ZodString;
        workspace_name: z.ZodString;
        action: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>;
}, "strip", z.ZodTypeAny, {
    event_version: string;
    severity: "info" | "warning" | "critical";
    metadata: Record<string, unknown>;
    source_app: string;
    organization_id: string;
    event_type: "workspace.created" | "workspace.updated" | "workspace.deleted";
    payload: {
        workspace_id: string;
        workspace_name: string;
        action?: string | undefined;
    } & {
        [k: string]: unknown;
    };
    workspace_id?: string | undefined;
    channel_id?: string | undefined;
    correlation_id?: string | undefined;
    triggered_by?: string | undefined;
}, {
    source_app: string;
    organization_id: string;
    event_type: "workspace.created" | "workspace.updated" | "workspace.deleted";
    payload: {
        workspace_id: string;
        workspace_name: string;
        action?: string | undefined;
    } & {
        [k: string]: unknown;
    };
    event_version?: string | undefined;
    severity?: "info" | "warning" | "critical" | undefined;
    metadata?: Record<string, unknown> | undefined;
    workspace_id?: string | undefined;
    channel_id?: string | undefined;
    correlation_id?: string | undefined;
    triggered_by?: string | undefined;
}>, z.ZodObject<{
    source_app: z.ZodString;
    organization_id: z.ZodString;
    workspace_id: z.ZodOptional<z.ZodString>;
    channel_id: z.ZodOptional<z.ZodString>;
    event_version: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    severity: z.ZodDefault<z.ZodEnum<["info", "warning", "critical"]>>;
    correlation_id: z.ZodOptional<z.ZodString>;
    triggered_by: z.ZodOptional<z.ZodString>;
} & {
    event_type: z.ZodEnum<["channel.created", "channel.updated", "channel.deleted"]>;
    payload: z.ZodObject<{
        channel_id: z.ZodString;
        channel_name: z.ZodString;
        channel_type: z.ZodOptional<z.ZodString>;
        action: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        channel_id: z.ZodString;
        channel_name: z.ZodString;
        channel_type: z.ZodOptional<z.ZodString>;
        action: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        channel_id: z.ZodString;
        channel_name: z.ZodString;
        channel_type: z.ZodOptional<z.ZodString>;
        action: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>;
}, "strip", z.ZodTypeAny, {
    event_version: string;
    severity: "info" | "warning" | "critical";
    metadata: Record<string, unknown>;
    source_app: string;
    organization_id: string;
    event_type: "channel.created" | "channel.updated" | "channel.deleted";
    payload: {
        channel_id: string;
        channel_name: string;
        action?: string | undefined;
        channel_type?: string | undefined;
    } & {
        [k: string]: unknown;
    };
    workspace_id?: string | undefined;
    channel_id?: string | undefined;
    correlation_id?: string | undefined;
    triggered_by?: string | undefined;
}, {
    source_app: string;
    organization_id: string;
    event_type: "channel.created" | "channel.updated" | "channel.deleted";
    payload: {
        channel_id: string;
        channel_name: string;
        action?: string | undefined;
        channel_type?: string | undefined;
    } & {
        [k: string]: unknown;
    };
    event_version?: string | undefined;
    severity?: "info" | "warning" | "critical" | undefined;
    metadata?: Record<string, unknown> | undefined;
    workspace_id?: string | undefined;
    channel_id?: string | undefined;
    correlation_id?: string | undefined;
    triggered_by?: string | undefined;
}>, z.ZodObject<{
    source_app: z.ZodString;
    organization_id: z.ZodString;
    workspace_id: z.ZodOptional<z.ZodString>;
    channel_id: z.ZodOptional<z.ZodString>;
    event_version: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    severity: z.ZodDefault<z.ZodEnum<["info", "warning", "critical"]>>;
    correlation_id: z.ZodOptional<z.ZodString>;
    triggered_by: z.ZodOptional<z.ZodString>;
} & {
    event_type: z.ZodEnum<["message.created", "message.updated", "message.deleted", "mention.triggered"]>;
    payload: z.ZodObject<{
        message_id: z.ZodString;
        channel_id: z.ZodOptional<z.ZodString>;
        author_id: z.ZodOptional<z.ZodString>;
        content_preview: z.ZodOptional<z.ZodString>;
        mentioned_user_ids: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        message_id: z.ZodString;
        channel_id: z.ZodOptional<z.ZodString>;
        author_id: z.ZodOptional<z.ZodString>;
        content_preview: z.ZodOptional<z.ZodString>;
        mentioned_user_ids: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        message_id: z.ZodString;
        channel_id: z.ZodOptional<z.ZodString>;
        author_id: z.ZodOptional<z.ZodString>;
        content_preview: z.ZodOptional<z.ZodString>;
        mentioned_user_ids: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, z.ZodTypeAny, "passthrough">>;
}, "strip", z.ZodTypeAny, {
    event_version: string;
    severity: "info" | "warning" | "critical";
    metadata: Record<string, unknown>;
    source_app: string;
    organization_id: string;
    event_type: "message.created" | "message.updated" | "message.deleted" | "mention.triggered";
    payload: {
        message_id: string;
        channel_id?: string | undefined;
        author_id?: string | undefined;
        content_preview?: string | undefined;
        mentioned_user_ids?: string[] | undefined;
    } & {
        [k: string]: unknown;
    };
    workspace_id?: string | undefined;
    channel_id?: string | undefined;
    correlation_id?: string | undefined;
    triggered_by?: string | undefined;
}, {
    source_app: string;
    organization_id: string;
    event_type: "message.created" | "message.updated" | "message.deleted" | "mention.triggered";
    payload: {
        message_id: string;
        channel_id?: string | undefined;
        author_id?: string | undefined;
        content_preview?: string | undefined;
        mentioned_user_ids?: string[] | undefined;
    } & {
        [k: string]: unknown;
    };
    event_version?: string | undefined;
    severity?: "info" | "warning" | "critical" | undefined;
    metadata?: Record<string, unknown> | undefined;
    workspace_id?: string | undefined;
    channel_id?: string | undefined;
    correlation_id?: string | undefined;
    triggered_by?: string | undefined;
}>, z.ZodObject<{
    source_app: z.ZodString;
    organization_id: z.ZodString;
    workspace_id: z.ZodOptional<z.ZodString>;
    channel_id: z.ZodOptional<z.ZodString>;
    event_version: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    severity: z.ZodDefault<z.ZodEnum<["info", "warning", "critical"]>>;
    correlation_id: z.ZodOptional<z.ZodString>;
    triggered_by: z.ZodOptional<z.ZodString>;
} & {
    event_type: z.ZodEnum<["pipeline.started", "pipeline.completed", "pipeline.failed"]>;
    payload: z.ZodObject<{
        pipeline_id: z.ZodString;
        pipeline_name: z.ZodOptional<z.ZodString>;
        project: z.ZodOptional<z.ZodString>;
        branch: z.ZodOptional<z.ZodString>;
        commit_sha: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodString>;
        duration_seconds: z.ZodOptional<z.ZodNumber>;
        stages: z.ZodOptional<z.ZodArray<z.ZodObject<{
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
        }>, "many">>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        pipeline_id: z.ZodString;
        pipeline_name: z.ZodOptional<z.ZodString>;
        project: z.ZodOptional<z.ZodString>;
        branch: z.ZodOptional<z.ZodString>;
        commit_sha: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodString>;
        duration_seconds: z.ZodOptional<z.ZodNumber>;
        stages: z.ZodOptional<z.ZodArray<z.ZodObject<{
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
        }>, "many">>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        pipeline_id: z.ZodString;
        pipeline_name: z.ZodOptional<z.ZodString>;
        project: z.ZodOptional<z.ZodString>;
        branch: z.ZodOptional<z.ZodString>;
        commit_sha: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodString>;
        duration_seconds: z.ZodOptional<z.ZodNumber>;
        stages: z.ZodOptional<z.ZodArray<z.ZodObject<{
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
        }>, "many">>;
    }, z.ZodTypeAny, "passthrough">>;
}, "strip", z.ZodTypeAny, {
    event_version: string;
    severity: "info" | "warning" | "critical";
    metadata: Record<string, unknown>;
    source_app: string;
    organization_id: string;
    event_type: "pipeline.started" | "pipeline.completed" | "pipeline.failed";
    payload: {
        pipeline_id: string;
        status?: string | undefined;
        commit_sha?: string | undefined;
        pipeline_name?: string | undefined;
        project?: string | undefined;
        branch?: string | undefined;
        duration_seconds?: number | undefined;
        stages?: {
            status: string;
            name: string;
            duration_seconds?: number | undefined;
        }[] | undefined;
    } & {
        [k: string]: unknown;
    };
    workspace_id?: string | undefined;
    channel_id?: string | undefined;
    correlation_id?: string | undefined;
    triggered_by?: string | undefined;
}, {
    source_app: string;
    organization_id: string;
    event_type: "pipeline.started" | "pipeline.completed" | "pipeline.failed";
    payload: {
        pipeline_id: string;
        status?: string | undefined;
        commit_sha?: string | undefined;
        pipeline_name?: string | undefined;
        project?: string | undefined;
        branch?: string | undefined;
        duration_seconds?: number | undefined;
        stages?: {
            status: string;
            name: string;
            duration_seconds?: number | undefined;
        }[] | undefined;
    } & {
        [k: string]: unknown;
    };
    event_version?: string | undefined;
    severity?: "info" | "warning" | "critical" | undefined;
    metadata?: Record<string, unknown> | undefined;
    workspace_id?: string | undefined;
    channel_id?: string | undefined;
    correlation_id?: string | undefined;
    triggered_by?: string | undefined;
}>, z.ZodObject<{
    source_app: z.ZodString;
    organization_id: z.ZodString;
    workspace_id: z.ZodOptional<z.ZodString>;
    channel_id: z.ZodOptional<z.ZodString>;
    event_version: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    severity: z.ZodDefault<z.ZodEnum<["info", "warning", "critical"]>>;
    correlation_id: z.ZodOptional<z.ZodString>;
    triggered_by: z.ZodOptional<z.ZodString>;
} & {
    event_type: z.ZodEnum<["analytics.alert", "metrics.threshold"]>;
    payload: z.ZodObject<{
        alert_id: z.ZodOptional<z.ZodString>;
        metric_id: z.ZodOptional<z.ZodString>;
        metric_name: z.ZodOptional<z.ZodString>;
        threshold_value: z.ZodOptional<z.ZodNumber>;
        actual_value: z.ZodOptional<z.ZodNumber>;
        condition: z.ZodOptional<z.ZodString>;
        time_window: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        alert_id: z.ZodOptional<z.ZodString>;
        metric_id: z.ZodOptional<z.ZodString>;
        metric_name: z.ZodOptional<z.ZodString>;
        threshold_value: z.ZodOptional<z.ZodNumber>;
        actual_value: z.ZodOptional<z.ZodNumber>;
        condition: z.ZodOptional<z.ZodString>;
        time_window: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        alert_id: z.ZodOptional<z.ZodString>;
        metric_id: z.ZodOptional<z.ZodString>;
        metric_name: z.ZodOptional<z.ZodString>;
        threshold_value: z.ZodOptional<z.ZodNumber>;
        actual_value: z.ZodOptional<z.ZodNumber>;
        condition: z.ZodOptional<z.ZodString>;
        time_window: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>;
}, "strip", z.ZodTypeAny, {
    event_version: string;
    severity: "info" | "warning" | "critical";
    metadata: Record<string, unknown>;
    source_app: string;
    organization_id: string;
    event_type: "analytics.alert" | "metrics.threshold";
    payload: {
        alert_id?: string | undefined;
        metric_id?: string | undefined;
        metric_name?: string | undefined;
        threshold_value?: number | undefined;
        actual_value?: number | undefined;
        condition?: string | undefined;
        time_window?: string | undefined;
    } & {
        [k: string]: unknown;
    };
    workspace_id?: string | undefined;
    channel_id?: string | undefined;
    correlation_id?: string | undefined;
    triggered_by?: string | undefined;
}, {
    source_app: string;
    organization_id: string;
    event_type: "analytics.alert" | "metrics.threshold";
    payload: {
        alert_id?: string | undefined;
        metric_id?: string | undefined;
        metric_name?: string | undefined;
        threshold_value?: number | undefined;
        actual_value?: number | undefined;
        condition?: string | undefined;
        time_window?: string | undefined;
    } & {
        [k: string]: unknown;
    };
    event_version?: string | undefined;
    severity?: "info" | "warning" | "critical" | undefined;
    metadata?: Record<string, unknown> | undefined;
    workspace_id?: string | undefined;
    channel_id?: string | undefined;
    correlation_id?: string | undefined;
    triggered_by?: string | undefined;
}>]>;
export type EcosystemEventInput = z.infer<typeof EcosystemEventSchema>;
export declare const CreateEventBodySchema: z.ZodObject<{
    source_app: z.ZodString;
    organization_id: z.ZodString;
    workspace_id: z.ZodOptional<z.ZodString>;
    channel_id: z.ZodOptional<z.ZodString>;
    event_version: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    payload: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    severity: z.ZodDefault<z.ZodEnum<["info", "warning", "critical"]>>;
    correlation_id: z.ZodOptional<z.ZodString>;
    triggered_by: z.ZodOptional<z.ZodString>;
} & {
    event_type: z.ZodString;
}, "strip", z.ZodTypeAny, {
    event_version: string;
    severity: "info" | "warning" | "critical";
    metadata: Record<string, unknown>;
    source_app: string;
    organization_id: string;
    event_type: string;
    payload: Record<string, unknown>;
    workspace_id?: string | undefined;
    channel_id?: string | undefined;
    correlation_id?: string | undefined;
    triggered_by?: string | undefined;
}, {
    source_app: string;
    organization_id: string;
    event_type: string;
    event_version?: string | undefined;
    severity?: "info" | "warning" | "critical" | undefined;
    metadata?: Record<string, unknown> | undefined;
    workspace_id?: string | undefined;
    channel_id?: string | undefined;
    payload?: Record<string, unknown> | undefined;
    correlation_id?: string | undefined;
    triggered_by?: string | undefined;
}>;
export type CreateEventBody = z.infer<typeof CreateEventBodySchema>;
export declare const QueryEventsSchema: z.ZodObject<{
    organization_id: z.ZodOptional<z.ZodString>;
    workspace_id: z.ZodOptional<z.ZodString>;
    channel_id: z.ZodOptional<z.ZodString>;
    source_app: z.ZodOptional<z.ZodString>;
    event_type: z.ZodOptional<z.ZodString>;
    severity: z.ZodOptional<z.ZodEnum<["info", "warning", "critical"]>>;
    correlation_id: z.ZodOptional<z.ZodString>;
    from: z.ZodOptional<z.ZodString>;
    to: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    offset: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    offset: number;
    severity?: "info" | "warning" | "critical" | undefined;
    source_app?: string | undefined;
    organization_id?: string | undefined;
    workspace_id?: string | undefined;
    channel_id?: string | undefined;
    event_type?: string | undefined;
    correlation_id?: string | undefined;
    from?: string | undefined;
    to?: string | undefined;
}, {
    severity?: "info" | "warning" | "critical" | undefined;
    source_app?: string | undefined;
    organization_id?: string | undefined;
    workspace_id?: string | undefined;
    channel_id?: string | undefined;
    event_type?: string | undefined;
    correlation_id?: string | undefined;
    from?: string | undefined;
    to?: string | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
}>;
export type QueryEventsInput = z.infer<typeof QueryEventsSchema>;
//# sourceMappingURL=event-schemas.d.ts.map