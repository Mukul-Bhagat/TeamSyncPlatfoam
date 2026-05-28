import { supabase } from '../../shared/database';

export interface ContextData {
  messages?: Array<{ id: string; content: string; author: string; timestamp: string }>;
  events?: Array<{ id: string; event_type: string; payload: Record<string, unknown>; timestamp: string }>;
  incidents?: Array<{ id: string; title: string; severity: string; status: string; created_at: string }>;
  deployments?: Array<{ id: string; service: string; environment: string; status: string; created_at: string }>;
  activity?: Array<{ id: string; event_type: string; title: string; description?: string; created_at: string }>;
  workspace?: { id: string; name: string; description?: string };
  channel?: { id: string; name: string; type: string };
}

export interface ContextOptions {
  maxMessages?: number;
  maxEvents?: number;
  maxIncidents?: number;
  maxDeployments?: number;
  maxActivity?: number;
  timeRange?: string; // ISO date string for filtering
}

export class ContextEngine {
  /**
   * Build context for deployment summary
   */
  async buildDeploymentContext(deploymentId: string, options: ContextOptions = {}): Promise<ContextData> {
    const context: ContextData = {};

    // Fetch deployment details
    const { data: deployment } = await supabase
      .from('deployments')
      .select('*')
      .eq('id', deploymentId)
      .single();

    if (deployment) {
      context.deployments = [deployment];
      context.workspace = await this.getWorkspaceContext(deployment.workspace_id);
    }

    // Fetch related events
    const { data: events } = await supabase
      .from('ecosystem_events')
      .select('*')
      .eq('source_app', 'deployhub')
      .contains('payload', { deployment_id: deploymentId })
      .order('created_at', { ascending: false })
      .limit(options.maxEvents || 20);

    if (events) {
      context.events = events.map((e) => ({
        id: e.id,
        event_type: e.event_type,
        payload: e.payload as Record<string, unknown>,
        timestamp: e.created_at,
      }));
    }

    // Fetch related activity feed
    const { data: activity } = await supabase
      .from('activity_feed')
      .select('*')
      .eq('entity_id', deploymentId)
      .order('created_at', { ascending: false })
      .limit(options.maxActivity || 20);

    if (activity) {
      context.activity = activity.map((a) => ({
        id: a.id,
        event_type: a.event_type,
        title: a.title,
        description: a.description || undefined,
        created_at: a.created_at,
      }));
    }

    return context;
  }

  /**
   * Build context for incident analysis
   */
  async buildIncidentContext(incidentId: string, options: ContextOptions = {}): Promise<ContextData> {
    const context: ContextData = {};

    // Fetch incident details
    const { data: incident } = await supabase
      .from('incidents')
      .select('*')
      .eq('id', incidentId)
      .single();

    if (incident) {
      context.incidents = [incident];
      context.workspace = await this.getWorkspaceContext(incident.workspace_id);
    }

    // Fetch related messages from incident channel
    if (incident?.channel_id) {
      const { data: messages } = await supabase
        .from('messages')
        .select('id, content, user_id, created_at')
        .eq('channel_id', incident.channel_id)
        .gte('created_at', incident.created_at)
        .order('created_at', { ascending: true })
        .limit(options.maxMessages || 50);

      if (messages) {
        context.messages = messages.map((m) => ({
          id: m.id,
          content: m.content,
          author: m.user_id,
          timestamp: m.created_at,
        }));
      }
    }

    // Fetch related events
    const { data: events } = await supabase
      .from('ecosystem_events')
      .select('*')
      .eq('source_app', 'incidentos')
      .contains('payload', { incident_id: incidentId })
      .order('created_at', { ascending: false })
      .limit(options.maxEvents || 20);

    if (events) {
      context.events = events.map((e) => ({
        id: e.id,
        event_type: e.event_type,
        payload: e.payload as Record<string, unknown>,
        timestamp: e.created_at,
      }));
    }

    // Fetch related activity
    const { data: activity } = await supabase
      .from('activity_feed')
      .select('*')
      .eq('entity_id', incidentId)
      .order('created_at', { ascending: false })
      .limit(options.maxActivity || 20);

    if (activity) {
      context.activity = activity.map((a) => ({
        id: a.id,
        event_type: a.event_type,
        title: a.title,
        description: a.description || undefined,
        created_at: a.created_at,
      }));
    }

    return context;
  }

