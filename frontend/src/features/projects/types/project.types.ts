export const ProjectVisibility = {
  PRIVATE: 'private',
} as const;

export type ProjectVisibility =
  (typeof ProjectVisibility)[keyof typeof ProjectVisibility];

export const ProjectStatus = {
  PLANNING: 'planning',
  ACTIVE: 'active',
  ON_HOLD: 'on_hold',
  COMPLETED: 'completed',
  ARCHIVED: 'archived',
} as const;

export type ProjectStatus = (typeof ProjectStatus)[keyof typeof ProjectStatus];

export const ProjectRole = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MANAGER: 'manager',
  LEAD: 'lead',
  DEVELOPER: 'developer',
  VIEWER: 'viewer',
  GUEST: 'guest',
} as const;

export type ProjectRole = (typeof ProjectRole)[keyof typeof ProjectRole];

export const ProjectMemberStatus = {
  INVITED: 'invited',
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  REMOVED: 'removed',
} as const;

export type ProjectMemberStatus =
  (typeof ProjectMemberStatus)[keyof typeof ProjectMemberStatus];

export const ProjectInvitationStatus = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
} as const;

export type ProjectInvitationStatus =
  (typeof ProjectInvitationStatus)[keyof typeof ProjectInvitationStatus];

export const PROJECT_VISIBILITY_OPTIONS = [
  {
    value: ProjectVisibility.PRIVATE,
    label: 'Private',
    description: 'Invite-only and visible only to active project members',
  },
] as const;

export const PROJECT_STATUS_OPTIONS = [
  {
    value: ProjectStatus.PLANNING,
    label: 'Planning',
  },
  {
    value: ProjectStatus.ACTIVE,
    label: 'Active',
  },
  {
    value: ProjectStatus.ON_HOLD,
    label: 'On Hold',
  },
  {
    value: ProjectStatus.COMPLETED,
    label: 'Completed',
  },
  {
    value: ProjectStatus.ARCHIVED,
    label: 'Archived',
  },
] as const;

export const PROJECT_ROLE_OPTIONS = [
  {
    value: ProjectRole.OWNER,
    label: 'Owner',
    description: 'Full control over the project and members',
  },
  {
    value: ProjectRole.ADMIN,
    label: 'Admin',
    description: 'Manage project settings and members',
  },
  {
    value: ProjectRole.MANAGER,
    label: 'Manager',
    description: 'Coordinate work and assign tasks',
  },
  {
    value: ProjectRole.LEAD,
    label: 'Lead',
    description: 'Lead a workstream or squad',
  },
  {
    value: ProjectRole.DEVELOPER,
    label: 'Developer',
    description: 'Build and collaborate on the project',
  },
  {
    value: ProjectRole.VIEWER,
    label: 'Viewer',
    description: 'Read-only access to project content',
  },
  {
    value: ProjectRole.GUEST,
    label: 'Guest',
    description: 'Limited access for collaborators',
  },
] as const;

export interface ProjectMemberProfile {
  id: string;
  full_name?: string;
  username?: string;
  avatar_url?: string;
  email?: string;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id?: string | null;
  email: string;
  role: ProjectRole;
  status: ProjectMemberStatus;
  invited_by?: string | null;
  joined_at?: string | null;
  created_at: string;
  updated_at: string;
  profiles?: ProjectMemberProfile | null;
}

export interface ProjectInvitation {
  id: string;
  project_id: string;
  email: string;
  role: ProjectRole;
  token: string;
  status: ProjectInvitationStatus;
  expires_at?: string | null;
  accepted_at?: string | null;
  invited_by?: string | null;
  created_at: string;
  updated_at: string;
  invited_by_profile?: ProjectMemberProfile | null;
}

export interface ProjectAuditLog {
  id: string;
  project_id?: string | null;
  workspace_id?: string | null;
  organization_id?: string | null;
  actor_id?: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  before_data: Record<string, unknown>;
  after_data: Record<string, unknown>;
  metadata: Record<string, unknown>;
  created_at: string;
  actor_profile?: ProjectMemberProfile | null;
}
