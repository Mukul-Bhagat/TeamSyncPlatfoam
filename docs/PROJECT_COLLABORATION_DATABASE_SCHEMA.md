# Project Collaboration Module - Database Schema Design

## Overview

This document defines the complete database schema for the Project Collaboration Module. The schema extends the existing TeamSync infrastructure to support project-centric collaboration while maintaining compatibility with the current workspace-based architecture.

## Core Principles

1. **Project-Centric**: Every project has its own dedicated collaboration workspace
2. **Immutable Audit Logs**: All actions are logged and never deleted
3. **Soft Deletes**: Messages and files are soft-deleted for compliance
4. **Row Level Security**: All tables use RLS for multi-tenant security
5. **Scalability**: Optimized indexes for high-performance queries
6. **Future-Proof**: Abstracted storage layer for AWS migration

## Schema Changes

### 1. Extend Projects Table

```sql
-- Add collaboration-specific columns to projects
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
```

### 2. Project Channels (Project-Specific)

```sql
CREATE TABLE IF NOT EXISTS public.project_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('general', 'announcements', 'team_discussion', 'files', 'meetings', 'activity', 'custom', 'department', 'private')),
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
  icon TEXT,
  color TEXT,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_muted BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT project_channels_project_slug_unique UNIQUE (project_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_project_channels_project_id ON public.project_channels(project_id);
CREATE INDEX IF NOT EXISTS idx_project_channels_type ON public.project_channels(type);
CREATE INDEX IF NOT EXISTS idx_project_channels_visibility ON public.project_channels(visibility);
```

### 3. Project Channel Members

```sql
CREATE TABLE IF NOT EXISTS public.project_channel_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES public.project_channels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'moderator', 'member')),
  is_muted BOOLEAN DEFAULT FALSE,
  last_read_at TIMESTAMP WITH TIME ZONE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT project_channel_members_unique UNIQUE (channel_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_project_channel_members_channel_id ON public.project_channel_members(channel_id);
CREATE INDEX IF NOT EXISTS idx_project_channel_members_user_id ON public.project_channel_members(user_id);
```

### 4. Project Messages

```sql
CREATE TABLE IF NOT EXISTS public.project_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES public.project_channels(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
  parent_message_id UUID REFERENCES public.project_messages(id) ON DELETE CASCADE,
  thread_id UUID REFERENCES public.project_messages(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('text', 'image', 'pdf', 'document', 'audio', 'voice_note', 'video', 'spreadsheet', 'link', 'meeting_link', 'system')),
  content TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_starred BOOLEAN DEFAULT FALSE,
  reply_count INTEGER DEFAULT 0,
  reaction_count INTEGER DEFAULT 0,
  mentioned_users UUID[] DEFAULT ARRAY[]::UUID[],
  mentioned_all BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_project_messages_channel_id ON public.project_messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_project_messages_project_id ON public.project_messages(project_id);
CREATE INDEX IF NOT EXISTS idx_project_messages_sender_id ON public.project_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_project_messages_parent_message_id ON public.project_messages(parent_message_id);
CREATE INDEX IF NOT EXISTS idx_project_messages_thread_id ON public.project_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_project_messages_created_at ON public.project_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_messages_type ON public.project_messages(type);
CREATE INDEX IF NOT EXISTS idx_project_messages_is_pinned ON public.project_messages(is_pinned);
CREATE INDEX IF NOT EXISTS idx_project_messages_is_starred ON public.project_messages(is_starred);
CREATE INDEX IF NOT EXISTS idx_project_messages_mentioned_users ON public.project_messages USING GIN(mentioned_users);
CREATE INDEX IF NOT EXISTS idx_project_messages_deleted_at ON public.project_messages(deleted_at);
```

### 5. Message Reactions

```sql
CREATE TABLE IF NOT EXISTS public.project_message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.project_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT project_message_reactions_unique UNIQUE (message_id, user_id, emoji)
);

CREATE INDEX IF NOT EXISTS idx_project_message_reactions_message_id ON public.project_message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_project_message_reactions_user_id ON public.project_message_reactions(user_id);
```

### 6. Message Attachments

