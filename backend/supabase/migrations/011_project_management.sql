-- TeamSync Project + Member Management

-- Extend projects with richer metadata
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'private',
  ADD COLUMN IF NOT EXISTS icon TEXT,
  ADD COLUMN IF NOT EXISTS color TEXT NOT NULL DEFAULT '#6366f1',
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

UPDATE public.projects
SET created_by = owner_id
WHERE created_by IS NULL;

ALTER TABLE public.projects
  ALTER COLUMN created_by SET NOT NULL;

ALTER TABLE public.projects
  DROP CONSTRAINT IF EXISTS projects_status_check;

ALTER TABLE public.projects
  ADD CONSTRAINT projects_status_check
  CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'archived'));

ALTER TABLE public.projects
  DROP CONSTRAINT IF EXISTS projects_visibility_check;

ALTER TABLE public.projects
  ADD CONSTRAINT projects_visibility_check
  CHECK (visibility IN ('private', 'internal', 'public'));

CREATE INDEX IF NOT EXISTS idx_projects_visibility ON public.projects(visibility);
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON public.projects(created_by);

-- Project members
CREATE TABLE IF NOT EXISTS public.project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'manager', 'lead', 'developer', 'viewer', 'guest')),
  status TEXT NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'active', 'suspended', 'removed')),
  invited_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  joined_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT project_members_project_email_unique UNIQUE (project_id, email),
  CONSTRAINT project_members_project_user_unique UNIQUE (project_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON public.project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON public.project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_project_members_status ON public.project_members(status);
CREATE INDEX IF NOT EXISTS idx_project_members_role ON public.project_members(role);

-- Project invitations
CREATE TABLE IF NOT EXISTS public.project_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'manager', 'lead', 'developer', 'viewer', 'guest')),
  token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  expires_at TIMESTAMP WITH TIME ZONE,
  accepted_at TIMESTAMP WITH TIME ZONE,
  invited_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT project_invitations_project_email_unique UNIQUE (project_id, email)
);

CREATE INDEX IF NOT EXISTS idx_project_invitations_project_id ON public.project_invitations(project_id);
CREATE INDEX IF NOT EXISTS idx_project_invitations_email ON public.project_invitations(email);
CREATE INDEX IF NOT EXISTS idx_project_invitations_status ON public.project_invitations(status);
CREATE INDEX IF NOT EXISTS idx_project_invitations_token ON public.project_invitations(token);

-- Audit logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID,
  workspace_id UUID,
  organization_id UUID,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  before_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  after_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_project_id ON public.audit_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_workspace_id ON public.audit_logs(workspace_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- Allow project search documents
ALTER TABLE search_documents
  DROP CONSTRAINT IF EXISTS search_documents_entity_type_check;

ALTER TABLE search_documents
  ADD CONSTRAINT search_documents_entity_type_check
  CHECK (entity_type IN ('message', 'summary', 'incident', 'deployment', 'activity', 'workspace', 'channel', 'project'));

-- Updated at triggers
CREATE TRIGGER update_project_members_updated_at
  BEFORE UPDATE ON public.project_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_invitations_updated_at
  BEFORE UPDATE ON public.project_invitations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Row level security
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop legacy project policies before recreating them
DROP POLICY IF EXISTS "Users can view projects in their teams" ON public.projects;
DROP POLICY IF EXISTS "Project owners can update projects" ON public.projects;
DROP POLICY IF EXISTS "Project owners can delete projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated users can create projects" ON public.projects;

CREATE POLICY "Users can view accessible projects" ON public.projects
  FOR SELECT USING (
    owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = projects.id
        AND pm.user_id = auth.uid()
        AND pm.status = 'active'
    )
    OR (
      visibility IN ('public', 'internal')
      AND workspace_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.workspace_members wm
        WHERE wm.workspace_id = projects.workspace_id
          AND wm.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Project creators can insert projects" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() = owner_id AND auth.uid() = created_by);

CREATE POLICY "Project owners can update projects" ON public.projects
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Project owners can delete projects" ON public.projects
  FOR DELETE USING (owner_id = auth.uid());

-- Project members policies
CREATE POLICY "Project members can view member records" ON public.project_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_members.project_id
        AND p.owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = project_members.project_id
        AND pm.user_id = auth.uid()
        AND pm.status = 'active'
        AND pm.role IN ('owner', 'admin')
    )
    OR (
      user_id = auth.uid()
      AND status <> 'removed'
    )
  );

CREATE POLICY "Project owners and admins can manage members" ON public.project_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_members.project_id
        AND p.owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = project_members.project_id
        AND pm.user_id = auth.uid()
        AND pm.status = 'active'
        AND pm.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Project owners and admins can update members" ON public.project_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_members.project_id
        AND p.owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = project_members.project_id
        AND pm.user_id = auth.uid()
        AND pm.status = 'active'
        AND pm.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Project owners and admins can delete members" ON public.project_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_members.project_id
        AND p.owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = project_members.project_id
        AND pm.user_id = auth.uid()
        AND pm.status = 'active'
        AND pm.role IN ('owner', 'admin')
    )
  );

