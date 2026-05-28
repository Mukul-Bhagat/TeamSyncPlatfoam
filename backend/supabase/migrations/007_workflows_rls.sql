-- Workflow Tables RLS Policies Migration
-- This migration adds Row Level Security policies for workflow-related tables

-- Enable Row Level Security on workflow tables
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.command_capabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_capabilities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workflows
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

CREATE POLICY "Organization admins can create workflows" ON public.workflows
  FOR INSERT WITH CHECK (
    organization_id IN (
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

CREATE POLICY "Workflow creators and admins can update workflows" ON public.workflows
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

CREATE POLICY "Workflow creators and admins can delete workflows" ON public.workflows
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
CREATE POLICY "Users can view executions in their organization" ON public.workflow_executions
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

CREATE POLICY "Service can insert workflow_executions" ON public.workflow_executions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service can update workflow_executions" ON public.workflow_executions
  FOR UPDATE WITH CHECK (true);

-- RLS Policies for workflow_actions
CREATE POLICY "Users can view actions in their organization" ON public.workflow_actions
  FOR SELECT USING (
    execution_id IN (
      SELECT id FROM public.workflow_executions
      WHERE organization_id IN (
        SELECT id FROM public.organizations
        WHERE EXISTS (
          SELECT 1 FROM public.organization_members
          WHERE organization_members.organization_id = organizations.id
          AND organization_members.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Service can insert workflow_actions" ON public.workflow_actions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service can update workflow_actions" ON public.workflow_actions
  FOR UPDATE WITH CHECK (true);

-- RLS Policies for workflow_approvals
CREATE POLICY "Users can view approvals they requested or are approvers for" ON public.workflow_approvals
  FOR SELECT USING (
    requested_by = auth.uid()
    OR approver_id = auth.uid()
    OR execution_id IN (
      SELECT id FROM public.workflow_executions
      WHERE organization_id IN (
        SELECT id FROM public.organizations
        WHERE EXISTS (
          SELECT 1 FROM public.organization_members
          WHERE organization_members.organization_id = organizations.id
          AND organization_members.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can create approvals" ON public.workflow_approvals
  FOR INSERT WITH CHECK (
    requested_by = auth.uid()
    AND execution_id IN (
      SELECT id FROM public.workflow_executions
      WHERE organization_id IN (
        SELECT id FROM public.organizations
        WHERE EXISTS (
          SELECT 1 FROM public.organization_members
          WHERE organization_members.organization_id = organizations.id
          AND organization_members.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Approvers can update approvals" ON public.workflow_approvals
  FOR UPDATE USING (
    approver_id = auth.uid()
    OR requested_by = auth.uid()
  );

-- RLS Policies for workflow_schedules
CREATE POLICY "Users can view schedules in their organization" ON public.workflow_schedules
  FOR SELECT USING (
    workflow_id IN (
      SELECT id FROM public.workflows
      WHERE organization_id IN (
        SELECT id FROM public.organizations
        WHERE EXISTS (
          SELECT 1 FROM public.organization_members
          WHERE organization_members.organization_id = organizations.id
          AND organization_members.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Organization admins can manage schedules" ON public.workflow_schedules
  FOR ALL USING (
    workflow_id IN (
      SELECT id FROM public.workflows
      WHERE organization_id IN (
        SELECT id FROM public.organizations
        WHERE EXISTS (
          SELECT 1 FROM public.organization_members
          WHERE organization_members.organization_id = organizations.id
          AND organization_members.user_id = auth.uid()
          AND organization_members.role IN ('admin', 'owner')
        )
      )
    )
  );

-- RLS Policies for command_capabilities
CREATE POLICY "All users can view command capabilities" ON public.command_capabilities
  FOR SELECT USING (true);

CREATE POLICY "Service can manage command capabilities" ON public.command_capabilities
  FOR ALL WITH CHECK (true);

-- RLS Policies for user_capabilities
CREATE POLICY "Users can view their own capabilities" ON public.user_capabilities
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Organization admins can view all capabilities in their organization" ON public.user_capabilities
  FOR SELECT USING (
    user_id IN (
      SELECT user_id FROM public.organization_members
      WHERE organization_id IN (
        SELECT id FROM public.organizations
        WHERE EXISTS (
          SELECT 1 FROM public.organization_members
          WHERE organization_members.organization_id = organizations.id
          AND organization_members.user_id = auth.uid()
          AND organization_members.role IN ('admin', 'owner')
        )
      )
    )
  );

CREATE POLICY "Organization admins can grant capabilities" ON public.user_capabilities
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members.user_id = auth.uid()
      AND organization_members.role IN ('admin', 'owner')
    )
  );

CREATE POLICY "Organization admins can revoke capabilities" ON public.user_capabilities
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members.user_id = auth.uid()
      AND organization_members.role IN ('admin', 'owner')
    )
  );

-- Function to cleanup expired capabilities
CREATE OR REPLACE FUNCTION public.cleanup_expired_capabilities()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.user_capabilities
  WHERE expires_at IS NOT NULL
  AND expires_at < timezone('utc'::text, now());
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on cleanup function to service role
GRANT EXECUTE ON FUNCTION public.cleanup_expired_capabilities() TO service_role;
