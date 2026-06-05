export const ChannelType = {
  TEXT: 'text',
  VOICE: 'voice',
  ANNOUNCEMENT: 'announcement',
  INCIDENT: 'incident',
  DEPLOYMENT: 'deployment',
  AI: 'ai',
  ACTIVITY_FEED: 'activity_feed',
} as const;

export type ChannelType = (typeof ChannelType)[keyof typeof ChannelType];

export const ChannelVisibility = {
  PUBLIC: 'public',
  PRIVATE: 'private',
} as const;

export type ChannelVisibility = (typeof ChannelVisibility)[keyof typeof ChannelVisibility];

export const ChannelRole = {
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  MEMBER: 'member',
} as const;

export type ChannelRole = (typeof ChannelRole)[keyof typeof ChannelRole];

export interface Channel {
  id: string;
  workspace_id: string;
  name: string;
  slug: string;
  description?: string;
  type: ChannelType;
  visibility: ChannelVisibility;
  icon?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ChannelMember {
  id: string;
  channel_id: string;
  user_id: string;
  role: ChannelRole;
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

// Type for Supabase nested query response - listChannelMembers
export interface ChannelMemberWithProfile {
  id: string;
  role: ChannelRole;
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

export interface CreateChannelInput {
  workspace_id: string;
  name: string;
  slug: string;
  description?: string;
  type: ChannelType;
  visibility: ChannelVisibility;
  icon?: string;
}

export interface UpdateChannelInput {
  name?: string;
  description?: string;
  icon?: string;
}

export interface AddChannelMemberInput {
  channel_id: string;
  user_id: string;
  role: ChannelRole;
}

export interface UpdateChannelMemberRoleInput {
  role: ChannelRole;
}
