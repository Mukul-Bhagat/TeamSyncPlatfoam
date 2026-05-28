-- Ecosystem Events and Integration Configs Migration
-- This migration creates the infrastructure for the ecosystem event bus

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ecosystem_events table
CREATE TABLE IF NOT EXISTS public.ecosystem_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  source_app TEXT NOT NULL,
  organization_id UUID NOT NULL,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE SET NULL,
  channel_id UUID REFERENCES public.channels(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  event_version TEXT NOT NULL DEFAULT '1.0',
  payload JSONB NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  correlation_id TEXT,
  triggered_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Create integration_configs table
CREATE TABLE IF NOT EXISTS public.integration_configs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID NOT NULL,
  integration_name TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  config JSONB DEFAULT '{}'::jsonb,
  secrets_reference TEXT,
  webhook_url TEXT,
  webhook_secret TEXT,
  api_key TEXT,
  health_status TEXT DEFAULT 'unknown' CHECK (health_status IN ('unknown', 'healthy', 'degraded', 'unhealthy')),
  last_heartbeat TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(organization_id, integration_name)
);

-- Create indexes for ecosystem_events
CREATE INDEX IF NOT EXISTS idx_ecosystem_events_source_app ON public.ecosystem_events(source_app);
CREATE INDEX IF NOT EXISTS idx_ecosystem_events_event_type ON public.ecosystem_events(event_type);
CREATE INDEX IF NOT EXISTS idx_ecosystem_events_organization_id ON public.ecosystem_events(organization_id);
CREATE INDEX IF NOT EXISTS idx_ecosystem_events_created_at ON public.ecosystem_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ecosystem_events_correlation_id ON public.ecosystem_events(correlation_id);
CREATE INDEX IF NOT EXISTS idx_ecosystem_events_workspace_id ON public.ecosystem_events(workspace_id);
CREATE INDEX IF NOT EXISTS idx_ecosystem_events_channel_id ON public.ecosystem_events(channel_id);
CREATE INDEX IF NOT EXISTS idx_ecosystem_events_severity ON public.ecosystem_events(severity);

-- Create indexes for integration_configs
CREATE INDEX IF NOT EXISTS idx_integration_configs_organization_id ON public.integration_configs(organization_id);
CREATE INDEX IF NOT EXISTS idx_integration_configs_integration_name ON public.integration_configs(integration_name);
CREATE INDEX IF NOT EXISTS idx_integration_configs_enabled ON public.integration_configs(enabled);

-- Enable Row Level Security
ALTER TABLE public.ecosystem_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_configs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ecosystem_events
CREATE POLICY "Users can view ecosystem events in their organization" ON public.ecosystem_events
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

CREATE POLICY "Service can insert ecosystem events" ON public.ecosystem_events
  FOR INSERT WITH CHECK (true);

-- RLS Policies for integration_configs
CREATE POLICY "Users can view integration configs in their organization" ON public.integration_configs
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

CREATE POLICY "Organization admins can manage integration configs" ON public.integration_configs
  FOR ALL USING (
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

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_integration_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at on integration_configs
CREATE TRIGGER update_integration_configs_updated_at BEFORE UPDATE ON public.integration_configs
  FOR EACH ROW EXECUTE FUNCTION public.update_integration_updated_at();

-- Function to set processed_at on event processing
CREATE OR REPLACE FUNCTION public.set_event_processed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.processed_at IS NULL AND OLD.processed_at IS NULL THEN
    NEW.processed_at = timezone('utc'::text, now());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for processed_at (optional, can be triggered by application logic)
-- CREATE TRIGGER set_ecosystem_events_processed_at BEFORE UPDATE ON public.ecosystem_events
--   FOR EACH ROW EXECUTE FUNCTION public.set_event_processed_at();
