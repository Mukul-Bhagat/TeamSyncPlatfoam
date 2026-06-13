-- ============================================
-- PROJECT COLLABORATION MODULE - PHASE 5
-- Compliance & Settings: Activity Logs, Reports, Settings
-- ============================================

-- ============================================
-- PROJECT ACTIVITY LOGS TABLE
-- ============================================

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

-- Indexes for activity_logs
CREATE INDEX IF NOT EXISTS idx_project_activity_logs_project_id ON public.project_activity_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_project_activity_logs_user_id ON public.project_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_project_activity_logs_action ON public.project_activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_project_activity_logs_entity_type ON public.project_activity_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_project_activity_logs_created_at ON public.project_activity_logs(created_at DESC);

-- ============================================
-- MESSAGE REPORTS TABLE
-- ============================================

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

-- Indexes for message_reports
CREATE INDEX IF NOT EXISTS idx_project_message_reports_message_id ON public.project_message_reports(message_id);
CREATE INDEX IF NOT EXISTS idx_project_message_reports_reported_by ON public.project_message_reports(reported_by);
CREATE INDEX IF NOT EXISTS idx_project_message_reports_status ON public.project_message_reports(status);

-- ============================================
-- PROJECT SETTINGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.project_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT project_settings_project_key_unique UNIQUE (project_id, key)
);

-- Indexes for project_settings
CREATE INDEX IF NOT EXISTS idx_project_settings_project_id ON public.project_settings(project_id);
CREATE INDEX IF NOT EXISTS idx_project_settings_key ON public.project_settings(key);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.project_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_message_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES FOR ACTIVITY LOGS
-- ============================================

-- Project stakeholders can view audit logs (read-only, never delete)
CREATE POLICY "Project stakeholders can view audit logs" ON public.project_activity_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_activity_logs.project_id
        AND (
          p.owner_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.project_members pm
            WHERE pm.project_id = p.id
              AND pm.user_id = auth.uid()
              AND pm.status = 'active'
          )
        )
    )
  );

-- Users can insert their own audit logs
CREATE POLICY "Users can insert their own audit logs" ON public.project_activity_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- No DELETE policy - audit logs are immutable

-- ============================================
-- RLS POLICIES FOR MESSAGE REPORTS
-- ============================================

-- Users can view reports in their projects
CREATE POLICY "Users can view message reports" ON public.project_message_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.project_messages pm
      WHERE pm.id = project_message_reports.message_id
        AND EXISTS (
          SELECT 1 FROM public.project_members pmm
          WHERE pmm.project_id = pm.project_id
            AND pmm.user_id = auth.uid()
            AND pmm.status = 'active'
            AND pmm.role IN ('owner', 'admin')
        )
    )
  );

-- Project members can create reports
CREATE POLICY "Project members can create reports" ON public.project_message_reports
  FOR INSERT WITH CHECK (
    auth.uid() = reported_by
    AND EXISTS (
      SELECT 1 FROM public.project_messages pm
      WHERE pm.id = project_message_reports.message_id
        AND EXISTS (
          SELECT 1 FROM public.project_members pmm
          WHERE pmm.project_id = pm.project_id
            AND pmm.user_id = auth.uid()
            AND pmm.status = 'active'
        )
    )
  );

-- Project admins can review reports
CREATE POLICY "Project admins can review reports" ON public.project_message_reports
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.project_messages pm
      WHERE pm.id = project_message_reports.message_id
        AND EXISTS (
          SELECT 1 FROM public.project_members pmm
          WHERE pmm.project_id = pm.project_id
            AND pmm.user_id = auth.uid()
            AND pmm.status = 'active'
            AND pmm.role IN ('owner', 'admin')
        )
    )
  );

-- ============================================
-- RLS POLICIES FOR PROJECT SETTINGS
-- ============================================

-- Project members can view settings
CREATE POLICY "Project members can view settings" ON public.project_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = project_settings.project_id
        AND pm.user_id = auth.uid()
        AND pm.status = 'active'
    )
  );

-- Project owners and admins can update settings
CREATE POLICY "Project owners and admins can update settings" ON public.project_settings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = project_settings.project_id
        AND pm.user_id = auth.uid()
        AND pm.status = 'active'
        AND pm.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Project owners and admins can update settings values" ON public.project_settings
  FOR UPDATE USING (
    auth.uid() = updated_by
    AND EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = project_settings.project_id
        AND pm.user_id = auth.uid()
        AND pm.status = 'active'
        AND pm.role IN ('owner', 'admin')
    )
  );

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================

CREATE TRIGGER update_project_settings_updated_at 
  BEFORE UPDATE ON public.project_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- FUNCTION TO GET PROJECT ACTIVITY SUMMARY
-- ============================================

CREATE OR REPLACE FUNCTION public.get_project_activity_summary(p_project_id UUID, p_days INTEGER DEFAULT 7)
RETURNS TABLE (
  action TEXT,
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    action,
    COUNT(*) AS count
  FROM public.project_activity_logs
  WHERE project_id = p_project_id
    AND created_at > NOW() - (p_days || ' days')::INTERVAL
  GROUP BY action
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCTION TO GET PROJECT STATISTICS
-- ============================================

CREATE OR REPLACE FUNCTION public.get_project_statistics(p_project_id UUID)
RETURNS TABLE (
  total_members INTEGER,
  total_channels INTEGER,
  total_messages INTEGER,
  total_files INTEGER,
  total_meetings INTEGER,
  active_meetings INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM public.project_members WHERE project_id = p_project_id AND status = 'active')::INTEGER AS total_members,
    (SELECT COUNT(*) FROM public.project_channels WHERE project_id = p_project_id)::INTEGER AS total_channels,
    (SELECT COUNT(*) FROM public.project_messages WHERE project_id = p_project_id AND deleted_at IS NULL)::INTEGER AS total_messages,
    (SELECT COUNT(*) FROM public.project_files WHERE project_id = p_project_id AND deleted_at IS NULL)::INTEGER AS total_files,
    (SELECT COUNT(*) FROM public.project_meetings WHERE project_id = p_project_id)::INTEGER AS total_meetings,
    (SELECT COUNT(*) FROM public.project_meetings WHERE project_id = p_project_id AND status = 'live')::INTEGER AS active_meetings;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCTION TO CREATE DEFAULT PROJECT SETTINGS
-- ============================================

CREATE OR REPLACE FUNCTION public.create_default_project_settings()
RETURNS TRIGGER AS $$
BEGIN
  -- Default permissions
  INSERT INTO public.project_settings (project_id, key, value, updated_by)
  VALUES (NEW.id, 'permissions', 
          jsonb_build_object(
            'members_can_create_channels', true,
            'members_can_upload_files', true,
            'members_can_schedule_meetings', true,
            'viewers_can_download', true
          ), NEW.created_by);
  
  -- Default notification settings
  INSERT INTO public.project_settings (project_id, key, value, updated_by)
  VALUES (NEW.id, 'notifications',
          jsonb_build_object(
            'notify_on_new_message', true,
            'notify_on_mention', true,
            'notify_on_file_upload', true,
            'notify_on_meeting_invitation', true
          ), NEW.created_by);
  
  -- Default file settings
  INSERT INTO public.project_settings (project_id, key, value, updated_by)
  VALUES (NEW.id, 'file_settings',
          jsonb_build_object(
            'max_file_size_mb', 100,
            'allowed_file_types', ARRAY['image', 'pdf', 'document', 'audio', 'video', 'spreadsheet'],
            'enable_versioning', true
          ), NEW.created_by);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_project_created_create_settings
  AFTER INSERT ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.create_default_project_settings();
