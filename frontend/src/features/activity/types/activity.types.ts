export const ActivityEventType = {
  MESSAGE_CREATED: 'message_created',
  MESSAGE_UPDATED: 'message_updated',
  MESSAGE_DELETED: 'message_deleted',
  MESSAGE_PINNED: 'message_pinned',
  MESSAGE_UNPINNED: 'message_unpinned',
  MESSAGE_BOOKMARKED: 'message_bookmarked',
  MESSAGE_UNBOOKMARKED: 'message_unbookmarked',
  DEPLOYMENT_STARTED: 'deployment_started',
  DEPLOYMENT_SUCCEEDED: 'deployment_succeeded',
  DEPLOYMENT_FAILED: 'deployment_failed',
  INCIDENT_OPENED: 'incident_opened',
  INCIDENT_UPDATED: 'incident_updated',
  INCIDENT_RESOLVED: 'incident_resolved',
  AI_SUMMARY_GENERATED: 'ai_summary_generated',
  PROJECT_CREATED: 'project_created',
  PROJECT_UPDATED: 'project_updated',
  PROJECT_DELETED: 'project_deleted',
  PROJECT_FEED_POST_CREATED: 'project_feed_post_created',
  PROJECT_FEED_POST_UPDATED: 'project_feed_post_updated',
  PROJECT_FEED_POST_DELETED: 'project_feed_post_deleted',
  ORGANIZATION_CREATED: 'organization_created',
  ORGANIZATION_UPDATED: 'organization_updated',
  ORGANIZATION_DELETED: 'organization_deleted',
  WORKSPACE_CREATED: 'workspace_created',
  WORKSPACE_UPDATED: 'workspace_updated',
  CHANNEL_CREATED: 'channel_created',
  CHANNEL_UPDATED: 'channel_updated',
  USER_JOINED_WORKSPACE: 'user_joined_workspace',
  USER_LEFT_WORKSPACE: 'user_left_workspace',
  MEMBER_INVITED: 'member_invited',
  MEMBER_ROLE_UPDATED: 'member_role_updated',
  MEMBER_SUSPENDED: 'member_suspended',
  MEMBER_REACTIVATED: 'member_reactivated',
  MEMBER_REMOVED: 'member_removed',
  INVITATION_ACCEPTED: 'invitation_accepted',
} as const;

export type ActivityEventType = (typeof ActivityEventType)[keyof typeof ActivityEventType];

export const EntityType = {
  MESSAGE: 'message',
  DEPLOYMENT: 'deployment',
  INCIDENT: 'incident',
  AI_SUMMARY: 'ai_summary',
  ORGANIZATION: 'organization',
  WORKSPACE: 'workspace',
  CHANNEL: 'channel',
  PROJECT: 'project',
  INVITATION: 'invitation',
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

export interface ProjectActivityMetadata {
  project_id: string;
  project_name: string;
  action: string;
  workspace_id?: string;
  workspace_name?: string;
  user_id?: string;
  user_name?: string;
  role?: string;
  status?: string;
  previous_owner_id?: string;
  new_owner_id?: string;
}

export interface ChannelActivityMetadata {
  channel_id: string;
  channel_name: string;
  channel_type: string;
  action: string;
}

export interface InvitationActivityMetadata {
  invitation_id: string;
  invitee_email: string;
  scope_type: 'organization' | 'workspace' | 'channel';
  scope_id: string;
  role: string;
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
  | ProjectActivityMetadata
  | ChannelActivityMetadata
  | InvitationActivityMetadata
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
