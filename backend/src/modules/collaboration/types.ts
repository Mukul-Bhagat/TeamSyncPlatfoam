// Project Collaboration Types

export enum ProjectRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MANAGER = 'manager',
  MEMBER = 'member',
  VIEWER = 'viewer'
}

export enum ChannelType {
  GENERAL = 'general',
  ANNOUNCEMENTS = 'announcements',
  TEAM_DISCUSSION = 'team_discussion',
  FILES = 'files',
  MEETINGS = 'meetings',
  ACTIVITY = 'activity',
  CUSTOM = 'custom',
  DEPARTMENT = 'department',
  PRIVATE = 'private'
}

export enum ChannelVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private'
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  PDF = 'pdf',
  DOCUMENT = 'document',
  AUDIO = 'audio',
  VOICE_NOTE = 'voice_note',
  VIDEO = 'video',
  SPREADSHEET = 'spreadsheet',
  LINK = 'link',
  MEETING_LINK = 'meeting_link',
  SYSTEM = 'system'
}

export enum MeetingProvider {
  GOOGLE_MEET = 'google_meet',
  ZOOM = 'zoom',
  MICROSOFT_TEAMS = 'microsoft_teams',
  JITSI = 'jitsi',
  CUSTOM = 'custom'
}

export enum MeetingStatus {
  SCHEDULED = 'scheduled',
  LIVE = 'live',
  ENDED = 'ended',
  CANCELLED = 'cancelled'
}

export enum ProjectStatus {
  PLANNING = 'planning',
  ACTIVE = 'active',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  ARCHIVED = 'archived'
}

export enum ProjectVisibility {
  PRIVATE = 'private',
  INTERNAL = 'internal',
  PUBLIC = 'public'
}

export interface Project {
  id: string
  name: string
  description?: string
  owner_id: string
  team_id?: string
  status: ProjectStatus
  visibility: ProjectVisibility
  logo_url?: string
  color: string
  settings: Record<string, any>
  permissions: Record<string, any>
  created_by: string
  created_at: Date
  updated_at: Date
  archived_at?: Date
  deleted_at?: Date
}

export interface ProjectMember {
  id: string
  project_id: string
  user_id?: string
  email: string
  role: ProjectRole
  status: 'invited' | 'active' | 'suspended' | 'removed'
  invited_by?: string
  joined_at?: Date
  created_at: Date
  updated_at: Date
}

export interface ProjectChannel {
  id: string
  project_id: string
  name: string
  slug: string
  description?: string
  type: ChannelType
  visibility: ChannelVisibility
  icon?: string
  color?: string
  is_pinned: boolean
  is_muted: boolean
  created_by: string
  created_at: Date
  updated_at: Date
}

export interface ProjectChannelMember {
  id: string
  channel_id: string
  user_id: string
  role: 'admin' | 'moderator' | 'member'
  is_muted: boolean
  last_read_at?: Date
  joined_at: Date
}

export interface ProjectMessage {
  id: string
  channel_id: string
  project_id: string
  sender_id: string
  parent_message_id?: string
  thread_id?: string
  type: MessageType
  content?: string
  metadata: Record<string, any>
  is_pinned: boolean
  is_starred: boolean
  reply_count: number
  reaction_count: number
  mentioned_users: string[]
  mentioned_all: boolean
  edited_at?: Date
  deleted_at?: Date
  created_at: Date
  updated_at: Date
}

export interface MessageReaction {
  id: string
  message_id: string
  user_id: string
  emoji: string
  created_at: Date
}

export interface MessageAttachment {
  id: string
  message_id: string
  uploaded_by: string
  file_name: string
  file_type: string
  file_size: number
  file_url: string
  storage_provider: string
  storage_path?: string
  thumbnail_url?: string
  metadata: Record<string, any>
  created_at: Date
}

export interface ProjectFile {
  id: string
  project_id: string
  folder_id?: string
  uploaded_by: string
  file_name: string
  file_type: string
  file_size: number
  file_url: string
  storage_provider: string
  storage_path?: string
  thumbnail_url?: string
  version: number
  is_folder: boolean
  metadata: Record<string, any>
  download_count: number
  created_at: Date
  updated_at: Date
  deleted_at?: Date
}

export interface ProjectMeeting {
  id: string
  project_id: string
  title: string
  description?: string
  meeting_link?: string
  meeting_provider: MeetingProvider
  provider_meeting_id?: string
  status: MeetingStatus
  scheduled_start: Date
  scheduled_end?: Date
  actual_start?: Date
  actual_end?: Date
  organizer_id: string
  agenda?: string
  notes?: string
  recording_url?: string
  metadata: Record<string, any>
  created_at: Date
  updated_at: Date
}

export interface MeetingParticipant {
  id: string
  meeting_id: string
  user_id: string
  joined_at?: Date
  left_at?: Date
  status: 'invited' | 'accepted' | 'declined' | 'joined' | 'left'
}

export interface ProjectActivityLog {
  id: string
  project_id: string
  user_id?: string
  action: string
  entity_type: string
  entity_id?: string
  before_data: Record<string, any>
  after_data: Record<string, any>
  metadata: Record<string, any>
  created_at: Date
}

export interface ProjectSettings {
  project_id: string
  key: string
  value: Record<string, any>
  updated_by?: string
  updated_at: Date
}

export interface PaginationParams {
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    total_pages: number
  }
}

export interface CreateProjectDto {
  name: string
  description?: string
  team_id?: string
  visibility?: ProjectVisibility
  color?: string
  logo_url?: string
}

export interface UpdateProjectDto {
  name?: string
  description?: string
  visibility?: ProjectVisibility
  color?: string
  logo_url?: string
  settings?: Record<string, any>
}

export interface CreateChannelDto {
  name: string
  slug: string
  description?: string
  type?: ChannelType
  visibility?: ChannelVisibility
  icon?: string
  color?: string
}

export interface UpdateChannelDto {
  name?: string
  description?: string
  visibility?: ChannelVisibility
  icon?: string
  color?: string
  is_pinned?: boolean
}

export interface CreateMessageDto {
  type: MessageType
  content?: string
  parent_message_id?: string
  thread_id?: string
  mentioned_users?: string[]
  mentioned_all?: boolean
  attachments?: Omit<MessageAttachment, 'id' | 'message_id' | 'created_at'>[]
}

export interface UpdateMessageDto {
  content?: string
}

export interface CreateMeetingDto {
  title: string
  description?: string
  meeting_provider?: MeetingProvider
  scheduled_start: Date
  scheduled_end?: Date
  agenda?: string
}

export interface UpdateMeetingDto {
  title?: string
  description?: string
  scheduled_start?: Date
  scheduled_end?: Date
  agenda?: string
  notes?: string
}
