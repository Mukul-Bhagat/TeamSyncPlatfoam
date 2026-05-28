export type IntegrationName =
  | 'deployhub'
  | 'pipevista'
  | 'insightai'
  | 'incidentos'
  | 'flowboard'
  | 'devpulse'
  | 'github'
  | 'gitlab'
  | 'jenkins'
  | 'kubernetes';

export type IntegrationHealthStatus = 'unknown' | 'healthy' | 'degraded' | 'unhealthy';

export interface IntegrationConfig {
  id: string;
  organization_id: string;
  integration_name: IntegrationName | string;
  enabled: boolean;
  config: Record<string, unknown>;
  webhook_url?: string;
  webhook_secret?: string;
  api_key?: string;
  health_status: IntegrationHealthStatus;
  last_heartbeat?: string;
  created_at: string;
  updated_at: string;
}

export interface IntegrationCard {
  name: IntegrationName | string;
  displayName: string;
  description: string;
  icon: string;
  category: 'deployment' | 'ai' | 'incident' | 'analytics' | 'project' | 'devops' | 'source_control';
}

export interface WebhookConfig {
  integration_name: string;
  enabled: boolean;
  webhook_url?: string;
  health_status: IntegrationHealthStatus;
  last_heartbeat?: string;
}

export interface EcosystemEventItem {
  id: string;
  source_app: string;
  event_type: string;
  severity: 'info' | 'warning' | 'critical';
  payload: Record<string, unknown>;
  created_at: string;
  correlation_id?: string;
}
