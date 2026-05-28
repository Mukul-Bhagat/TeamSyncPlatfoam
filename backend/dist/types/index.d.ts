export type EventSeverity = 'info' | 'warning' | 'critical' | 'warn';
export interface EcosystemEvent {
    id: string;
    source_app: string;
    organization_id: string;
    workspace_id?: string;
    channel_id?: string;
    event_type: string;
    event_version: string;
    payload: Record<string, unknown>;
    metadata: Record<string, unknown>;
    severity: EventSeverity;
    correlation_id?: string;
    triggered_by?: string;
    created_at: string;
    processed_at?: string;
}
export interface IntegrationConfig {
    id: string;
    organization_id: string;
    integration_name: string;
    enabled: boolean;
    config: Record<string, unknown>;
    secrets_reference?: string;
    webhook_url?: string;
    webhook_secret?: string;
    api_key?: string;
    health_status: 'unknown' | 'healthy' | 'degraded' | 'unhealthy';
    last_heartbeat?: string;
    created_at: string;
    updated_at: string;
}
export interface WebhookPayload {
    event_type: string;
    event_version: string;
    timestamp: string;
    data: Record<string, unknown>;
    signature?: string;
}
export interface EventHandler {
    (event: EcosystemEvent): Promise<void> | void;
}
export interface NormalizedEvent {
    source_app: string;
    event_type: string;
    event_version: string;
    payload: Record<string, unknown>;
    metadata: Record<string, unknown>;
    correlation_id?: string;
}
//# sourceMappingURL=index.d.ts.map