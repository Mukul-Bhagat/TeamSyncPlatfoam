-- ============================================
-- CHANNELS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('text', 'voice', 'announcement', 'incident', 'deployment', 'ai', 'activity_feed')),
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
  icon TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT channels_workspace_slug_unique UNIQUE (workspace_id, slug)
);

-- Indexes for channels
CREATE INDEX IF NOT EXISTS idx_channels_workspace_id ON public.channels(workspace_id);
CREATE INDEX IF NOT EXISTS idx_channels_slug ON public.channels(slug);
CREATE INDEX IF NOT EXISTS idx_channels_type ON public.channels(type);
CREATE INDEX IF NOT EXISTS idx_channels_visibility ON public.channels(visibility);

-- ============================================
-- CHANNEL MEMBERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.channel_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES public.channels(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT channel_members_unique UNIQUE (channel_id, user_id)
);

-- Indexes for channel_members
CREATE INDEX IF NOT EXISTS idx_channel_members_channel_id ON public.channel_members(channel_id);
CREATE INDEX IF NOT EXISTS idx_channel_members_user_id ON public.channel_members(user_id);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_members ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES FOR CHANNELS
-- ============================================

-- Users can view public channels in their workspaces and private channels they belong to
CREATE POLICY "Users can view workspace channels" ON public.channels
  FOR SELECT USING (
    -- Public channels in user's workspaces
    (visibility = 'public' AND EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_members.workspace_id = channels.workspace_id
      AND workspace_members.user_id = auth.uid()
    ))
    OR
    -- Private channels user is a member of
    (visibility = 'private' AND EXISTS (
      SELECT 1 FROM public.channel_members
      WHERE channel_members.channel_id = channels.id
      AND channel_members.user_id = auth.uid()
    ))
  );

-- Workspace members can create channels
CREATE POLICY "Workspace members can create channels" ON public.channels
  FOR INSERT WITH CHECK (
    auth.uid() = created_by
    AND EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_members.workspace_id = channels.workspace_id
      AND workspace_members.user_id = auth.uid()
    )
  );

-- Channel admins can update channels
CREATE POLICY "Channel admins can update" ON public.channels
  FOR UPDATE USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.channel_members
      WHERE channel_members.channel_id = channels.id
      AND channel_members.user_id = auth.uid()
      AND channel_members.role IN ('admin')
    )
  );

-- Channel admins can delete channels
CREATE POLICY "Channel admins can delete" ON public.channels
  FOR DELETE USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.channel_members
      WHERE channel_members.channel_id = channels.id
      AND channel_members.user_id = auth.uid()
      AND channel_members.role IN ('admin')
    )
  );

-- ============================================
-- RLS POLICIES FOR CHANNEL MEMBERS
-- ============================================

-- Users can view memberships in their channels
CREATE POLICY "Users can view channel memberships" ON public.channel_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.channel_members cm
      WHERE cm.channel_id = channel_members.channel_id
      AND cm.user_id = auth.uid()
    )
  );

-- Channel admins can add members (for private channels)
CREATE POLICY "Channel admins can add members" ON public.channel_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.channel_members
      WHERE channel_members.channel_id = channel_members.channel_id
      AND channel_members.user_id = auth.uid()
      AND channel_members.role IN ('admin')
    )
  );

-- Channel admins can update member roles
CREATE POLICY "Channel admins can update roles" ON public.channel_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.channel_members
      WHERE channel_members.channel_id = channel_members.channel_id
      AND channel_members.user_id = auth.uid()
      AND channel_members.role IN ('admin')
    )
  );

-- Channel admins can remove members
CREATE POLICY "Channel admins can remove members" ON public.channel_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.channel_members
      WHERE channel_members.channel_id = channel_members.channel_id
      AND channel_members.user_id = auth.uid()
      AND channel_members.role IN ('admin')
    )
  );

-- ============================================
-- UPDATED_AT TRIGGER FOR CHANNELS
-- ============================================

CREATE TRIGGER update_channels_updated_at 
  BEFORE UPDATE ON public.channels
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
