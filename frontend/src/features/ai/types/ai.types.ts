export type SummaryType = 'deployment' | 'incident' | 'workspace_daily' | 'activity_digest' | 'unread_summary';
export type InsightType = 'anomaly_detected' | 'deployment_risk' | 'incident_pattern' | 'activity_spike';
export type Severity = 'info' | 'warning' | 'critical';

export interface AISummary {
  id: string;
  organization_id: string;
  workspace_id?: string;
  channel_id?: string;
  summary_type: SummaryType;
  source_entity_type: string;
  source_entity_id: string;
  title: string;
  content: string;
  metadata: Record<string, unknown>;
  generated_by: string;
  created_at: string;
}

export interface AIInsight {
  id: string;
  organization_id: string;
  workspace_id?: string;
  insight_type: InsightType;
  severity: Severity;
  title: string;
  description: string;
  metadata: Record<string, unknown>;
  source_event_ids: string[];
  created_at: string;
}

export interface CreateSummaryRequest {
  summary_type: SummaryType;
  source_entity_type: string;
  source_entity_id: string;
  organization_id: string;
  workspace_id?: string;
  channel_id?: string;
  metadata?: Record<string, unknown>;
}

export interface GenerateAnalysisRequest {
  entity_type: 'deployment' | 'incident' | 'workspace';
  entity_id: string;
  organization_id: string;
  workspace_id?: string;
  channel_id?: string;
}

export interface AnalysisResult {
  summary?: AISummary;
  insights?: AIInsight[];
}