  /**
   * Build context for workspace daily digest
   */
  async buildWorkspaceDigestContext(workspaceId: string, timeRange: string, options: ContextOptions = {}): Promise<ContextData> {
    const context: ContextData = {};

    context.workspace = await this.getWorkspaceContext(workspaceId);

    // Fetch activity feed for the time range
    const { data: activity } = await supabase
      .from('activity_feed')
      .select('*')
      .eq('workspace_id', workspaceId)
      .gte('created_at', timeRange)
      .order('created_at', { ascending: false })
      .limit(options.maxActivity || 100);

    if (activity) {
      context.activity = activity.map((a) => ({
        id: a.id,
        event_type: a.event_type,
        title: a.title,
        description: a.description || undefined,
        created_at: a.created_at,
      }));
    }

    // Fetch incidents in the time range
    const { data: incidents } = await supabase
      .from('incidents')
      .select('*')
      .eq('workspace_id', workspaceId)
      .gte('created_at', timeRange)
      .order('created_at', { ascending: false })
      .limit(options.maxIncidents || 10);

    if (incidents) {
      context.incidents = incidents;
    }

    // Fetch deployments in the time range
    const { data: deployments } = await supabase
      .from('deployments')
      .select('*')
      .eq('workspace_id', workspaceId)
      .gte('created_at', timeRange)
      .order('created_at', { ascending: false })
      .limit(options.maxDeployments || 20);

    if (deployments) {
      context.deployments = deployments;
    }

    return context;
  }

  /**
   * Build context for activity digest
   */
  async buildActivityDigestContext(organizationId: string, filters: { workspace_id?: string; channel_id?: string; timeRange: string }, options: ContextOptions = {}): Promise<ContextData> {
    const context: ContextData = {};

    // Fetch activity feed
    let query = supabase
      .from('activity_feed')
      .select('*')
      .eq('organization_id', organizationId)
      .gte('created_at', filters.timeRange);

    if (filters.workspace_id) {
      query = query.eq('workspace_id', filters.workspace_id);
    }
    if (filters.channel_id) {
      query = query.eq('channel_id', filters.channel_id);
    }

    const { data: activity } = await query
      .order('created_at', { ascending: false })
      .limit(options.maxActivity || 100);

    if (activity) {
      context.activity = activity.map((a) => ({
        id: a.id,
        event_type: a.event_type,
        title: a.title,
        description: a.description || undefined,
        created_at: a.created_at,
      }));
    }

    return context;
  }

  /**
   * Helper: Get workspace context
   */
  private async getWorkspaceContext(workspaceId: string): Promise<{ id: string; name: string; description?: string } | undefined> {
    const { data: workspace } = await supabase
      .from('workspaces')
      .select('id, name, description')
      .eq('id', workspaceId)
      .single();

    return workspace || undefined;
  }

  /**
   * Format context as structured text for AI prompts
   */
  formatContextForPrompt(context: ContextData): string {
    const sections: string[] = [];

    if (context.workspace) {
      sections.push(`Workspace: ${context.workspace.name}${context.workspace.description ? ` - ${context.workspace.description}` : ''}`);
    }

    if (context.deployments && context.deployments.length > 0) {
      sections.push(`\nDeployments:\n${context.deployments.map((d) => `- ${d.service} (${d.environment}): ${d.status}`).join('\n')}`);
    }

    if (context.incidents && context.incidents.length > 0) {
      sections.push(`\nIncidents:\n${context.incidents.map((i) => `- ${i.title} (${i.severity}, ${i.status})`).join('\n')}`);
    }

    if (context.messages && context.messages.length > 0) {
      sections.push(`\nMessages:\n${context.messages.map((m) => `- [${new Date(m.timestamp).toLocaleTimeString()}] ${m.content}`).join('\n')}`);
    }

    if (context.events && context.events.length > 0) {
      sections.push(`\nEvents:\n${context.events.map((e) => `- ${e.event_type}: ${JSON.stringify(e.payload)}`).join('\n')}`);
    }

    if (context.activity && context.activity.length > 0) {
      sections.push(`\nActivity:\n${context.activity.map((a) => `- ${a.title}${a.description ? `: ${a.description}` : ''}`).join('\n')}`);
    }

    return sections.join('\n');
  }
}
