-- Make workspace organization_id nullable to support Personal Workspaces
ALTER TABLE public.workspaces ALTER COLUMN organization_id DROP NOT NULL;

-- Update handle_new_user to create Personal Workspace
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_workspace_id UUID;
  v_user_name TEXT;
BEGIN
  -- 1. Create Profile
  v_user_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1), 'User');
  
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );

  -- 2. Create Personal Workspace
  INSERT INTO public.workspaces (
    organization_id,
    name,
    slug,
    description,
    created_by
  ) VALUES (
    NULL,
    v_user_name || '''s Workspace',
    'personal-' || NEW.id,
    'Your personal workspace',
    NEW.id
  ) RETURNING id INTO v_workspace_id;

  -- 3. Create Workspace Membership (Admin)
  INSERT INTO public.workspace_members (
    workspace_id,
    user_id,
    role,
    joined_at
  ) VALUES (
    v_workspace_id,
    NEW.id,
    'admin',
    now()
  );

  -- 4. Create General Channel for Personal Workspace
  INSERT INTO public.channels (
    workspace_id,
    name,
    slug,
    type,
    visibility,
    created_by
  ) VALUES (
    v_workspace_id,
    'General',
    'general',
    'text',
    'public',
    NEW.id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- RPC: create_organization_flow
CREATE OR REPLACE FUNCTION public.create_organization_flow(
  p_name TEXT,
  p_slug TEXT,
  p_logo_url TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_org_id UUID;
  v_workspace_id UUID;
  v_user_id UUID := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 1. Create Organization
  INSERT INTO public.organizations (name, slug, logo_url, owner_id)
  VALUES (p_name, p_slug, p_logo_url, v_user_id)
  RETURNING id INTO v_org_id;

  -- 2. Create Organization Membership
  INSERT INTO public.organization_members (organization_id, user_id, role, joined_at)
  VALUES (v_org_id, v_user_id, 'owner', now());

  -- 3. Create Default Workspace
  INSERT INTO public.workspaces (organization_id, name, slug, description, created_by)
  VALUES (v_org_id, 'Default Workspace', 'default', 'Default workspace for ' || p_name, v_user_id)
  RETURNING id INTO v_workspace_id;

  -- 4. Create Workspace Membership
  INSERT INTO public.workspace_members (workspace_id, user_id, role, joined_at)
  VALUES (v_workspace_id, v_user_id, 'admin', now());

  -- 5. Create Default Channels
  INSERT INTO public.channels (workspace_id, name, slug, type, visibility, created_by)
  VALUES 
    (v_workspace_id, 'General', 'general', 'text', 'public', v_user_id),
    (v_workspace_id, 'Announcements', 'announcements', 'announcement', 'public', v_user_id);

  RETURN jsonb_build_object(
    'organization_id', v_org_id,
    'workspace_id', v_workspace_id
  );
END;
$$;


-- RPC: create_workspace_flow
CREATE OR REPLACE FUNCTION public.create_workspace_flow(
  p_organization_id UUID,
  p_name TEXT,
  p_slug TEXT,
  p_description TEXT,
  p_icon TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_workspace_id UUID;
  v_user_id UUID := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Verify user is part of the organization
  IF p_organization_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_id = p_organization_id AND user_id = v_user_id
    ) THEN
      RAISE EXCEPTION 'Not a member of the organization';
    END IF;
  END IF;

  -- 1. Create Workspace
  INSERT INTO public.workspaces (organization_id, name, slug, description, icon, created_by)
  VALUES (p_organization_id, p_name, p_slug, p_description, p_icon, v_user_id)
  RETURNING id INTO v_workspace_id;

  -- 2. Create Workspace Membership
  INSERT INTO public.workspace_members (workspace_id, user_id, role, joined_at)
  VALUES (v_workspace_id, v_user_id, 'admin', now());

  -- 3. Create General Channel
  INSERT INTO public.channels (workspace_id, name, slug, type, visibility, created_by)
  VALUES (v_workspace_id, 'General', 'general', 'text', 'public', v_user_id);

  RETURN jsonb_build_object('workspace_id', v_workspace_id);
END;
$$;


-- RPC: create_project_flow
CREATE OR REPLACE FUNCTION public.create_project_flow(
  p_workspace_id UUID,
  p_name TEXT,
  p_description TEXT,
  p_color TEXT,
  p_icon TEXT,
  p_visibility TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_project_id UUID;
  v_user_id UUID := auth.uid();
  v_user_email TEXT;
  v_channel_gen UUID;
  v_channel_ann UUID;
  v_channel_act UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get user email
  SELECT email INTO v_user_email FROM public.profiles WHERE id = v_user_id;

  -- 1. Create Project
  INSERT INTO public.projects (
    workspace_id, name, description, color, icon, visibility, owner_id, created_by, status
  )
  VALUES (
    p_workspace_id, p_name, p_description, p_color, p_icon, p_visibility, v_user_id, v_user_id, 'active'
  )
  RETURNING id INTO v_project_id;

  -- 2. Create Project Membership (Owner)
  INSERT INTO public.project_members (
    project_id, user_id, email, role, status, joined_at
  )
  VALUES (
    v_project_id, v_user_id, COALESCE(v_user_email, 'unknown@example.com'), 'owner', 'active', now()
  );

  -- 3. Create Project Channels
  -- General Chat
  INSERT INTO public.channels (workspace_id, name, slug, type, visibility, created_by)
  VALUES (p_workspace_id, p_name || ' Chat', 'project-' || v_project_id || '-chat', 'text', 'private', v_user_id)
  RETURNING id INTO v_channel_gen;

  -- Announcements
  INSERT INTO public.channels (workspace_id, name, slug, type, visibility, created_by)
  VALUES (p_workspace_id, p_name || ' Announcements', 'project-' || v_project_id || '-announcements', 'announcement', 'private', v_user_id)
  RETURNING id INTO v_channel_ann;

  -- Activity/Log
  INSERT INTO public.channels (workspace_id, name, slug, type, visibility, created_by)
  VALUES (p_workspace_id, p_name || ' Activity', 'project-' || v_project_id || '-activity', 'activity_feed', 'private', v_user_id)
  RETURNING id INTO v_channel_act;

  -- 4. Create Channel Memberships for Owner
  INSERT INTO public.channel_members (channel_id, user_id, role, status, joined_at)
  VALUES 
    (v_channel_gen, v_user_id, 'admin', 'active', now()),
    (v_channel_ann, v_user_id, 'admin', 'active', now()),
    (v_channel_act, v_user_id, 'admin', 'active', now());

  RETURN jsonb_build_object(
    'project_id', v_project_id,
    'channels', jsonb_build_array(v_channel_gen, v_channel_ann, v_channel_act)
  );
END;
$$;