```sql
CREATE TABLE IF NOT EXISTS public.project_message_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.project_messages(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_url TEXT NOT NULL,
  storage_provider TEXT NOT NULL DEFAULT 'supabase',
  storage_path TEXT,
  thumbnail_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_project_message_attachments_message_id ON public.project_message_attachments(message_id);
CREATE INDEX IF NOT EXISTS idx_project_message_attachments_uploaded_by ON public.project_message_attachments(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_project_message_attachments_file_type ON public.project_message_attachments(file_type);
```

### 7. Project Files

```sql
CREATE TABLE IF NOT EXISTS public.project_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES public.project_files(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_url TEXT NOT NULL,
  storage_provider TEXT NOT NULL DEFAULT 'supabase',
  storage_path TEXT,
  thumbnail_url TEXT,
  version INTEGER DEFAULT 1,
  is_folder BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::jsonb,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_project_files_project_id ON public.project_files(project_id);
CREATE INDEX IF NOT EXISTS idx_project_files_folder_id ON public.project_files(folder_id);
CREATE INDEX IF NOT EXISTS idx_project_files_uploaded_by ON public.project_files(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_project_files_file_type ON public.project_files(file_type);
CREATE INDEX IF NOT EXISTS idx_project_files_is_folder ON public.project_files(is_folder);
CREATE INDEX IF NOT EXISTS idx_project_files_deleted_at ON public.project_files(deleted_at);
```

### 8. File Versions

```sql
CREATE TABLE IF NOT EXISTS public.project_file_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES public.project_files(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  change_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT project_file_versions_file_version_unique UNIQUE (file_id, version)
);

CREATE INDEX IF NOT EXISTS idx_project_file_versions_file_id ON public.project_file_versions(file_id);
```

### 9. Project Meetings

```sql
CREATE TABLE IF NOT EXISTS public.project_meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  meeting_link TEXT,
  meeting_provider TEXT NOT NULL DEFAULT 'google_meet' CHECK (meeting_provider IN ('google_meet', 'zoom', 'microsoft_teams', 'jitsi', 'custom')),
  provider_meeting_id TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'ended', 'cancelled')),
  scheduled_start TIMESTAMP WITH TIME ZONE NOT NULL,
  scheduled_end TIMESTAMP WITH TIME ZONE,
  actual_start TIMESTAMP WITH TIME ZONE,
  actual_end TIMESTAMP WITH TIME ZONE,
  organizer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  agenda TEXT,
  notes TEXT,
  recording_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_project_meetings_project_id ON public.project_meetings(project_id);
CREATE INDEX IF NOT EXISTS idx_project_meetings_status ON public.project_meetings(status);
CREATE INDEX IF NOT EXISTS idx_project_meetings_scheduled_start ON public.project_meetings(scheduled_start);
CREATE INDEX IF NOT EXISTS idx_project_meetings_organizer_id ON public.project_meetings(organizer_id);
```

### 10. Meeting Participants

```sql
CREATE TABLE IF NOT EXISTS public.project_meeting_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES public.project_meetings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE,
  left_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'accepted', 'declined', 'joined', 'left')),
  CONSTRAINT project_meeting_participants_unique UNIQUE (meeting_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_project_meeting_participants_meeting_id ON public.project_meeting_participants(meeting_id);
CREATE INDEX IF NOT EXISTS idx_project_meeting_participants_user_id ON public.project_meeting_participants(user_id);
```

### 11. Project Activity Logs

```sql
CREATE TABLE IF NOT EXISTS public.project_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  before_data JSONB DEFAULT '{}'::jsonb,
  after_data JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_project_activity_logs_project_id ON public.project_activity_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_project_activity_logs_user_id ON public.project_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_project_activity_logs_action ON public.project_activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_project_activity_logs_entity_type ON public.project_activity_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_project_activity_logs_created_at ON public.project_activity_logs(created_at DESC);
```

### 12. Typing Indicators

```sql
CREATE TABLE IF NOT EXISTS public.project_typing_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES public.project_channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_typed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT project_typing_indicators_unique UNIQUE (channel_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_project_typing_indicators_channel_id ON public.project_typing_indicators(channel_id);
```

### 13. Read Receipts

