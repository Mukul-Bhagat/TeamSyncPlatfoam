-- Observability Infrastructure Migration
-- This migration creates the infrastructure for enterprise-grade operational observability

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create system_traces table
CREATE TABLE IF NOT EXISTS public.system_traces (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trace_id TEXT NOT NULL,
  span_id TEXT NOT NULL,
  parent_span_id TEXT,
  service_name TEXT NOT NULL,
  operation_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'timeout', 'cancelled')),
  metadata JSONB DEFAULT '{}'::jsonb,
  duration_ms BIGINT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  organization_id UUID,
  workspace_id UUID
);

-- Create system_metrics table
CREATE TABLE IF NOT EXISTS public.system_metrics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  metric_name TEXT NOT NULL,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('counter', 'gauge', 'histogram', 'timing')),
  value DOUBLE PRECISION NOT NULL,
  labels JSONB DEFAULT '{}'::jsonb,
  organization_id UUID,
  workspace_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create dead_letter_events table
CREATE TABLE IF NOT EXISTS public.dead_letter_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  source_system TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  error_message TEXT NOT NULL,
  retry_count INTEGER DEFAULT 0,
  failed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  replayed_at TIMESTAMP WITH TIME ZONE,
  organization_id UUID,
  workspace_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create replay_jobs table
CREATE TABLE IF NOT EXISTS public.replay_jobs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  replay_type TEXT NOT NULL CHECK (replay_type IN ('workflow', 'event', 'indexing', 'AI_pipeline')),
  target_entity TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  replay_context JSONB NOT NULL DEFAULT '{}'::jsonb,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_by UUID,
  organization_id UUID,
  workspace_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create system_health table
CREATE TABLE IF NOT EXISTS public.system_health (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  component_name TEXT NOT NULL,
  subsystem_name TEXT,
  status TEXT NOT NULL CHECK (status IN ('healthy', 'degraded', 'critical')),
  health_score INTEGER CHECK (health_score >= 0 AND health_score <= 100),
  last_check_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  organization_id UUID
);

-- Create alert_rules table
CREATE TABLE IF NOT EXISTS public.alert_rules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  rule_name TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  condition TEXT NOT NULL,
  threshold DOUBLE PRECISION NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  enabled BOOLEAN NOT NULL DEFAULT true,
  organization_id UUID,
  workspace_id UUID,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(organization_id, workspace_id, rule_name)
);

-- Create alert_incidents table
CREATE TABLE IF NOT EXISTS public.alert_incidents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  rule_id UUID NOT NULL REFERENCES public.alert_rules(id) ON DELETE CASCADE,
  triggered_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  resolved_at TIMESTAMP WITH TIME ZONE,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  acknowledged_by UUID,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'acknowledged')),
  metadata JSONB DEFAULT '{}'::jsonb,
  organization_id UUID,
  workspace_id UUID
);

