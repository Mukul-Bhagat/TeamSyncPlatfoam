-- ============================================
-- PROJECT COLLABORATION MODULE - PHASE 1
-- Core Tables: Projects Extension, Channels, Members, Messages
-- ============================================

-- Extend projects table with collaboration-specific columns
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- ============================================
-- PROJECT CHANNELS TABLE
-- ============================================

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

-- Indexes for project_channels
CREATE INDEX IF NOT EXISTS idx_project_channels_project_id ON public.project_channels(project_id);
CREATE INDEX IF NOT EXISTS idx_project_channels_type ON public.project_channels(type);
CREATE INDEX IF NOT EXISTS idx_project_channels_visibility ON public.project_channels(visibility);
CREATE INDEX IF NOT EXISTS idx_project_channels_slug ON public.project_channels(slug);

-- ============================================
-- PROJECT CHANNEL MEMBERS TABLE
-- ============================================

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

-- Indexes for project_channel_members
CREATE INDEX IF NOT EXISTS idx_project_channel_members_channel_id ON public.project_channel_members(channel_id);
CREATE INDEX IF NOT EXISTS idx_project_channel_members_user_id ON public.project_channel_members(user_id);

-- ============================================
-- PROJECT MESSAGES TABLE
-- ============================================

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

-- Indexes for project_messages
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

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.project_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_messages ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES FOR PROJECT CHANNELS
-- ============================================

-- Users can view channels in their projects
CREATE POLICY "Users can view project channels" ON public.project_channels
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = project_channels.project_id
        AND pm.user_id = auth.uid()
        AND pm.status = 'active'
    )
  );

-- Project owners and admins can create channels
CREATE POLICY "Project owners and admins can create channels" ON public.project_channels
  FOR INSERT WITH CHECK (
    auth.uid() = created_by
    AND EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = project_channels.project_id
        AND pm.user_id = auth.uid()
        AND pm.status = 'active'
        AND pm.role IN ('owner', 'admin')
    )
  );

-- Channel creators and admins can update channels
CREATE POLICY "Channel creators and admins can update" ON public.project_channels
  FOR UPDATE USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = project_channels.project_id
        AND pm.user_id = auth.uid()
        AND pm.status = 'active'
        AND pm.role IN ('owner', 'admin')
    )
  );

-- Channel creators and admins can delete channels
CREATE POLICY "Channel creators and admins can delete" ON public.project_channels
  FOR DELETE USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = project_channels.project_id
        AND pm.user_id = auth.uid()
        AND pm.status = 'active'
        AND pm.role IN ('owner', 'admin')
    )
  );

-- ============================================
-- RLS POLICIES FOR PROJECT CHANNEL MEMBERS
-- ============================================

-- Users can view channel memberships in their projects
CREATE POLICY "Users can view channel memberships" ON public.project_channel_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = (
        SELECT pc.project_id FROM public.project_channels pc
        WHERE pc.id = project_channel_members.channel_id
      )
        AND pm.user_id = auth.uid()
        AND pm.status = 'active'
    )
  );

-- Channel admins can add members
CREATE POLICY "Channel admins can add members" ON public.project_channel_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.project_channel_members pcm
      WHERE pcm.channel_id = project_channel_members.channel_id
        AND pcm.user_id = auth.uid()
        AND pcm.role IN ('admin')
    )
  );

-- Channel admins can update member roles
CREATE POLICY "Channel admins can update roles" ON public.project_channel_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.project_channel_members pcm
      WHERE pcm.channel_id = project_channel_members.channel_id
        AND pcm.user_id = auth.uid()
        AND pcm.role IN ('admin')
    )
  );

-- Channel admins can remove members
CREATE POLICY "Channel admins can remove members" ON public.project_channel_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.project_channel_members pcm
      WHERE pcm.channel_id = project_channel_members.channel_id
        AND pcm.user_id = auth.uid()
        AND pcm.role IN ('admin')
    )
  );

-- ============================================
-- RLS POLICIES FOR PROJECT MESSAGES
-- ============================================

