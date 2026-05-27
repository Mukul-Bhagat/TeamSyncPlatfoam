export type OrganizationRole = 'owner' | 'admin' | 'member';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  logo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: OrganizationRole;
  joined_at: string;
  // Joined relations
  user?: {
    id: string;
    full_name?: string;
    avatar_url?: string;
    username?: string;
  };
}

// Type for Supabase nested query response - listUserOrganizations
export interface OrganizationMemberWithOrg {
  organization_id: string;
  role: OrganizationRole;
  organizations: Organization[];
}

// Type for Supabase nested query response - listOrganizationMembers
export interface OrganizationMemberWithProfile {
  id: string;
  role: OrganizationRole;
  joined_at: string;
  user_id: string;
  profiles: {
    id: string;
    full_name?: string;
    username?: string;
    avatar_url?: string;
  }[];
}

export interface CreateOrganizationInput {
  name: string;
  slug: string;
  logo_url?: string;
}

export interface UpdateOrganizationInput {
  name?: string;
  logo_url?: string;
}

export interface AddMemberInput {
  organization_id: string;
  user_id: string;
  role: OrganizationRole;
}

export interface UpdateMemberRoleInput {
  role: OrganizationRole;
}
