-- TeamSync Invite-Only Projects
-- Normalize project access, fix private project channels, and tighten project search visibility

-- Normalize projects to private-only access
UPDATE public.projects
SET visibility = 'private'
WHERE visibility IS DISTINCT FROM 'private';

ALTER TABLE public.projects
  DROP CONSTRAINT IF EXISTS projects_visibility_check;

ALTER TABLE public.projects
  ADD CONSTRAINT projects_visibility_check
  CHECK (visibility = 'private');

-- Align channel membership schema with the client and access model
ALTER TABLE public.channel_members
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active'
  CHECK (status IN ('active', 'suspended'));

CREATE INDEX IF NOT EXISTS idx_channel_members_status ON public.channel_members(status);

UPDATE public.channel_members
SET status = 'active'
WHERE status IS NULL;

-- Project channels should be private and only visible to active project members
UPDATE public.channels
SET visibility = 'private'
WHERE slug LIKE 'project-%';

-- Backfill project channel membership for all active project members
INSERT INTO public.channel_members (
  channel_id,
  user_id,
  role,
  status,
  joined_at
)
SELECT
  c.id,
  pm.user_id,
  CASE
    WHEN pm.role IN ('owner', 'admin') THEN 'admin'
    ELSE 'member'
  END AS role,
  'active' AS status,
  COALESCE(pm.joined_at, timezone('utc'::text, now())) AS joined_at
FROM public.projects p
JOIN public.channels c
  ON c.workspace_id = p.workspace_id
 AND c.slug IN (
   'project-' || p.id::text,
   'project-' || p.id::text || '-chat',
   'project-' || p.id::text || '-announcements'
 )
JOIN public.project_members pm
  ON pm.project_id = p.id
WHERE pm.user_id IS NOT NULL
  AND pm.status = 'active'
ON CONFLICT (channel_id, user_id) DO UPDATE
  SET role = EXCLUDED.role,
      status = EXCLUDED.status;

-- Rebuild channel policies so private project channels work end-to-end
DROP POLICY IF EXISTS "Users can view workspace channels" ON public.channels;
DROP POLICY IF EXISTS "Workspace members can create channels" ON public.channels;
DROP POLICY IF EXISTS "Channel admins can update" ON public.channels;
DROP POLICY IF EXISTS "Channel admins can delete" ON public.channels;

CREATE POLICY "Users can view workspace channels" ON public.channels
  FOR SELECT USING (
    (
      visibility = 'public'
      AND EXISTS (
        SELECT 1 FROM public.workspace_members
        WHERE workspace_members.workspace_id = channels.workspace_id
          AND workspace_members.user_id = auth.uid()
      )
    )
    OR (
      visibility = 'private'
      AND EXISTS (
        SELECT 1 FROM public.channel_members
        WHERE channel_members.channel_id = channels.id
          AND channel_members.user_id = auth.uid()
          AND channel_members.status = 'active'
      )
    )
  );

CREATE POLICY "Workspace members can create channels" ON public.channels
  FOR INSERT WITH CHECK (
    auth.uid() = created_by
    AND EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_members.workspace_id = channels.workspace_id
        AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Channel admins can update" ON public.channels
  FOR UPDATE USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.channel_members
      WHERE channel_members.channel_id = channels.id
        AND channel_members.user_id = auth.uid()
        AND channel_members.status = 'active'
        AND channel_members.role = 'admin'
    )
  );

CREATE POLICY "Channel admins can delete" ON public.channels
  FOR DELETE USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.channel_members
      WHERE channel_members.channel_id = channels.id
        AND channel_members.user_id = auth.uid()
        AND channel_members.status = 'active'
        AND channel_members.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Users can view channel memberships" ON public.channel_members;
DROP POLICY IF EXISTS "Channel admins can add members" ON public.channel_members;
DROP POLICY IF EXISTS "Channel admins can update roles" ON public.channel_members;
DROP POLICY IF EXISTS "Channel admins can remove members" ON public.channel_members;

CREATE POLICY "Users can view channel memberships" ON public.channel_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.channel_members cm
      WHERE cm.channel_id = channel_members.channel_id
        AND cm.user_id = auth.uid()
        AND cm.status = 'active'
    )
  );

CREATE POLICY "Channel creators can seed their membership" ON public.channel_members
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND role = 'admin'
    AND status = 'active'
    AND EXISTS (
      SELECT 1 FROM public.channels c
      WHERE c.id = channel_members.channel_id
        AND c.created_by = auth.uid()
    )
  );

CREATE POLICY "Channel admins can add members" ON public.channel_members
  FOR INSERT WITH CHECK (
    status = 'active'
    AND EXISTS (
      SELECT 1 FROM public.channel_members cm
      WHERE cm.channel_id = channel_members.channel_id
        AND cm.user_id = auth.uid()
        AND cm.status = 'active'
        AND cm.role = 'admin'
    )
  );

CREATE POLICY "Channel admins can update roles" ON public.channel_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.channel_members cm
      WHERE cm.channel_id = channel_members.channel_id
        AND cm.user_id = auth.uid()
        AND cm.status = 'active'
        AND cm.role = 'admin'
    )
  );