-- Create indexes for system_traces
CREATE INDEX IF NOT EXISTS idx_system_traces_trace_id ON public.system_traces(trace_id);
CREATE INDEX IF NOT EXISTS idx_system_traces_span_id ON public.system_traces(span_id);
CREATE INDEX IF NOT EXISTS idx_system_traces_service_name ON public.system_traces(service_name);
CREATE INDEX IF NOT EXISTS idx_system_traces_started_at ON public.system_traces(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_traces_status ON public.system_traces(status);
CREATE INDEX IF NOT EXISTS idx_system_traces_organization_id ON public.system_traces(organization_id);
CREATE INDEX IF NOT EXISTS idx_system_traces_workspace_id ON public.system_traces(workspace_id);

-- Create indexes for system_metrics
CREATE INDEX IF NOT EXISTS idx_system_metrics_metric_name ON public.system_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_system_metrics_organization_id ON public.system_metrics(organization_id);
CREATE INDEX IF NOT EXISTS idx_system_metrics_workspace_id ON public.system_metrics(workspace_id);
CREATE INDEX IF NOT EXISTS idx_system_metrics_created_at ON public.system_metrics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_metrics_metric_created ON public.system_metrics(metric_name, created_at DESC);

-- Create indexes for dead_letter_events
CREATE INDEX IF NOT EXISTS idx_dead_letter_events_source_system ON public.dead_letter_events(source_system);
CREATE INDEX IF NOT EXISTS idx_dead_letter_events_event_type ON public.dead_letter_events(event_type);
CREATE INDEX IF NOT EXISTS idx_dead_letter_events_failed_at ON public.dead_letter_events(failed_at DESC);
CREATE INDEX IF NOT EXISTS idx_dead_letter_events_replayed_at ON public.dead_letter_events(replayed_at);
CREATE INDEX IF NOT EXISTS idx_dead_letter_events_organization_id ON public.dead_letter_events(organization_id);
CREATE INDEX IF NOT EXISTS idx_dead_letter_events_workspace_id ON public.dead_letter_events(workspace_id);

-- Create indexes for replay_jobs
CREATE INDEX IF NOT EXISTS idx_replay_jobs_replay_type ON public.replay_jobs(replay_type);
CREATE INDEX IF NOT EXISTS idx_replay_jobs_target_entity ON public.replay_jobs(target_entity);
CREATE INDEX IF NOT EXISTS idx_replay_jobs_status ON public.replay_jobs(status);
CREATE INDEX IF NOT EXISTS idx_replay_jobs_started_at ON public.replay_jobs(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_replay_jobs_organization_id ON public.replay_jobs(organization_id);
CREATE INDEX IF NOT EXISTS idx_replay_jobs_workspace_id ON public.replay_jobs(workspace_id);

-- Create indexes for system_health
CREATE INDEX IF NOT EXISTS idx_system_health_component_name ON public.system_health(component_name);
CREATE INDEX IF NOT EXISTS idx_system_health_subsystem_name ON public.system_health(subsystem_name);
CREATE INDEX IF NOT EXISTS idx_system_health_status ON public.system_health(status);
CREATE INDEX IF NOT EXISTS idx_system_health_last_check_at ON public.system_health(last_check_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_health_organization_id ON public.system_health(organization_id);

-- Create indexes for alert_rules
CREATE INDEX IF NOT EXISTS idx_alert_rules_organization_id ON public.alert_rules(organization_id);
CREATE INDEX IF NOT EXISTS idx_alert_rules_workspace_id ON public.alert_rules(workspace_id);
CREATE INDEX IF NOT EXISTS idx_alert_rules_enabled ON public.alert_rules(enabled);
CREATE INDEX IF NOT EXISTS idx_alert_rules_severity ON public.alert_rules(severity);

-- Create indexes for alert_incidents
CREATE INDEX IF NOT EXISTS idx_alert_incidents_rule_id ON public.alert_incidents(rule_id);
CREATE INDEX IF NOT EXISTS idx_alert_incidents_status ON public.alert_incidents(status);
CREATE INDEX IF NOT EXISTS idx_alert_incidents_triggered_at ON public.alert_incidents(triggered_at DESC);
CREATE INDEX IF NOT EXISTS idx_alert_incidents_organization_id ON public.alert_incidents(organization_id);
CREATE INDEX IF NOT EXISTS idx_alert_incidents_workspace_id ON public.alert_incidents(workspace_id);

-- Enable Row Level Security
ALTER TABLE public.system_traces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dead_letter_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.replay_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_incidents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for system_traces
CREATE POLICY "Users can view traces in their organization" ON public.system_traces
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

CREATE POLICY "Service can insert traces" ON public.system_traces
  FOR INSERT WITH CHECK (true);

-- RLS Policies for system_metrics
CREATE POLICY "Users can view metrics in their organization" ON public.system_metrics
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

CREATE POLICY "Service can insert metrics" ON public.system_metrics
  FOR INSERT WITH CHECK (true);

-- RLS Policies for dead_letter_events
CREATE POLICY "Users can view dead letter events in their organization" ON public.dead_letter_events
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

CREATE POLICY "Service can insert dead letter events" ON public.dead_letter_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Organization admins can replay dead letter events" ON public.dead_letter_events
  FOR UPDATE USING (
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

-- RLS Policies for replay_jobs
CREATE POLICY "Users can view replay jobs in their organization" ON public.replay_jobs
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

CREATE POLICY "Service can insert replay jobs" ON public.replay_jobs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service can update replay jobs" ON public.replay_jobs
  FOR UPDATE WITH CHECK (true);

-- RLS Policies for system_health
CREATE POLICY "Users can view health in their organization" ON public.system_health
  FOR SELECT USING (
    organization_id IS NULL
    OR organization_id IN (
      SELECT id FROM public.organizations
      WHERE id = organization_id
      AND EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE organization_members.organization_id = organizations.id
        AND organization_members.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Service can insert health" ON public.system_health
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service can update health" ON public.system_health
  FOR UPDATE WITH CHECK (true);

-- RLS Policies for alert_rules
CREATE POLICY "Users can view alert rules in their organization" ON public.alert_rules
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

CREATE POLICY "Organization members can create alert rules" ON public.alert_rules
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

CREATE POLICY "Alert rule creators can update alert rules" ON public.alert_rules
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

CREATE POLICY "Alert rule creators or admins can delete alert rules" ON public.alert_rules
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

-- RLS Policies for alert_incidents
CREATE POLICY "Users can view alert incidents in their organization" ON public.alert_incidents
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

CREATE POLICY "Service can insert alert incidents" ON public.alert_incidents
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can acknowledge alert incidents" ON public.alert_incidents
  FOR UPDATE USING (
    acknowledged_by = auth.uid()
    OR organization_id IN (
      SELECT id FROM public.organizations
      WHERE id = organization_id
      AND EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE organization_members.organization_id = organizations.id
        AND organization_members.user_id = auth.uid()
      )
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_observability_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at on alert_rules
CREATE TRIGGER update_alert_rules_updated_at BEFORE UPDATE ON public.alert_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_observability_updated_at();

-- Function to clean up old traces (retention policy)
CREATE OR REPLACE FUNCTION public.cleanup_old_traces()
RETURNS void AS $$
BEGIN
  DELETE FROM public.system_traces
  WHERE started_at < timezone('utc'::text, now()) - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old metrics (retention policy)
CREATE OR REPLACE FUNCTION public.cleanup_old_metrics()
RETURNS void AS $$
BEGIN
  DELETE FROM public.system_metrics
  WHERE created_at < timezone('utc'::text, now()) - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Function to clean up resolved alert incidents (retention policy)
CREATE OR REPLACE FUNCTION public.cleanup_old_alert_incidents()
RETURNS void AS $$
BEGIN
  DELETE FROM public.alert_incidents
  WHERE status = 'resolved'
  AND resolved_at < timezone('utc'::text, now()) - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;
