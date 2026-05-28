-- Workflow Infrastructure Migration
-- This migration creates the infrastructure for workflow orchestration and automation

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create workflows table
CREATE TABLE IF NOT EXISTS public.workflows (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID NOT NULL,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('event', 'schedule', 'manual', 'AI', 'command')),
  workflow_definition JSONB NOT NULL DEFAULT '{}'::jsonb,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create workflow_executions table
CREATE TABLE IF NOT EXISTS public.workflow_executions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  workflow_id UUID NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  trigger_event_id UUID REFERENCES public.ecosystem_events(id) ON DELETE SET NULL,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  execution_context JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create workflow_actions table
CREATE TABLE IF NOT EXISTS public.workflow_actions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  workflow_id UUID NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  action_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  execution_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create workflow_approvals table
CREATE TABLE IF NOT EXISTS public.workflow_approvals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  workflow_execution_id UUID NOT NULL REFERENCES public.workflow_executions(id) ON DELETE CASCADE,
  approver_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  comments TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create workflow_schedules table
CREATE TABLE IF NOT EXISTS public.workflow_schedules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  workflow_id UUID NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
  schedule_expression TEXT NOT NULL,
  next_run_at TIMESTAMP WITH TIME ZONE NOT NULL,
  last_run_at TIMESTAMP WITH TIME ZONE,
  enabled BOOLEAN NOT NULL DEFAULT true,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create command_capabilities table
CREATE TABLE IF NOT EXISTS public.command_capabilities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  command_name TEXT NOT NULL UNIQUE,
  capability_name TEXT NOT NULL UNIQUE,
  description TEXT,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create user_capabilities table
CREATE TABLE IF NOT EXISTS public.user_capabilities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL,
  capability_name TEXT NOT NULL,
  granted_by UUID NOT NULL,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, capability_name)
);