```sql
CREATE TABLE IF NOT EXISTS public.project_read_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.project_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  read_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT project_read_receipts_unique UNIQUE (message_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_project_read_receipts_message_id ON public.project_read_receipts(message_id);
CREATE INDEX IF NOT EXISTS idx_project_read_receipts_user_id ON public.project_read_receipts(user_id);
```

### 14. Message Reports (Compliance)

```sql
CREATE TABLE IF NOT EXISTS public.project_message_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.project_messages(id) ON DELETE CASCADE,
  reported_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_project_message_reports_message_id ON public.project_message_reports(message_id);
CREATE INDEX IF NOT EXISTS idx_project_message_reports_reported_by ON public.project_message_reports(reported_by);
CREATE INDEX IF NOT EXISTS idx_project_message_reports_status ON public.project_message_reports(status);
```

### 15. Project Settings

```sql
CREATE TABLE IF NOT EXISTS public.project_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT project_settings_project_key_unique UNIQUE (project_id, key)
);

CREATE INDEX IF NOT EXISTS idx_project_settings_project_id ON public.project_settings(project_id);
CREATE INDEX IF NOT EXISTS idx_project_settings_key ON public.project_settings(key);
```

## Row Level Security Policies

All tables will have comprehensive RLS policies based on project membership roles:

### Role-Based Access Control

- **Owner**: Full access to all project resources
- **Admin**: Can manage users, channels, meetings, files
- **Manager**: Can manage tasks, discussions, planning
- **Member**: Can participate in project activities
- **Viewer**: Read-only access to project resources

### Policy Pattern

```sql
-- Example policy pattern
CREATE POLICY "Project owners and admins can {action}" ON public.{table}
  FOR {action_type} USING (
    EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = {table}.project_id
        AND pm.user_id = auth.uid()
        AND pm.status = 'active'
        AND pm.role IN ('owner', 'admin')
    )
  );
```

## Performance Optimizations

### Indexes

- All foreign keys have indexes
- Frequently queried columns (project_id, channel_id, user_id, created_at) have indexes
- JSONB fields use GIN indexes for efficient querying
- Composite indexes for common query patterns

### Partitioning (Future)

- Consider partitioning project_messages by created_at for large projects
- Consider partitioning audit_logs by created_at for compliance retention

### Caching Strategy

- Use materialized views for dashboard statistics
- Use PostgreSQL's built-in query cache
- Implement application-level caching for frequently accessed data

## Migration Strategy

### Phase 1: Core Tables
- Extend projects table
- Create project_channels
- Create project_channel_members
- Create project_messages

### Phase 2: Message Features
- Create message_reactions
- Create message_attachments
- Create typing_indicators
- Create read_receipts

### Phase 3: File Management
- Create project_files
- Create file_versions

### Phase 4: Meetings
- Create project_meetings
- Create meeting_participants

### Phase 5: Compliance & Settings
- Create activity_logs
- Create message_reports
- Create project_settings

## Data Integrity

### Constraints

- All foreign keys have ON DELETE CASCADE or SET NULL
- Unique constraints prevent duplicate data
- CHECK constraints ensure valid enum values
- NOT NULL constraints on required fields

### Triggers

- updated_at triggers on all tables
- Soft delete triggers for compliance
- Activity log triggers for audit trails

## Future AWS Migration

### Storage Abstraction

The `storage_provider` column in files and attachments allows easy migration:

- Current: `supabase`
- Future: `aws_s3`, `google_cloud_storage`, `azure_blob`

### Migration Path

1. Add new storage provider
2. Migrate existing files in background
3. Update storage_provider column
4. Update application to use new provider

## Compliance Features

### Immutable Audit Logs

- activity_logs table never allows deletes
- All actions are logged with before/after data
- Timestamps for all events

### Soft Deletes

- Messages have deleted_at instead of hard delete
- Files have deleted_at instead of hard delete
- Original data retained for compliance

### Message Reporting

- Users can report inappropriate messages
- Admin review workflow
- Resolution tracking

## Security Considerations

### RLS Policies

- All tables have RLS enabled
- Policies based on project membership
- Role-based access control
- No direct table access, only through policies

### Sensitive Data

- API keys stored in encrypted format
- Meeting provider tokens encrypted
- File access URLs have expiration

### Rate Limiting

- Application-level rate limiting
- Database connection pooling
- Query timeout limits
