-- ============================================
-- PROJECT COLLABORATION MODULE - PHASE 3
-- File Management: Files, Versions
-- ============================================

-- ============================================
-- PROJECT FILES TABLE
-- ============================================

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

-- Indexes for project_files
CREATE INDEX IF NOT EXISTS idx_project_files_project_id ON public.project_files(project_id);
CREATE INDEX IF NOT EXISTS idx_project_files_folder_id ON public.project_files(folder_id);
CREATE INDEX IF NOT EXISTS idx_project_files_uploaded_by ON public.project_files(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_project_files_file_type ON public.project_files(file_type);
CREATE INDEX IF NOT EXISTS idx_project_files_is_folder ON public.project_files(is_folder);
CREATE INDEX IF NOT EXISTS idx_project_files_deleted_at ON public.project_files(deleted_at);

-- ============================================
-- FILE VERSIONS TABLE
-- ============================================

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

-- Indexes for file_versions
CREATE INDEX IF NOT EXISTS idx_project_file_versions_file_id ON public.project_file_versions(file_id);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_file_versions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES FOR PROJECT FILES
-- ============================================

-- Users can view files in their projects
CREATE POLICY "Users can view project files" ON public.project_files
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = project_files.project_id
        AND pm.user_id = auth.uid()
        AND pm.status = 'active'
    )
    AND deleted_at IS NULL
  );

-- Project members can upload files
CREATE POLICY "Project members can upload files" ON public.project_files
  FOR INSERT WITH CHECK (
    auth.uid() = uploaded_by
    AND EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = project_files.project_id
        AND pm.user_id = auth.uid()
        AND pm.status = 'active'
    )
  );

-- File uploaders can update their files
CREATE POLICY "File uploaders can update files" ON public.project_files
  FOR UPDATE USING (
    uploaded_by = auth.uid()
    AND deleted_at IS NULL
  );

-- File uploaders can soft delete their files
CREATE POLICY "File uploaders can delete files" ON public.project_files
  FOR UPDATE USING (
    uploaded_by = auth.uid()
    AND deleted_at IS NULL
  );

-- ============================================
-- RLS POLICIES FOR FILE VERSIONS
-- ============================================

-- Users can view file versions in their projects
CREATE POLICY "Users can view file versions" ON public.project_file_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.project_files pf
      WHERE pf.id = project_file_versions.file_id
        AND EXISTS (
          SELECT 1 FROM public.project_members pm
          WHERE pm.project_id = pf.project_id
            AND pm.user_id = auth.uid()
            AND pm.status = 'active'
        )
    )
  );

-- Project members can create file versions
CREATE POLICY "Project members can create file versions" ON public.project_file_versions
  FOR INSERT WITH CHECK (
    auth.uid() = uploaded_by
    AND EXISTS (
      SELECT 1 FROM public.project_files pf
      WHERE pf.id = project_file_versions.file_id
        AND EXISTS (
          SELECT 1 FROM public.project_members pm
          WHERE pm.project_id = pf.project_id
            AND pm.user_id = auth.uid()
            AND pm.status = 'active'
        )
    )
  );

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================

CREATE TRIGGER update_project_files_updated_at 
  BEFORE UPDATE ON public.project_files
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- ACTIVITY LOG TRIGGER FOR FILES
-- ============================================

CREATE OR REPLACE FUNCTION public.log_file_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.project_activity_logs (project_id, user_id, action, entity_type, entity_id, after_data)
    VALUES (
      (SELECT project_id FROM public.project_files WHERE id = NEW.id),
      NEW.uploaded_by,
      'file_uploaded',
      'file',
      NEW.id,
      jsonb_build_object('file_name', NEW.file_name, 'file_type', NEW.file_type, 'file_size', NEW.file_size)
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
      INSERT INTO public.project_activity_logs (project_id, user_id, action, entity_type, entity_id, before_data)
      VALUES (
        (SELECT project_id FROM public.project_files WHERE id = NEW.id),
        auth.uid(),
        'file_deleted',
        'file',
        NEW.id,
        jsonb_build_object('file_name', OLD.file_name, 'file_type', OLD.file_type)
      );
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_project_file_change_log_activity
  AFTER INSERT OR UPDATE ON public.project_files
  FOR EACH ROW EXECUTE FUNCTION public.log_file_activity();

-- ============================================
-- FUNCTION TO INCREMENT DOWNLOAD COUNT
-- ============================================

CREATE OR REPLACE FUNCTION public.increment_file_download_count(p_file_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.project_files
  SET download_count = download_count + 1
  WHERE id = p_file_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
