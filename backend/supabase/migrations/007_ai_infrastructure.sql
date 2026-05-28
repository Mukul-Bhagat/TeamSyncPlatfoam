-- Phase 9: AI Infrastructure Tables
-- ai_summaries, ai_insights, ai_context_memory

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- AI Summaries Table
CREATE TABLE IF NOT EXISTS ai_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
  summary_type TEXT NOT NULL CHECK (summary_type IN ('deployment', 'incident', 'workspace_daily', 'activity_digest', 'unread_summary')),
  source_entity_type TEXT NOT NULL,
  source_entity_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  generated_by TEXT NOT NULL DEFAULT 'system',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for ai_summaries
CREATE INDEX idx_ai_summaries_org ON ai_summaries(organization_id);
CREATE INDEX idx_ai_summaries_workspace ON ai_summaries(workspace_id);
CREATE INDEX idx_ai_summaries_channel ON ai_summaries(channel_id);
CREATE INDEX idx_ai_summaries_type ON ai_summaries(summary_type);
CREATE INDEX idx_ai_summaries_source ON ai_summaries(source_entity_type, source_entity_id);
CREATE INDEX idx_ai_summaries_created ON ai_summaries(created_at DESC);

-- AI Insights Table
CREATE TABLE IF NOT EXISTS ai_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('anomaly_detected', 'deployment_risk', 'incident_pattern', 'activity_spike')),
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  source_event_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for ai_insights
CREATE INDEX idx_ai_insights_org ON ai_insights(organization_id);
CREATE INDEX idx_ai_insights_workspace ON ai_insights(workspace_id);
CREATE INDEX idx_ai_insights_type ON ai_insights(insight_type);
CREATE INDEX idx_ai_insights_severity ON ai_insights(severity);
CREATE INDEX idx_ai_insights_created ON ai_insights(created_at DESC);

-- AI Context Memory Table (future-ready for vector search and RAG)
CREATE TABLE IF NOT EXISTS ai_context_memory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  context_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  embedding_placeholder TEXT, -- Placeholder for future vector embeddings
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for ai_context_memory
CREATE INDEX idx_ai_context_org ON ai_context_memory(organization_id);
CREATE INDEX idx_ai_context_workspace ON ai_context_memory(workspace_id);
CREATE INDEX idx_ai_context_entity ON ai_context_memory(entity_type, entity_id);
CREATE INDEX idx_ai_context_type ON ai_context_memory(context_type);
CREATE INDEX idx_ai_context_created ON ai_context_memory(created_at DESC);

-- Row Level Security Policies

-- ai_summaries RLS
ALTER TABLE ai_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view summaries in their org"
  ON ai_summaries FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "System can insert summaries"
  ON ai_summaries FOR INSERT
  WITH CHECK (true);

-- ai_insights RLS
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view insights in their org"
  ON ai_insights FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "System can insert insights"
  ON ai_insights FOR INSERT
  WITH CHECK (true);

-- ai_context_memory RLS
ALTER TABLE ai_context_memory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view context in their org"
  ON ai_context_memory FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "System can insert context"
  ON ai_context_memory FOR INSERT
  WITH CHECK (true);