-- Users can view messages in their project channels
CREATE POLICY "Users can view project messages" ON public.project_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = project_messages.project_id
        AND pm.user_id = auth.uid()
        AND pm.status = 'active'
    )
    AND deleted_at IS NULL
  );

-- Project members can create messages
CREATE POLICY "Project members can create messages" ON public.project_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = project_messages.project_id
        AND pm.user_id = auth.uid()
        AND pm.status = 'active'
    )
  );

-- Message senders can update their messages
CREATE POLICY "Message senders can update" ON public.project_messages
  FOR UPDATE USING (
    sender_id = auth.uid()
    AND deleted_at IS NULL
  );

-- Message senders can soft delete their messages
CREATE POLICY "Message senders can delete" ON public.project_messages
  FOR UPDATE USING (
    sender_id = auth.uid()
    AND deleted_at IS NULL
  );

-- ============================================
-- UPDATED_AT TRIGGERS
-- ============================================

CREATE TRIGGER update_project_channels_updated_at 
  BEFORE UPDATE ON public.project_channels
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_channel_members_updated_at 
  BEFORE UPDATE ON public.project_channel_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_messages_updated_at 
  BEFORE UPDATE ON public.project_messages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- AUTO-CREATE DEFAULT CHANNELS FOR NEW PROJECTS
-- ============================================

CREATE OR REPLACE FUNCTION public.create_default_project_channels()
RETURNS TRIGGER AS $$
BEGIN
  -- General Chat
  INSERT INTO public.project_channels (project_id, name, slug, type, visibility, created_by)
  VALUES (NEW.id, 'General', 'general', 'general', 'public', NEW.created_by);
  
  -- Announcements
  INSERT INTO public.project_channels (project_id, name, slug, type, visibility, created_by)
  VALUES (NEW.id, 'Announcements', 'announcements', 'announcements', 'public', NEW.created_by);
  
  -- Team Discussion
  INSERT INTO public.project_channels (project_id, name, slug, type, visibility, created_by)
  VALUES (NEW.id, 'Team Discussion', 'team-discussion', 'team_discussion', 'public', NEW.created_by);
  
  -- Files
  INSERT INTO public.project_channels (project_id, name, slug, type, visibility, created_by)
  VALUES (NEW.id, 'Files', 'files', 'files', 'public', NEW.created_by);
  
  -- Meetings
  INSERT INTO public.project_channels (project_id, name, slug, type, visibility, created_by)
  VALUES (NEW.id, 'Meetings', 'meetings', 'meetings', 'public', NEW.created_by);
  
  -- Activity
  INSERT INTO public.project_channels (project_id, name, slug, type, visibility, created_by)
  VALUES (NEW.id, 'Activity', 'activity', 'activity', 'public', NEW.created_by);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_project_created_create_channels
  AFTER INSERT ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.create_default_project_channels();

-- ============================================
-- ACTIVITY LOG TRIGGER FOR MESSAGES
-- ============================================

CREATE OR REPLACE FUNCTION public.log_message_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.project_activity_logs (project_id, user_id, action, entity_type, entity_id, after_data)
    VALUES (NEW.project_id, NEW.sender_id, 'message_created', 'message', NEW.id, 
            jsonb_build_object('content', NEW.content, 'type', NEW.type, 'channel_id', NEW.channel_id));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
      INSERT INTO public.project_activity_logs (project_id, user_id, action, entity_type, entity_id, before_data)
      VALUES (NEW.project_id, auth.uid(), 'message_deleted', 'message', NEW.id,
              jsonb_build_object('content', OLD.content, 'type', OLD.type));
    ELSIF OLD.edited_at IS NULL AND NEW.edited_at IS NOT NULL THEN
      INSERT INTO public.project_activity_logs (project_id, user_id, action, entity_type, entity_id, before_data, after_data)
      VALUES (NEW.project_id, auth.uid(), 'message_edited', 'message', NEW.id,
              jsonb_build_object('content', OLD.content),
              jsonb_build_object('content', NEW.content));
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_project_message_change_log_activity
  AFTER INSERT OR UPDATE ON public.project_messages
  FOR EACH ROW EXECUTE FUNCTION public.log_message_activity();
