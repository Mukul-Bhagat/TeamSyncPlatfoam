// Shared types between frontend and backend

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
