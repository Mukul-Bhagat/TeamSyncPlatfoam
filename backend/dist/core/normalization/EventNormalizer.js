"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventNormalizer = void 0;
const defaultNormalizer = (raw, defaults) => {
    const payload = raw.payload ?? raw.data ?? {};
    return {
        source_app: defaults.source_app || 'unknown',
        organization_id: defaults.organization_id || '',
        workspace_id: defaults.workspace_id,
        channel_id: defaults.channel_id,
        event_type: raw.event_type,
        event_version: raw.event_version || '1.0',
        payload: payload,
        metadata: {},
        severity: defaults.severity || 'info',
        correlation_id: defaults.correlation_id,
        triggered_by: defaults.triggered_by,
    };
};
const appNormalizers = new Map();
// DeployHub normalizer
appNormalizers.set('deployhub', (raw, defaults) => {
    const payload = raw.payload ?? raw.data ?? {};
    let severity = 'info';
    if (raw.event_type === 'deployment.failed')
        severity = 'critical';
    else if (raw.event_type === 'deployment.completed')
        severity = 'info';
    else if (raw.event_type === 'deployment.started')
        severity = 'info';
    return {
        ...defaultNormalizer(raw, defaults),
        source_app: 'deployhub',
        severity: defaults.severity || severity,
        payload: {
            deployment_id: payload.deployment_id || payload.id || 'unknown',
            service: payload.service || payload.app_name || 'unknown',
            environment: payload.environment || payload.env || 'unknown',
            version: payload.version || payload.tag || 'unknown',
            commit_sha: payload.commit_sha || payload.commit || undefined,
            duration_ms: payload.duration_ms || payload.duration_seconds ? payload.duration_seconds * 1000 : undefined,
            url: payload.url || undefined,
            error_message: payload.error_message || payload.error || undefined,
        },
    };
});
// PipeVista normalizer
appNormalizers.set('pipevista', (raw, defaults) => {
    const payload = raw.payload ?? raw.data ?? {};
    return {
        ...defaultNormalizer(raw, defaults),
        source_app: 'pipevista',
        event_type: mapPipeVistaEventType(raw.event_type),
        payload: {
            pipeline_id: payload.pipeline_id || payload.id || 'unknown',
            pipeline_name: payload.pipeline_name || payload.name || 'unknown',
            project: payload.project || payload.repo || 'unknown',
            branch: payload.branch || payload.ref || 'unknown',
            commit_sha: payload.commit_sha || payload.commit || 'unknown',
            status: payload.status || payload.state || 'unknown',
            duration_seconds: payload.duration_seconds || payload.duration || undefined,
            stages: payload.stages || undefined,
        },
    };
});
// InsightAI normalizer
appNormalizers.set('insightai', (raw, defaults) => {
    const payload = raw.payload ?? raw.data ?? {};
    return {
        ...defaultNormalizer(raw, defaults),
        source_app: 'insightai',
        event_type: mapInsightAIEventType(raw.event_type),
        payload: {
            summary_id: payload.summary_id || payload.id || undefined,
            insight_id: payload.insight_id || payload.id || undefined,
            summary_type: payload.summary_type || payload.type || undefined,
            channel_id: payload.channel_id || payload.context_id || undefined,
            model: payload.model || payload.model_name || undefined,
            token_count: payload.token_count || payload.tokens || undefined,
            content: payload.content || payload.summary || payload.description || undefined,
        },
    };
});
// IncidentOS normalizer
appNormalizers.set('incidentos', (raw, defaults) => {
    const payload = raw.payload ?? raw.data ?? {};
    let severity = 'info';
    if (raw.event_type === 'incident.created')
        severity = payload.severity === 'critical' ? 'critical' : 'warning';
    else if (raw.event_type === 'incident.resolved')
        severity = 'info';
    return {
        ...defaultNormalizer(raw, defaults),
        source_app: 'incidentos',
        event_type: mapIncidentOSEventType(raw.event_type),
        severity: defaults.severity || severity,
        payload: {
            incident_id: payload.incident_id || payload.id || 'unknown',
            title: payload.title || payload.name || 'Unknown Incident',
            description: payload.description || payload.summary || undefined,
            severity: payload.severity || payload.priority || undefined,
            status: payload.status || payload.state || undefined,
            affected_services: payload.affected_services || payload.services || undefined,
            resolved_by: payload.resolved_by || payload.resolver || undefined,
        },
    };
});
function mapPipeVistaEventType(rawType) {
    const mapping = {
        'pipeline.start': 'pipeline.started',
        'pipeline.finish': 'pipeline.completed',
        'pipeline.fail': 'pipeline.failed',
    };
    return mapping[rawType] || rawType;
}
function mapInsightAIEventType(rawType) {
    const mapping = {
        'summary.ready': 'ai.summary.generated',
        'insight.found': 'ai.insight.detected',
    };
    return mapping[rawType] || rawType;
}
function mapIncidentOSEventType(rawType) {
    const mapping = {
        'incident.opened': 'incident.created',
        'incident.closed': 'incident.resolved',
        'incident.update': 'incident.updated',
    };
    return mapping[rawType] || rawType;
}
class EventNormalizer {
    static normalize(raw, defaults = {}) {
        const sourceApp = (defaults.source_app || String(raw.source_app || 'unknown')).toLowerCase();
        const normalizer = appNormalizers.get(sourceApp) || defaultNormalizer;
        return normalizer(raw, { ...defaults, source_app: sourceApp });
    }
    static registerNormalizer(sourceApp, normalizer) {
        appNormalizers.set(sourceApp.toLowerCase(), normalizer);
    }
}
exports.EventNormalizer = EventNormalizer;
//# sourceMappingURL=EventNormalizer.js.map