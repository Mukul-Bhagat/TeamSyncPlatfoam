-- ============================================
-- PROJECT COLLABORATION MODULE - PHASE 2
-- Message Features: Reactions, Attachments, Typing, Read Receipts
-- ============================================

-- ============================================
-- MESSAGE REACTIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.project_message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.project_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT project_message_reactions_unique UNIQUE (message_id, user_id, emoji)
);

-- Indexes for message_reactions
CREATE INDEX IF NOT EXISTS idx_project_message_reactions_message_id ON public.project_message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_project_message_reactions_user_id ON public.project_message_reactions(user_id);

-- ============================================
-- MESSAGE ATTACHMENTS TABLE
-- ============================================

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

-- Indexes for message_attachments
CREATE INDEX IF NOT EXISTS idx_project_message_attachments_message_id ON public.project_message_attachments(message_id);
CREATE INDEX IF NOT EXISTS idx_project_message_attachments_uploaded_by ON public.project_message_attachments(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_project_message_attachments_file_type ON public.project_message_attachments(file_type);

-- ============================================
-- TYPING INDICATORS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.project_typing_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES public.project_channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_typed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT project_typing_indicators_unique UNIQUE (channel_id, user_id)
);

-- Indexes for typing_indicators
CREATE INDEX IF NOT EXISTS idx_project_typing_indicators_channel_id ON public.project_typing_indicators(channel_id);

-- ============================================
-- READ RECEIPTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.project_read_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.project_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  read_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT project_read_receipts_unique UNIQUE (message_id, user_id)
);

-- Indexes for read_receipts
CREATE INDEX IF NOT EXISTS idx_project_read_receipts_message_id ON public.project_read_receipts(message_id);
CREATE INDEX IF NOT EXISTS idx_project_read_receipts_user_id ON public.project_read_receipts(user_id);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.project_message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_typing_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_read_receipts ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES FOR MESSAGE REACTIONS
-- ============================================

-- Users can view reactions in their project channels
CREATE POLICY "Users can view message reactions" ON public.project_message_reactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.project_messages pm
      WHERE pm.id = project_message_reactions.message_id
        AND EXISTS (
          SELECT 1 FROM public.project_members pmm
          WHERE pmm.project_id = pm.project_id
            AND pmm.user_id = auth.uid()
            AND pmm.status = 'active'
        )
    )
  );

-- Project members can add reactions
CREATE POLICY "Project members can add reactions" ON public.project_message_reactions
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.project_messages pm
      WHERE pm.id = project_message_reactions.message_id
        AND EXISTS (
          SELECT 1 FROM public.project_members pmm
          WHERE pmm.project_id = pm.project_id
            AND pmm.user_id = auth.uid()
            AND pmm.status = 'active'
        )
    )
  );

-- Reaction owners can remove reactions
CREATE POLICY "Reaction owners can remove" ON public.project_message_reactions
  FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- RLS POLICIES FOR MESSAGE ATTACHMENTS
-- ============================================

-- Users can view attachments in their project channels
CREATE POLICY "Users can view message attachments" ON public.project_message_attachments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.project_messages pm
      WHERE pm.id = project_message_attachments.message_id
        AND EXISTS (
          SELECT 1 FROM public.project_members pmm
          WHERE pmm.project_id = pm.project_id
            AND pmm.user_id = auth.uid()
            AND pmm.status = 'active'
        )
    )
  );

-- Project members can upload attachments
CREATE POLICY "Project members can upload attachments" ON public.project_message_attachments
  FOR INSERT WITH CHECK (
    auth.uid() = uploaded_by
    AND EXISTS (
      SELECT 1 FROM public.project_messages pm
      WHERE pm.id = project_message_attachments.message_id
        AND EXISTS (
          SELECT 1 FROM public.project_members pmm
          WHERE pmm.project_id = pm.project_id
            AND pmm.user_id = auth.uid()
            AND pmm.status = 'active'
        )
    )
  );

-- Attachment uploaders can delete attachments
CREATE POLICY "Attachment uploaders can delete" ON public.project_message_attachments
  FOR DELETE USING (uploaded_by = auth.uid());

-- ============================================
-- RLS POLICIES FOR TYPING INDICATORS
-- ============================================

-- Users can view typing indicators in their channels
CREATE POLICY "Users can view typing indicators" ON public.project_typing_indicators
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.project_channel_members pcm
      WHERE pcm.channel_id = project_typing_indicators.channel_id
        AND pcm.user_id = auth.uid()
    )
  );

-- Users can update their own typing indicators
CREATE POLICY "Users can update typing indicators" ON public.project_typing_indicators
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their typing status" ON public.project_typing_indicators
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own typing indicators
CREATE POLICY "Users can delete typing indicators" ON public.project_typing_indicators
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- RLS POLICIES FOR READ RECEIPTS
-- ============================================

-- Users can view read receipts in their project channels
CREATE POLICY "Users can view read receipts" ON public.project_read_receipts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.project_messages pm
      WHERE pm.id = project_read_receipts.message_id
        AND EXISTS (
          SELECT 1 FROM public.project_members pmm
          WHERE pmm.project_id = pm.project_id
            AND pmm.user_id = auth.uid()
            AND pmm.status = 'active'
        )
    )
  );

-- Users can create their own read receipts
CREATE POLICY "Users can create read receipts" ON public.project_read_receipts
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.project_messages pm
      WHERE pm.id = project_read_receipts.message_id
        AND EXISTS (
          SELECT 1 FROM public.project_members pmm
          WHERE pmm.project_id = pm.project_id
            AND pmm.user_id = auth.uid()
            AND pmm.status = 'active'
        )
    )
  );

-- Users can update their own read receipts
CREATE POLICY "Users can update read receipts" ON public.project_read_receipts
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- TRIGGER TO UPDATE REACTION COUNT
-- ============================================

CREATE OR REPLACE FUNCTION public.update_message_reaction_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.project_messages
    SET reaction_count = reaction_count + 1
    WHERE id = NEW.message_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.project_messages
    SET reaction_count = GREATEST(reaction_count - 1, 0)
    WHERE id = OLD.message_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_reaction_change_update_count
  AFTER INSERT OR DELETE ON public.project_message_reactions
  FOR EACH ROW EXECUTE FUNCTION public.update_message_reaction_count();
