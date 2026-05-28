export declare const supabase: import("@supabase/supabase-js").SupabaseClient<any, "public", "public", any, any>;
export declare function createEcosystemEvent(data: {
    source_app: string;
    organization_id: string;
    workspace_id?: string;
    channel_id?: string;
    event_type: string;
    event_version?: string;
    payload: Record<string, unknown>;
    metadata?: Record<string, unknown>;
    severity?: string;
    correlation_id?: string;
    triggered_by?: string;
}): Promise<any>;
export declare function getEcosystemEvents(filters: {
    organization_id?: string;
    workspace_id?: string;
    channel_id?: string;
    source_app?: string;
    event_type?: string;
    severity?: string;
    limit?: number;
    offset?: number;
}): Promise<any[]>;
export declare function getIntegrationConfig(organizationId: string, integrationName: string): Promise<any>;
export declare function listIntegrationConfigs(organizationId: string): Promise<any[]>;
export declare function createIntegrationConfig(data: {
    organization_id: string;
    integration_name: string;
    enabled?: boolean;
    config?: Record<string, unknown>;
    webhook_url?: string;
    webhook_secret?: string;
    api_key?: string;
}): Promise<any>;
export declare function updateIntegrationConfig(id: string, data: {
    enabled?: boolean;
    config?: Record<string, unknown>;
    webhook_url?: string;
    webhook_secret?: string;
    api_key?: string;
    health_status?: string;
}): Promise<any>;
export declare function updateIntegrationHealth(id: string, healthStatus: 'unknown' | 'healthy' | 'degraded' | 'unhealthy'): Promise<any>;
//# sourceMappingURL=database.d.ts.map