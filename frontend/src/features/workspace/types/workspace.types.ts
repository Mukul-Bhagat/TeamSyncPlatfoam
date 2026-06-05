export type WorkspaceRole =
  | 'owner'
  | 'admin'
  | 'manager'
  | 'lead'
  | 'developer'
  | 'viewer'
  | 'guest';

export interface Workspace {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: WorkspaceRole;
  status: 'active' | 'suspended';
  joined_at: string;
  // Joined relations
  user?: {
    id: string;
    full_name?: string;
    avatar_url?: string;
    username?: string;
  };
}

// Type for Supabase nested query response - listWorkspaceMembers
export interface WorkspaceMemberWithProfile {
  id: string;
  role: WorkspaceRole;
  status: 'active' | 'suspended';
  joined_at: string;
  user_id: string;
  profiles: {
    id: string;
    full_name?: string;
    username?: string;
    avatar_url?: string;
  };
}

export interface CreateWorkspaceInput {
  organization_id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
}

export interface UpdateWorkspaceInput {
  name?: string;
  description?: string;
  icon?: string;
}

export interface AddWorkspaceMemberInput {
  workspace_id: string;
  user_id: string;
  role: WorkspaceRole;
}

export interface UpdateWorkspaceMemberRoleInput {
  role: WorkspaceRole;
}
