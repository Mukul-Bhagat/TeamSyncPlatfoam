export const NotificationPriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

export type NotificationPriority = (typeof NotificationPriority)[keyof typeof NotificationPriority];

export const NotificationType = {
  MESSAGE_MENTION: 'message_mention',
  WORKSPACE_INVITE: 'workspace_invite',
  DEPLOYMENT_ALERT: 'deployment_alert',
  INCIDENT_ALERT: 'incident_alert',
  AI_SUMMARY: 'ai_summary',
  SYSTEM_ALERT: 'system_alert',
  ACTIVITY_UPDATE: 'activity_update',
} as const;

export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];

export interface MessageMentionMetadata {
  message_id: string;
  channel_id: string;
  channel_name: string;
  sender_id: string;
  sender_name: string;
  message_preview: string;
}

export interface WorkspaceInviteMetadata {
  workspace_id: string;
  workspace_name: string;
  inviter_id: string;
  inviter_name: string;
  role: string;
}

export interface DeploymentAlertMetadata {
  deployment_id: string;
  service: string;
  environment: string;
  status: string;
  version: string;
  workspace_id: string;
  workspace_name: string;
}

export interface IncidentAlertMetadata {
  incident_id: string;
  incident_title: string;
  severity: string;
  status: string;
  workspace_id: string;
  workspace_name: string;
}

export interface AISummaryMetadata {
  summary_id: string;
  summary_type: string;
  channel_id: string;
  channel_name: string;
  model: string;
  token_count: number;
}

export interface SystemAlertMetadata {
  alert_type: string;
  severity: string;
  details: string;
}

export interface ActivityUpdateMetadata {
  activity_type: string;
  entity_type: string;
  entity_id: string;
  entity_name: string;
}

export type NotificationMetadata =
  | MessageMentionMetadata
  | WorkspaceInviteMetadata
  | DeploymentAlertMetadata
  | IncidentAlertMetadata
  | AISummaryMetadata
  | SystemAlertMetadata
  | ActivityUpdateMetadata;

export interface Notification {
  id: string;
  user_id: string;
  organization_id?: string;
  workspace_id?: string;
  channel_id?: string;
  type: NotificationType;
  title: string;
  message?: string;
  metadata: NotificationMetadata;
  priority: NotificationPriority;
  read_at?: string;
  archived_at?: string;
  created_at: string;
}

export interface NotificationGroup {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  count: number;
  title: string;
  notifications: Notification[];
  created_at: string;
}