-- Create indexes for workflows
CREATE INDEX IF NOT EXISTS idx_workflows_organization_id ON public.workflows(organization_id);
CREATE INDEX IF NOT EXISTS idx_workflows_workspace_id ON public.workflows(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workflows_trigger_type ON public.workflows(trigger_type);
CREATE INDEX IF NOT EXISTS idx_workflows_enabled ON public.workflows(enabled);
CREATE INDEX IF NOT EXISTS idx_workflows_created_by ON public.workflows(created_by);

-- Create indexes for workflow_executions
CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow_id ON public.workflow_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON public.workflow_executions(status);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_trigger_event_id ON public.workflow_executions(trigger_event_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_started_at ON public.workflow_executions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_created_at ON public.workflow_executions(created_at DESC);

-- Create indexes for workflow_actions
CREATE INDEX IF NOT EXISTS idx_workflow_actions_workflow_id ON public.workflow_actions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_actions_action_type ON public.workflow_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_workflow_actions_execution_order ON public.workflow_actions(execution_order);

-- Create indexes for workflow_approvals
CREATE INDEX IF NOT EXISTS idx_workflow_approvals_workflow_execution_id ON public.workflow_approvals(workflow_execution_id);
CREATE INDEX IF NOT EXISTS idx_workflow_approvals_approver_id ON public.workflow_approvals(approver_id);
CREATE INDEX IF NOT EXISTS idx_workflow_approvals_status ON public.workflow_approvals(status);
CREATE INDEX IF NOT EXISTS idx_workflow_approvals_created_at ON public.workflow_approvals(created_at DESC);

-- Create indexes for workflow_schedules
CREATE INDEX IF NOT EXISTS idx_workflow_schedules_workflow_id ON public.workflow_schedules(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_schedules_next_run_at ON public.workflow_schedules(next_run_at);
CREATE INDEX IF NOT EXISTS idx_workflow_schedules_enabled ON public.workflow_schedules(enabled);

-- Create indexes for command_capabilities
CREATE INDEX IF NOT EXISTS idx_command_capabilities_command_name ON public.command_capabilities(command_name);
CREATE INDEX IF NOT EXISTS idx_command_capabilities_capability_name ON public.command_capabilities(capability_name);
CREATE INDEX IF NOT EXISTS idx_command_capabilities_enabled ON public.command_capabilities(enabled);

-- Create indexes for user_capabilities
CREATE INDEX IF NOT EXISTS idx_user_capabilities_user_id ON public.user_capabilities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_capabilities_capability_name ON public.user_capabilities(capability_name);
CREATE INDEX IF NOT EXISTS idx_user_capabilities_granted_at ON public.user_capabilities(granted_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_capabilities_expires_at ON public.user_capabilities(expires_at);

-- Enable Row Level Security
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.command_capabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_capabilities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workflows
DROP POLICY IF EXISTS "Users can view workflows in their organization" ON public.workflows;
CREATE POLICY "Users can view workflows in their organization" ON public.workflows
  FOR SELECT USING (
    organization_id IN (
      SELECT id FROM public.organizations
      WHERE id = organization_id
      AND EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE organization_members.organization_id = organizations.id
        AND organization_members.user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Organization members can create workflows" ON public.workflows;
CREATE POLICY "Organization members can create workflows" ON public.workflows
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT id FROM public.organizations
      WHERE id = organization_id
      AND EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE organization_members.organization_id = organizations.id
        AND organization_members.user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Workflow creators can update workflows" ON public.workflows;
CREATE POLICY "Workflow creators can update workflows" ON public.workflows
  FOR UPDATE USING (
    created_by = auth.uid()
    OR organization_id IN (
      SELECT id FROM public.organizations
      WHERE id = organization_id
      AND EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE organization_members.organization_id = organizations.id
        AND organization_members.user_id = auth.uid()
        AND organization_members.role IN ('admin', 'owner')
      )
    )
  );

DROP POLICY IF EXISTS "Workflow creators or admins can delete workflows" ON public.workflows;
CREATE POLICY "Workflow creators or admins can delete workflows" ON public.workflows
  FOR DELETE USING (
    created_by = auth.uid()
    OR organization_id IN (
      SELECT id FROM public.organizations
      WHERE id = organization_id
      AND EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE organization_members.organization_id = organizations.id
        AND organization_members.user_id = auth.uid()
        AND organization_members.role IN ('admin', 'owner')
      )
    )
  );

-- RLS Policies for workflow_executions
DROP POLICY IF EXISTS "Users can view executions in their organization" ON public.workflow_executions;
CREATE POLICY "Users can view executions in their organization" ON public.workflow_executions
  FOR SELECT USING (
    workflow_id IN (
      SELECT id FROM public.workflows
      WHERE organization_id IN (
        SELECT id FROM public.organizations
        WHERE id = organization_id
        AND EXISTS (
          SELECT 1 FROM public.organization_members
          WHERE organization_members.organization_id = organizations.id
          AND organization_members.user_id = auth.uid()
        )
      )
    )
  );

DROP POLICY IF EXISTS "Service can insert executions" ON public.workflow_executions;
CREATE POLICY "Service can insert executions" ON public.workflow_executions
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Service can update executions" ON public.workflow_executions;
CREATE POLICY "Service can update executions" ON public.workflow_executions
  FOR UPDATE WITH CHECK (true);

-- RLS Policies for workflow_actions
DROP POLICY IF EXISTS "Users can view actions in their organization" ON public.workflow_actions;
CREATE POLICY "Users can view actions in their organization" ON public.workflow_actions
  FOR SELECT USING (
    workflow_id IN (
      SELECT id FROM public.workflows
      WHERE organization_id IN (
        SELECT id FROM public.organizations
        WHERE id = organization_id
        AND EXISTS (
          SELECT 1 FROM public.organization_members
          WHERE organization_members.organization_id = organizations.id
          AND organization_members.user_id = auth.uid()
        )
      )
    )
  );

DROP POLICY IF EXISTS "Service can manage actions" ON public.workflow_actions;
CREATE POLICY "Service can manage actions" ON public.workflow_actions
  FOR ALL WITH CHECK (true);

-- RLS Policies for workflow_approvals
DROP POLICY IF EXISTS "Users can view approvals in their organization" ON public.workflow_approvals;
CREATE POLICY "Users can view approvals in their organization" ON public.workflow_approvals
  FOR SELECT USING (
    workflow_execution_id IN (
      SELECT id FROM public.workflow_executions
      WHERE workflow_id IN (
        SELECT id FROM public.workflows
        WHERE organization_id IN (
          SELECT id FROM public.organizations
          WHERE id = organization_id
          AND EXISTS (
            SELECT 1 FROM public.organization_members
            WHERE organization_members.organization_id = organizations.id
            AND organization_members.user_id = auth.uid()
          )
        )
      )
    )
  );

DROP POLICY IF EXISTS "Users can create approvals" ON public.workflow_approvals;
CREATE POLICY "Users can create approvals" ON public.workflow_approvals
  FOR INSERT WITH CHECK (
    approver_id = auth.uid()
    AND workflow_execution_id IN (
      SELECT id FROM public.workflow_executions
      WHERE workflow_id IN (
        SELECT id FROM public.workflows
        WHERE organization_id IN (
          SELECT id FROM public.organizations
          WHERE id = organization_id
          AND EXISTS (
            SELECT 1 FROM public.organization_members
            WHERE organization_members.organization_id = organizations.id
            AND organization_members.user_id = auth.uid()
          )
        )
      )
    )
  );

DROP POLICY IF EXISTS "Approvers can update approvals" ON public.workflow_approvals;
CREATE POLICY "Approvers can update approvals" ON public.workflow_approvals
  FOR UPDATE USING (
    approver_id = auth.uid()
  );

-- RLS Policies for workflow_schedules
DROP POLICY IF EXISTS "Users can view schedules in their organization" ON public.workflow_schedules;
CREATE POLICY "Users can view schedules in their organization" ON public.workflow_schedules
  FOR SELECT USING (
    workflow_id IN (
      SELECT id FROM public.workflows
      WHERE organization_id IN (
        SELECT id FROM public.organizations
        WHERE id = organization_id
        AND EXISTS (
          SELECT 1 FROM public.organization_members
          WHERE organization_members.organization_id = organizations.id
          AND organization_members.user_id = auth.uid()
        )
      )
    )
  );

DROP POLICY IF EXISTS "Service can manage schedules" ON public.workflow_schedules;
CREATE POLICY "Service can manage schedules" ON public.workflow_schedules
  FOR ALL WITH CHECK (true);

-- RLS Policies for command_capabilities
DROP POLICY IF EXISTS "Everyone can view command capabilities" ON public.command_capabilities;
CREATE POLICY "Everyone can view command capabilities" ON public.command_capabilities
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service can manage command capabilities" ON public.command_capabilities;
CREATE POLICY "Service can manage command capabilities" ON public.command_capabilities
  FOR ALL WITH CHECK (true);

-- RLS Policies for user_capabilities
DROP POLICY IF EXISTS "Users can view their own capabilities" ON public.user_capabilities;
CREATE POLICY "Users can view their own capabilities" ON public.user_capabilities
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can view capabilities in their organization" ON public.user_capabilities;
CREATE POLICY "Users can view capabilities in their organization" ON public.user_capabilities
  FOR SELECT USING (
    user_id IN (
      SELECT user_id FROM public.organization_members
      WHERE organization_id IN (
        SELECT organization_id FROM public.organization_members
        WHERE user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Service can manage user capabilities" ON public.user_capabilities;
CREATE POLICY "Service can manage user capabilities" ON public.user_capabilities
  FOR ALL WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_workflow_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at on workflows
DROP TRIGGER IF EXISTS update_workflows_updated_at ON public.workflows;
CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON public.workflows
  FOR EACH ROW EXECUTE FUNCTION public.update_workflow_updated_at();

-- Trigger for updated_at on workflow_schedules
DROP TRIGGER IF EXISTS update_workflow_schedules_updated_at ON public.workflow_schedules;
CREATE TRIGGER update_workflow_schedules_updated_at BEFORE UPDATE ON public.workflow_schedules
  FOR EACH ROW EXECUTE FUNCTION public.update_workflow_updated_at();

-- Function to clean up expired user capabilities
CREATE OR REPLACE FUNCTION public.cleanup_expired_capabilities()
RETURNS void AS $$
BEGIN
  DELETE FROM public.user_capabilities
  WHERE expires_at IS NOT NULL
  AND expires_at < timezone('utc'::text, now());
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission on cleanup function to service role
GRANT EXECUTE ON FUNCTION public.cleanup_expired_capabilities() TO service_role;
