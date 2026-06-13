-- ============================================
-- PROJECT COLLABORATION MODULE - PHASE 4
-- Meetings: Meetings, Participants
-- ============================================

-- ============================================
-- PROJECT MEETINGS TABLE
-- ============================================

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

-- Indexes for project_meetings
CREATE INDEX IF NOT EXISTS idx_project_meetings_project_id ON public.project_meetings(project_id);
CREATE INDEX IF NOT EXISTS idx_project_meetings_status ON public.project_meetings(status);
CREATE INDEX IF NOT EXISTS idx_project_meetings_scheduled_start ON public.project_meetings(scheduled_start);
CREATE INDEX IF NOT EXISTS idx_project_meetings_organizer_id ON public.project_meetings(organizer_id);

-- ============================================
-- MEETING PARTICIPANTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.project_meeting_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES public.project_meetings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE,
  left_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'accepted', 'declined', 'joined', 'left')),
  CONSTRAINT project_meeting_participants_unique UNIQUE (meeting_id, user_id)
);

-- Indexes for meeting_participants
CREATE INDEX IF NOT EXISTS idx_project_meeting_participants_meeting_id ON public.project_meeting_participants(meeting_id);
CREATE INDEX IF NOT EXISTS idx_project_meeting_participants_user_id ON public.project_meeting_participants(user_id);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.project_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_meeting_participants ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES FOR PROJECT MEETINGS
-- ============================================

-- Users can view meetings in their projects
CREATE POLICY "Users can view project meetings" ON public.project_meetings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = project_meetings.project_id
        AND pm.user_id = auth.uid()
        AND pm.status = 'active'
    )
  );

-- Project members can create meetings
CREATE POLICY "Project members can create meetings" ON public.project_meetings
  FOR INSERT WITH CHECK (
    auth.uid() = organizer_id
    AND EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = project_meetings.project_id
        AND pm.user_id = auth.uid()
        AND pm.status = 'active'
    )
  );

-- Meeting organizers can update meetings
CREATE POLICY "Meeting organizers can update meetings" ON public.project_meetings
  FOR UPDATE USING (
    organizer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = project_meetings.project_id
        AND pm.user_id = auth.uid()
        AND pm.status = 'active'
        AND pm.role IN ('owner', 'admin')
    )
  );

-- Meeting organizers can delete meetings
CREATE POLICY "Meeting organizers can delete meetings" ON public.project_meetings
  FOR DELETE USING (
    organizer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = project_meetings.project_id
        AND pm.user_id = auth.uid()
        AND pm.status = 'active'
        AND pm.role IN ('owner', 'admin')
    )
  );

-- ============================================
-- RLS POLICIES FOR MEETING PARTICIPANTS
-- ============================================

-- Users can view participants in their project meetings
CREATE POLICY "Users can view meeting participants" ON public.project_meeting_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.project_meetings pm
      WHERE pm.id = project_meeting_participants.meeting_id
        AND EXISTS (
          SELECT 1 FROM public.project_members pmm
          WHERE pmm.project_id = pm.project_id
            AND pmm.user_id = auth.uid()
            AND pmm.status = 'active'
        )
    )
  );

-- Meeting organizers can add participants
CREATE POLICY "Meeting organizers can add participants" ON public.project_meeting_participants
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.project_meetings pm
      WHERE pm.id = project_meeting_participants.meeting_id
        AND (pm.organizer_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.project_members pmm
            WHERE pmm.project_id = pm.project_id
              AND pmm.user_id = auth.uid()
              AND pmm.status = 'active'
              AND pmm.role IN ('owner', 'admin')
          ))
    )
  );

-- Participants can update their own status
CREATE POLICY "Participants can update their status" ON public.project_meeting_participants
  FOR UPDATE USING (user_id = auth.uid());

-- Meeting organizers can remove participants
CREATE POLICY "Meeting organizers can remove participants" ON public.project_meeting_participants
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.project_meetings pm
      WHERE pm.id = project_meeting_participants.meeting_id
        AND (pm.organizer_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.project_members pmm
            WHERE pmm.project_id = pm.project_id
              AND pmm.user_id = auth.uid()
              AND pmm.status = 'active'
              AND pmm.role IN ('owner', 'admin')
          ))
    )
  );

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================

CREATE TRIGGER update_project_meetings_updated_at 
  BEFORE UPDATE ON public.project_meetings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- ACTIVITY LOG TRIGGER FOR MEETINGS
-- ============================================

CREATE OR REPLACE FUNCTION public.log_meeting_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.project_activity_logs (project_id, user_id, action, entity_type, entity_id, after_data)
    VALUES (
      NEW.project_id,
      NEW.organizer_id,
      'meeting_created',
      'meeting',
      NEW.id,
      jsonb_build_object('title', NEW.title, 'scheduled_start', NEW.scheduled_start, 'meeting_provider', NEW.meeting_provider)
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status = 'scheduled' AND NEW.status = 'live' THEN
      INSERT INTO public.project_activity_logs (project_id, user_id, action, entity_type, entity_id)
      VALUES (NEW.project_id, auth.uid(), 'meeting_started', 'meeting', NEW.id);
    ELSIF OLD.status = 'live' AND NEW.status = 'ended' THEN
      INSERT INTO public.project_activity_logs (project_id, user_id, action, entity_type, entity_id)
      VALUES (NEW.project_id, auth.uid(), 'meeting_ended', 'meeting', NEW.id);
    ELSIF OLD.status = 'scheduled' AND NEW.status = 'cancelled' THEN
      INSERT INTO public.project_activity_logs (project_id, user_id, action, entity_type, entity_id)
      VALUES (NEW.project_id, auth.uid(), 'meeting_cancelled', 'meeting', NEW.id);
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_project_meeting_change_log_activity
  AFTER INSERT OR UPDATE ON public.project_meetings
  FOR EACH ROW EXECUTE FUNCTION public.log_meeting_activity();

-- ============================================
-- FUNCTION TO GET UPCOMING MEETINGS
-- ============================================

CREATE OR REPLACE FUNCTION public.get_upcoming_meetings(p_project_id UUID, p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  meeting_link TEXT,
  meeting_provider TEXT,
  status TEXT,
  scheduled_start TIMESTAMP WITH TIME ZONE,
  scheduled_end TIMESTAMP WITH TIME ZONE,
  organizer_id UUID,
  organizer_name TEXT,
  participant_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pm.id,
    pm.title,
    pm.description,
    pm.meeting_link,
    pm.meeting_provider,
    pm.status,
    pm.scheduled_start,
    pm.scheduled_end,
    pm.organizer_id,
    p.full_name AS organizer_name,
    COUNT(pmp.id) AS participant_count
  FROM public.project_meetings pm
  LEFT JOIN public.profiles p ON p.id = pm.organizer_id
  LEFT JOIN public.project_meeting_participants pmp ON pmp.meeting_id = pm.id
  WHERE pm.project_id = p_project_id
    AND pm.status IN ('scheduled', 'live')
    AND pm.scheduled_start > NOW()
  GROUP BY pm.id, p.full_name
  ORDER BY pm.scheduled_start ASC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
