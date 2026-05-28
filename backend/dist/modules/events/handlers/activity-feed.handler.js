"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerActivityFeedHandler = registerActivityFeedHandler;
const event_bus_1 = require("../../../core/event-bus");
const database_1 = require("../../../shared/database");
function mapEventToActivity(event) {
    const entityTypeMap = {
        'message.created': 'message',
        'message.updated': 'message',
        'message.deleted': 'message',
        'deployment.started': 'deployment',
        'deployment.completed': 'deployment',
        'deployment.failed': 'deployment',
        'incident.created': 'incident',
        'incident.updated': 'incident',
        'incident.resolved': 'incident',
        'ai.summary.generated': 'ai_summary',
        'ai.insight.detected': 'ai_summary',
        'workspace.created': 'workspace',
        'workspace.updated': 'workspace',
        'channel.created': 'channel',
        'channel.updated': 'channel',
        'pipeline.started': 'deployment',
        'pipeline.completed': 'deployment',
        'pipeline.failed': 'deployment',
    };
    const titleMap = {
        'message.created': 'New message',
        'message.updated': 'Message updated',
        'message.deleted': 'Message deleted',
        'deployment.started': 'Deployment started',
        'deployment.completed': 'Deployment completed',
        'deployment.failed': 'Deployment failed',
        'incident.created': 'Incident opened',
        'incident.updated': 'Incident updated',
        'incident.resolved': 'Incident resolved',
        'ai.summary.generated': 'AI summary generated',
        'ai.insight.detected': 'AI insight detected',
        'workspace.created': 'Workspace created',
        'workspace.updated': 'Workspace updated',
        'channel.created': 'Channel created',
        'channel.updated': 'Channel updated',
    };
    const eventTypeMap = {
        'message.created': 'message_created',
        'message.updated': 'message_updated',
        'message.deleted': 'message_deleted',
        'deployment.started': 'deployment_started',
        'deployment.completed': 'deployment_succeeded',
        'deployment.failed': 'deployment_failed',
        'incident.created': 'incident_opened',
        'incident.updated': 'incident_updated',
        'incident.resolved': 'incident_resolved',
        'ai.summary.generated': 'ai_summary_generated',
        'ai.insight.detected': 'ai_summary_generated',
        'workspace.created': 'workspace_created',
        'workspace.updated': 'workspace_updated',
        'channel.created': 'channel_created',
        'channel.updated': 'channel_updated',
        'pipeline.started': 'deployment_started',
        'pipeline.completed': 'deployment_succeeded',
        'pipeline.failed': 'deployment_failed',
    };
    const payload = event.payload || {};
    const metadata = {
        ...payload,
        source_app: event.source_app,
        event_version: event.event_version,
        ecosystem_event_id: event.id,
    };
    return {
        organization_id: event.organization_id,
        workspace_id: event.workspace_id,
        channel_id: event.channel_id,
        actor_id: event.triggered_by || 'system',
        entity_type: entityTypeMap[event.event_type] || 'message',
        entity_id: payload.deployment_id || payload.incident_id || payload.message_id || payload.workspace_id || payload.channel_id || event.id,
        event_type: eventTypeMap[event.event_type] || event.event_type.replace(/\./g, '_'),
        title: titleMap[event.event_type] || event.event_type,
        description: payload.error_message || payload.description || payload.content || undefined,
        metadata,
    };
}
async function writeActivityWithRetry(event, maxRetries = 3) {
    const activity = mapEventToActivity(event);
    let lastError = null;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const { error } = await database_1.supabase.from('activity_feed').insert(activity);
            if (error)
                throw new Error(`Activity insert failed: ${error.message}`);
            return;
        }
        catch (err) {
            lastError = err instanceof Error ? err : new Error(String(err));
            const delay = Math.pow(2, attempt) * 100; // 100ms, 200ms, 400ms
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }
    console.error(`[ActivityFeedHandler] Failed after ${maxRetries} retries:`, lastError?.message);
    // Dead-letter: log for future queue processing
}
function registerActivityFeedHandler() {
    const eventBus = event_bus_1.InternalEventBus.getInstance();
    eventBus.subscribeAll(async (event) => {
        await writeActivityWithRetry(event);
    });
    console.log('[ActivityFeedHandler] Registered activity feed handler');
}
//# sourceMappingURL=activity-feed.handler.js.map