-- Project invitations policies
CREATE POLICY "Project owners and admins can view invitations" ON public.project_invitations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_invitations.project_id
        AND p.owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = project_invitations.project_id
        AND pm.user_id = auth.uid()
        AND pm.status = 'active'
        AND pm.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Project owners and admins can create invitations" ON public.project_invitations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_invitations.project_id
        AND p.owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = project_invitations.project_id
        AND pm.user_id = auth.uid()
        AND pm.status = 'active'
        AND pm.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Project owners and admins can update invitations" ON public.project_invitations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_invitations.project_id
        AND p.owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = project_invitations.project_id
        AND pm.user_id = auth.uid()
        AND pm.status = 'active'
        AND pm.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Project owners and admins can delete invitations" ON public.project_invitations
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_invitations.project_id
        AND p.owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = project_invitations.project_id
        AND pm.user_id = auth.uid()
        AND pm.status = 'active'
        AND pm.role IN ('owner', 'admin')
    )
  );

-- Audit log policies
CREATE POLICY "Project stakeholders can view audit logs" ON public.audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = audit_logs.project_id
        AND (
          p.owner_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.project_members pm
            WHERE pm.project_id = p.id
              AND pm.user_id = auth.uid()
              AND pm.status = 'active'
          )
          OR (
            p.visibility IN ('public', 'internal')
            AND p.workspace_id IS NOT NULL
            AND EXISTS (
              SELECT 1 FROM public.workspace_members wm
              WHERE wm.workspace_id = p.workspace_id
                AND wm.user_id = auth.uid()
            )
          )
        )
    )
  );

CREATE POLICY "Users can insert their own audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (auth.uid() = actor_id);

-- Project invitation claiming helper
CREATE OR REPLACE FUNCTION public.claim_project_invitations(p_user_id UUID, p_email TEXT)
RETURNS TABLE (
  project_id UUID,
  workspace_id UUID,
  invitation_id UUID,
  member_id UUID,
  email TEXT,
  role TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized_email TEXT := lower(trim(coalesce(p_email, '')));
BEGIN
  IF normalized_email = '' THEN
    RETURN;
  END IF;

  RETURN QUERY
  WITH eligible_invitations AS (
    SELECT
      pi.id AS invitation_id,
      pi.project_id,
      pi.email,
      pi.role,
      pi.invited_by,
      p.workspace_id
    FROM public.project_invitations pi
    JOIN public.projects p ON p.id = pi.project_id
    WHERE lower(pi.email) = normalized_email
      AND pi.status = 'pending'
      AND (pi.expires_at IS NULL OR pi.expires_at > NOW())
  ),
  accepted_invitations AS (
    UPDATE public.project_invitations pi
    SET status = 'accepted',
        accepted_at = NOW(),
        updated_at = NOW()
    FROM eligible_invitations ei
    WHERE pi.id = ei.invitation_id
    RETURNING pi.id
  ),
  upserted_members AS (
    INSERT INTO public.project_members (
      project_id,
      user_id,
      email,
      role,
      status,
      invited_by,
      joined_at
    )
    SELECT
      ei.project_id,
      p_user_id,
      ei.email,
      ei.role,
      'active',
      ei.invited_by,
      NOW()
    FROM eligible_invitations ei
    ON CONFLICT (project_id, email) DO UPDATE
      SET user_id = EXCLUDED.user_id,
          role = EXCLUDED.role,
          status = 'active',
          joined_at = COALESCE(project_members.joined_at, NOW()),
          updated_at = NOW()
    RETURNING id AS member_id, project_id, email, role
  ),
  logged_actions AS (
    INSERT INTO public.audit_logs (
      project_id,
      workspace_id,
      actor_id,
      action,
      entity_type,
      entity_id,
      before_data,
      after_data,
      metadata
    )
    SELECT
      ei.project_id,
      ei.workspace_id,
      p_user_id,
      'invitation_accepted',
      'invitation',
      ei.invitation_id,
      '{}'::jsonb,
      jsonb_build_object('status', 'accepted'),
      jsonb_build_object(
        'invitee_email', ei.email,
        'role', ei.role
      )
    FROM eligible_invitations ei
    RETURNING id
  )
  SELECT
    ei.project_id,
    ei.workspace_id,
    ei.invitation_id,
    um.member_id,
    ei.email,
    ei.role
  FROM eligible_invitations ei
  LEFT JOIN upserted_members um
    ON um.project_id = ei.project_id
   AND um.email = ei.email;
END;
$$;
