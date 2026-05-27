-- ============================================
-- MESSAGES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES public.channels(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
  parent_message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('text', 'system', 'deployment', 'incident', 'ai_response', 'activity', 'announcement')),
  content TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  edited_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for messages
CREATE INDEX IF NOT EXISTS idx_messages_channel_id ON public.messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_parent_message_id ON public.messages(parent_message_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_type ON public.messages(type);

-- ============================================
-- MESSAGE REACTIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT message_reactions_unique UNIQUE (message_id, user_id, emoji)
);

-- Indexes for message_reactions
CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id ON public.message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_user_id ON public.message_reactions(user_id);

-- ============================================
-- MESSAGE ATTACHMENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.message_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE NOT NULL,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for message_attachments
CREATE INDEX IF NOT EXISTS idx_message_attachments_message_id ON public.message_attachments(message_id);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES FOR MESSAGES
-- ============================================

-- Users can view messages in accessible channels
CREATE POLICY "Users can view channel messages" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.channels
      WHERE channels.id = messages.channel_id
      AND (
        -- Public channels in user's workspaces
        (channels.visibility = 'public' AND EXISTS (
          SELECT 1 FROM public.workspace_members
          WHERE workspace_members.workspace_id = channels.workspace_id
          AND workspace_members.user_id = auth.uid()
        ))
        OR
        -- Private channels user is a member of
        (channels.visibility = 'private' AND EXISTS (
          SELECT 1 FROM public.channel_members
          WHERE channel_members.channel_id = channels.id
          AND channel_members.user_id = auth.uid()
        ))
      )
    )
  );

-- Channel members can create messages
CREATE POLICY "Channel members can create messages" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.channels
      WHERE channels.id = messages.channel_id
      AND (
        -- Public channels in user's workspaces
        (channels.visibility = 'public' AND EXISTS (
          SELECT 1 FROM public.workspace_members
          WHERE workspace_members.workspace_id = channels.workspace_id
          AND workspace_members.user_id = auth.uid()
        ))
        OR
        -- Private channels user is a member of
        (channels.visibility = 'private' AND EXISTS (
          SELECT 1 FROM public.channel_members
          WHERE channel_members.channel_id = channels.id
          AND channel_members.user_id = auth.uid()
        ))
      )
    )
  );

-- Message senders can update their messages
CREATE POLICY "Message senders can update" ON public.messages
  FOR UPDATE USING (
    sender_id = auth.uid()
  );

-- Message senders can delete their messages
CREATE POLICY "Message senders can delete" ON public.messages
  FOR DELETE USING (
    sender_id = auth.uid()
  );

-- ============================================
-- RLS POLICIES FOR MESSAGE REACTIONS
-- ============================================

-- Users can view reactions in accessible channels
CREATE POLICY "Users can view message reactions" ON public.message_reactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.messages
      WHERE messages.id = message_reactions.message_id
      AND EXISTS (
        SELECT 1 FROM public.channels
        WHERE channels.id = messages.channel_id
        AND (
          -- Public channels in user's workspaces
          (channels.visibility = 'public' AND EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_members.workspace_id = channels.workspace_id
            AND workspace_members.user_id = auth.uid()
          ))
          OR
          -- Private channels user is a member of
          (channels.visibility = 'private' AND EXISTS (
            SELECT 1 FROM public.channel_members
            WHERE channel_members.channel_id = channels.id
            AND channel_members.user_id = auth.uid()
          ))
        )
      )
    )
  );

-- Channel members can add reactions
CREATE POLICY "Channel members can add reactions" ON public.message_reactions
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.messages
      WHERE messages.id = message_reactions.message_id
      AND EXISTS (
        SELECT 1 FROM public.channels
        WHERE channels.id = messages.channel_id
        AND (
          -- Public channels in user's workspaces
          (channels.visibility = 'public' AND EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_members.workspace_id = channels.workspace_id
            AND workspace_members.user_id = auth.uid()
          ))
          OR
          -- Private channels user is a member of
          (channels.visibility = 'private' AND EXISTS (
            SELECT 1 FROM public.channel_members
            WHERE channel_members.channel_id = channels.id
            AND channel_members.user_id = auth.uid()
          ))
        )
      )
    )
  );

-- Reaction owners can remove reactions
CREATE POLICY "Reaction owners can remove" ON public.message_reactions
  FOR DELETE USING (
    user_id = auth.uid()
  );

-- ============================================
-- RLS POLICIES FOR MESSAGE ATTACHMENTS
-- ============================================

-- Users can view attachments in accessible channels
CREATE POLICY "Users can view message attachments" ON public.message_attachments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.messages
      WHERE messages.id = message_attachments.message_id
      AND EXISTS (
        SELECT 1 FROM public.channels
        WHERE channels.id = messages.channel_id
        AND (
          -- Public channels in user's workspaces
          (channels.visibility = 'public' AND EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_members.workspace_id = channels.workspace_id
            AND workspace_members.user_id = auth.uid()
          ))
          OR
          -- Private channels user is a member of
          (channels.visibility = 'private' AND EXISTS (
            SELECT 1 FROM public.channel_members
            WHERE channel_members.channel_id = channels.id
            AND channel_members.user_id = auth.uid()
          ))
        )
      )
    )
  );

-- Channel members can upload attachments
CREATE POLICY "Channel members can upload attachments" ON public.message_attachments
  FOR INSERT WITH CHECK (
    auth.uid() = uploaded_by
    AND EXISTS (
      SELECT 1 FROM public.messages
      WHERE messages.id = message_attachments.message_id
      AND EXISTS (
        SELECT 1 FROM public.channels
        WHERE channels.id = messages.channel_id
        AND (
          -- Public channels in user's workspaces
          (channels.visibility = 'public' AND EXISTS (
            SELECT 1 FROM public.workspace_members
            WHERE workspace_members.workspace_id = channels.workspace_id
            AND workspace_members.user_id = auth.uid()
          ))
          OR
          -- Private channels user is a member of
          (channels.visibility = 'private' AND EXISTS (
            SELECT 1 FROM public.channel_members
            WHERE channel_members.channel_id = channels.id
            AND channel_members.user_id = auth.uid()
          ))
        )
      )
    )
  );

-- Attachment uploaders can delete attachments
CREATE POLICY "Attachment uploaders can delete" ON public.message_attachments
  FOR DELETE USING (
    uploaded_by = auth.uid()
  );

-- ============================================
-- UPDATED_AT TRIGGER FOR MESSAGES
-- ============================================

CREATE TRIGGER update_messages_updated_at 
  BEFORE UPDATE ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
