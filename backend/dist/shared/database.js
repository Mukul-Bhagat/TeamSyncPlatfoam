"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
exports.createEcosystemEvent = createEcosystemEvent;
exports.getEcosystemEvents = getEcosystemEvents;
exports.getIntegrationConfig = getIntegrationConfig;
exports.listIntegrationConfigs = listIntegrationConfigs;
exports.createIntegrationConfig = createIntegrationConfig;
exports.updateIntegrationConfig = updateIntegrationConfig;
exports.updateIntegrationHealth = updateIntegrationHealth;
const supabase_js_1 = require("@supabase/supabase-js");
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
if (!supabaseUrl || !supabaseKey) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
}
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
async function createEcosystemEvent(data) {
    const { data: event, error } = await exports.supabase
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
async function getEcosystemEvents(filters) {
    let query = exports.supabase
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
async function getIntegrationConfig(organizationId, integrationName) {
    const { data, error } = await exports.supabase
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
async function listIntegrationConfigs(organizationId) {
    const { data, error } = await exports.supabase
        .from('integration_configs')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });
    if (error) {
        throw new Error(`Failed to list integration configs: ${error.message}`);
    }
    return data;
}
async function createIntegrationConfig(data) {
    const { data: config, error } = await exports.supabase
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
async function updateIntegrationConfig(id, data) {
    const { data: config, error } = await exports.supabase
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
async function updateIntegrationHealth(id, healthStatus) {
    const { data: config, error } = await exports.supabase
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
//# sourceMappingURL=database.js.map