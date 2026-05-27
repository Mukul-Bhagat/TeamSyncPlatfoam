export const ActivityEventType = {
  MESSAGE_CREATED: 'message_created',
  MESSAGE_UPDATED: 'message_updated',
  MESSAGE_DELETED: 'message_deleted',
  DEPLOYMENT_STARTED: 'deployment_started',
  DEPLOYMENT_SUCCEEDED: 'deployment_succeeded',
  DEPLOYMENT_FAILED: 'deployment_failed',
  INCIDENT_OPENED: 'incident_opened',
  INCIDENT_UPDATED: 'incident_updated',
  INCIDENT_RESOLVED: 'incident_resolved',
  AI_SUMMARY_GENERATED: 'ai_summary_generated',
  WORKSPACE_CREATED: 'workspace_created',
  WORKSPACE_UPDATED: 'workspace_updated',
  CHANNEL_CREATED: 'channel_created',
  CHANNEL_UPDATED: 'channel_updated',
  USER_JOINED_WORKSPACE: 'user_joined_workspace',
  USER_LEFT_WORKSPACE: 'user_left_workspace',
} as const;

export type ActivityEventType = (typeof ActivityEventType)[keyof typeof ActivityEventType];

export const EntityType = {
  MESSAGE: 'message',
  DEPLOYMENT: 'deployment',
  INCIDENT: 'incident',
  AI_SUMMARY: 'ai_summary',
  WORKSPACE: 'workspace',
  CHANNEL: 'channel',
  USER: 'user',
} as const;

export type EntityType = (typeof EntityType)[keyof typeof EntityType];

export interface MessageActivityMetadata {
  message_id: string;
  channel_id: string;
  channel_name: string;
  message_preview: string;
  message_type: string;
}

export interface DeploymentActivityMetadata {
  deployment_id: string;
  service: string;
  environment: string;
  status: string;
  version: string;
  duration?: number;
}

export interface IncidentActivityMetadata {
  incident_id: string;
  incident_title: string;
  severity: string;
  status: string;
  affected_services: string[];
}

export interface AISummaryActivityMetadata {
  summary_id: string;
  summary_type: string;
  channel_id: string;
  channel_name: string;
  model: string;
  token_count: number;
}

export interface WorkspaceActivityMetadata {
  workspace_id: string;
  workspace_name: string;
  action: string;
}

export interface ChannelActivityMetadata {
  channel_id: string;
  channel_name: string;
  channel_type: string;
  action: string;
}

export interface UserActivityMetadata {
  user_id: string;
  user_name: string;
  action: string;
  role?: string;
}

export type ActivityMetadata =
  | MessageActivityMetadata
  | DeploymentActivityMetadata
  | IncidentActivityMetadata
  | AISummaryActivityMetadata
  | WorkspaceActivityMetadata
  | ChannelActivityMetadata
  | UserActivityMetadata;

export interface ActivityFeedEvent {
  id: string;
  organization_id?: string;
  workspace_id?: string;
  channel_id?: string;
  actor_id: string;
  actor_name?: string;
  entity_type: EntityType;
  entity_id: string;
  event_type: ActivityEventType;
  title: string;
  description?: string;
  metadata: ActivityMetadata;
  created_at: string;
}

export interface ActivityGroup {
  date: string;
  activities: ActivityFeedEvent[];
}
