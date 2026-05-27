-- Enable pgcrypto extension for modern UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- EXTEND PROFILES TABLE
-- ============================================

-- Add username and bio columns to profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS username TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT;

-- Add unique constraint on username
ALTER TABLE public.profiles 
  ADD CONSTRAINT profiles_username_unique UNIQUE (username);

-- Add index on username for performance
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- ============================================
-- LEGACY TABLES MARKING
-- ============================================

-- Mark teams table as legacy transitional structure
COMMENT ON TABLE public.teams IS 'LEGACY: Transitional structure for compatibility. New systems should use organizations/workspaces hierarchy.';

-- Mark team_members table as legacy transitional structure  
COMMENT ON TABLE public.team_members IS 'LEGACY: Transitional structure for compatibility. New systems should use organization_members/workspace_members.';

-- ============================================
-- ORGANIZATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT organizations_slug_unique UNIQUE (slug)
);

-- Indexes for organizations
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON public.organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_owner_id ON public.organizations(owner_id);

-- ============================================
-- ORGANIZATION MEMBERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT org_members_unique UNIQUE (organization_id, user_id)
);

-- Indexes for organization_members
CREATE INDEX IF NOT EXISTS idx_org_members_organization_id ON public.organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON public.organization_members(user_id);

-- ============================================
-- WORKSPACES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for workspaces
CREATE INDEX IF NOT EXISTS idx_workspaces_organization_id ON public.workspaces(organization_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_slug ON public.workspaces(slug);
CREATE INDEX IF NOT EXISTS idx_workspaces_created_by ON public.workspaces(created_by);

-- ============================================
-- WORKSPACE MEMBERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'member', 'viewer')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT workspace_members_unique UNIQUE (workspace_id, user_id)
);

-- Indexes for workspace_members
CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace_id ON public.workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_user_id ON public.workspace_members(user_id);

-- ============================================
-- UPDATE PROJECTS TABLE FOR NEW HIERARCHY
-- ============================================

-- Add workspace_id column (nullable for compatibility during transition)
ALTER TABLE public.projects 
  ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE SET NULL;

-- Add index on workspace_id
CREATE INDEX IF NOT EXISTS idx_projects_workspace_id ON public.projects(workspace_id);

-- Mark team_id as deprecated
COMMENT ON COLUMN public.projects.team_id IS 'LEGACY: Transitional field. New systems should use workspace_id instead.';

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES FOR ORGANIZATIONS
-- ============================================

-- Users can view organizations they are members of
CREATE POLICY "Users can view their organizations" ON public.organizations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members.organization_id = organizations.id
      AND organization_members.user_id = auth.uid()
    )
  );

-- Authenticated users can create organizations (as owner)
CREATE POLICY "Users can create organizations" ON public.organizations
  FOR INSERT WITH CHECK (
    auth.uid() = owner_id
  );

-- Organization owners and admins can update organizations
CREATE POLICY "Org owners and admins can update" ON public.organizations
  FOR UPDATE USING (
    owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members.organization_id = organizations.id
      AND organization_members.user_id = auth.uid()
      AND organization_members.role IN ('owner', 'admin')
    )
  );

-- Organization owners can delete organizations
CREATE POLICY "Org owners can delete" ON public.organizations
  FOR DELETE USING (owner_id = auth.uid());

-- ============================================
-- RLS POLICIES FOR ORGANIZATION MEMBERS
-- ============================================

-- Users can view memberships in their organizations
CREATE POLICY "Users can view org memberships" ON public.organization_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.organization_id = organization_members.organization_id
      AND om.user_id = auth.uid()
    )
  );

-- Organization owners and admins can add members
CREATE POLICY "Org owners and admins can add members" ON public.organization_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members.organization_id = organization_members.organization_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.role IN ('owner', 'admin')
    )
  );

-- Organization owners and admins can update member roles
CREATE POLICY "Org owners and admins can update roles" ON public.organization_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members.organization_id = organization_members.organization_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.role IN ('owner', 'admin')
    )
  );

-- Organization owners and admins can remove members
CREATE POLICY "Org owners and admins can remove members" ON public.organization_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members.organization_id = organization_members.organization_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.role IN ('owner', 'admin')
    )
  );

-- ============================================
-- RLS POLICIES FOR WORKSPACES
-- ============================================

-- Users can view workspaces in their organizations
CREATE POLICY "Users can view their workspaces" ON public.workspaces
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members.organization_id = workspaces.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

-- Organization members can create workspaces
CREATE POLICY "Org members can create workspaces" ON public.workspaces
  FOR INSERT WITH CHECK (
    auth.uid() = created_by
    AND EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members.organization_id = workspaces.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

-- Workspace admins can update workspaces
CREATE POLICY "Workspace admins can update" ON public.workspaces
  FOR UPDATE USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_members.workspace_id = workspaces.id
      AND workspace_members.user_id = auth.uid()
      AND workspace_members.role IN ('admin')
    )
  );

-- Workspace admins can delete workspaces
CREATE POLICY "Workspace admins can delete" ON public.workspaces
  FOR DELETE USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_members.workspace_id = workspaces.id
      AND workspace_members.user_id = auth.uid()
      AND workspace_members.role IN ('admin')
    )
  );

-- ============================================
-- RLS POLICIES FOR WORKSPACE MEMBERS
-- ============================================

-- Users can view memberships in their workspaces
CREATE POLICY "Users can view workspace memberships" ON public.workspace_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = workspace_members.workspace_id
      AND wm.user_id = auth.uid()
    )
  );

-- Workspace admins can add members
CREATE POLICY "Workspace admins can add members" ON public.workspace_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_members.workspace_id = workspace_members.workspace_id
      AND workspace_members.user_id = auth.uid()
      AND workspace_members.role IN ('admin')
    )
  );

-- Workspace admins can update member roles
CREATE POLICY "Workspace admins can update roles" ON public.workspace_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_members.workspace_id = workspace_members.workspace_id
      AND workspace_members.user_id = auth.uid()
      AND workspace_members.role IN ('admin')
    )
  );

-- Workspace admins can remove members
CREATE POLICY "Workspace admins can remove members" ON public.workspace_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_members.workspace_id = workspace_members.workspace_id
      AND workspace_members.user_id = auth.uid()
      AND workspace_members.role IN ('admin')
    )
  );

-- ============================================
-- UPDATED_AT TRIGGERS FOR NEW TABLES
-- ============================================

-- Trigger for organizations
CREATE TRIGGER update_organizations_updated_at 
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for workspaces
CREATE TRIGGER update_workspaces_updated_at 
  BEFORE UPDATE ON public.workspaces
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