CREATE POLICY "Channel admins can remove members" ON public.channel_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.channel_members cm
      WHERE cm.channel_id = channel_members.channel_id
        AND cm.user_id = auth.uid()
        AND cm.status = 'active'
        AND cm.role = 'admin'
    )
  );

-- Project search documents should only be visible to project owners or active project members
DROP POLICY IF EXISTS "Users can search documents in their org" ON public.search_documents;
DROP POLICY IF EXISTS "System can insert documents" ON public.search_documents;
DROP POLICY IF EXISTS "System can update documents" ON public.search_documents;
DROP POLICY IF EXISTS "System can delete documents" ON public.search_documents;

CREATE POLICY "Users can search non-project documents in their org" ON public.search_documents
  FOR SELECT USING (
    entity_type <> 'project'
    AND organization_id IN (
      SELECT organization_id
      FROM public.organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Project members can search project documents" ON public.search_documents
  FOR SELECT USING (
    entity_type = 'project'
    AND EXISTS (
      SELECT 1
      FROM public.projects p
      WHERE p.id::text = search_documents.entity_id
        AND (
          p.owner_id = auth.uid()
          OR EXISTS (
            SELECT 1
            FROM public.project_members pm
            WHERE pm.project_id = p.id
              AND pm.user_id = auth.uid()
              AND pm.status = 'active'
          )
        )
    )
  );

CREATE POLICY "System can insert documents" ON public.search_documents
  FOR INSERT WITH CHECK (
    entity_type <> 'project'
    OR EXISTS (
      SELECT 1
      FROM public.projects p
      WHERE p.id::text = search_documents.entity_id
        AND (
          p.owner_id = auth.uid()
          OR EXISTS (
            SELECT 1
            FROM public.project_members pm
            WHERE pm.project_id = p.id
              AND pm.user_id = auth.uid()
              AND pm.status = 'active'
          )
        )
    )
  );

CREATE POLICY "System can update documents" ON public.search_documents
  FOR UPDATE USING (
    entity_type <> 'project'
    OR EXISTS (
      SELECT 1
      FROM public.projects p
      WHERE p.id::text = search_documents.entity_id
        AND (
          p.owner_id = auth.uid()
          OR EXISTS (
            SELECT 1
            FROM public.project_members pm
            WHERE pm.project_id = p.id
              AND pm.user_id = auth.uid()
              AND pm.status = 'active'
          )
        )
    )
  )
  WITH CHECK (
    entity_type <> 'project'
    OR EXISTS (
      SELECT 1
      FROM public.projects p
      WHERE p.id::text = search_documents.entity_id
        AND (
          p.owner_id = auth.uid()
          OR EXISTS (
            SELECT 1
            FROM public.project_members pm
            WHERE pm.project_id = p.id
              AND pm.user_id = auth.uid()
              AND pm.status = 'active'
          )
        )
    )
  );

CREATE POLICY "System can delete documents" ON public.search_documents
  FOR DELETE USING (
    entity_type <> 'project'
    OR EXISTS (
      SELECT 1
      FROM public.projects p
      WHERE p.id::text = search_documents.entity_id
        AND (
          p.owner_id = auth.uid()
          OR EXISTS (
            SELECT 1
            FROM public.project_members pm
            WHERE pm.project_id = p.id
              AND pm.user_id = auth.uid()
              AND pm.status = 'active'
          )
        )
    )
  );

-- Audit logs should only be visible to project owners and active project members
DROP POLICY IF EXISTS "Project stakeholders can view audit logs" ON public.audit_logs;

CREATE POLICY "Project stakeholders can view audit logs" ON public.audit_logs
  FOR SELECT USING (
    project_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.projects p
      WHERE p.id = audit_logs.project_id
        AND (
          p.owner_id = auth.uid()
          OR EXISTS (
            SELECT 1
            FROM public.project_members pm
            WHERE pm.project_id = p.id
              AND pm.user_id = auth.uid()
              AND pm.status = 'active'
          )
        )
    )
  );

-- When invitations are claimed, automatically activate the invitee in all private project channels
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
  upserted_channel_members AS (
    INSERT INTO public.channel_members (
      channel_id,
      user_id,
      role,
      status
    )
    SELECT
      c.id,
      p_user_id,
      CASE
        WHEN ei.role IN ('owner', 'admin') THEN 'admin'
        ELSE 'member'
      END,
      'active'
    FROM eligible_invitations ei
    JOIN public.channels c
      ON c.workspace_id = ei.workspace_id
     AND c.slug IN (
       'project-' || ei.project_id::text,
       'project-' || ei.project_id::text || '-chat',
       'project-' || ei.project_id::text || '-announcements'
     )
    ON CONFLICT (channel_id, user_id) DO UPDATE
      SET role = EXCLUDED.role,
          status = EXCLUDED.status,
          joined_at = COALESCE(channel_members.joined_at, NOW())
    RETURNING channel_id, user_id
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
