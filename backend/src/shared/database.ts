import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function createEcosystemEvent(data: {
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
}) {
  const { data: event, error } = await supabase
    .from('ecosystem_events')
    .insert({
      ...data,
      event_version: data.event_version || '1.0',
      severity: data.severity || 'info',
      metadata: data.metadata || {},
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create ecosystem event: ${error.message}`);
  }

  return event;
}

export async function getEcosystemEvents(filters: {
  organization_id?: string;
  workspace_id?: string;
  channel_id?: string;
  source_app?: string;
  event_type?: string;
  severity?: string;
  limit?: number;
  offset?: number;
}) {
  let query = supabase
    .from('ecosystem_events')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters.organization_id) {
    query = query.eq('organization_id', filters.organization_id);
  }
  if (filters.workspace_id) {
    query = query.eq('workspace_id', filters.workspace_id);
  }
  if (filters.channel_id) {
    query = query.eq('channel_id', filters.channel_id);
  }
  if (filters.source_app) {
    query = query.eq('source_app', filters.source_app);
  }
  if (filters.event_type) {
    query = query.eq('event_type', filters.event_type);
  }
  if (filters.severity) {
    query = query.eq('severity', filters.severity);
  }
  if (filters.limit) {
    query = query.limit(filters.limit);
  }
  if (filters.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch ecosystem events: ${error.message}`);
  }

  return data;
}

export async function getIntegrationConfig(organizationId: string, integrationName: string) {
  const { data, error } = await supabase
    .from('integration_configs')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('integration_name', integrationName)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to fetch integration config: ${error.message}`);
  }

  return data;
}

export async function listIntegrationConfigs(organizationId: string) {
  const { data, error } = await supabase
    .from('integration_configs')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to list integration configs: ${error.message}`);
  }

  return data;
}

export async function createIntegrationConfig(data: {
  organization_id: string;
  integration_name: string;
  enabled?: boolean;
  config?: Record<string, unknown>;
  webhook_url?: string;
  webhook_secret?: string;
  api_key?: string;
}) {
  const { data: config, error } = await supabase
    .from('integration_configs')
    .insert({
      ...data,
      enabled: data.enabled !== undefined ? data.enabled : true,
      config: data.config || {},
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create integration config: ${error.message}`);
  }

  return config;
}

export async function updateIntegrationConfig(
  id: string,
  data: {
    enabled?: boolean;
    config?: Record<string, unknown>;
    webhook_url?: string;
    webhook_secret?: string;
    api_key?: string;
    health_status?: string;
  }
) {
  const { data: config, error } = await supabase
    .from('integration_configs')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update integration config: ${error.message}`);
  }

  return config;
}

export async function updateIntegrationHealth(
  id: string,
  healthStatus: 'unknown' | 'healthy' | 'degraded' | 'unhealthy'
) {
  const { data: config, error } = await supabase
    .from('integration_configs')
    .update({
      health_status: healthStatus,
      last_heartbeat: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update integration health: ${error.message}`);
  }

  return config;
}
