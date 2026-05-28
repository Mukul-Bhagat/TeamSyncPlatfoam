-- Phase 10: Search + Knowledge + Memory Infrastructure
-- Enable pgvector and create search_documents, search_embeddings, memory_entities tables

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Search Documents Table
CREATE TABLE IF NOT EXISTS search_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('message', 'summary', 'incident', 'deployment', 'activity', 'workspace', 'channel')),
  entity_id TEXT NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  searchable_text TEXT NOT NULL,
  embedding vector(1536), -- OpenAI text-embedding-3-small dimension
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for search_documents
CREATE INDEX idx_search_documents_org ON search_documents(organization_id);
CREATE INDEX idx_search_documents_workspace ON search_documents(workspace_id);
CREATE INDEX idx_search_documents_entity ON search_documents(entity_type, entity_id);
CREATE INDEX idx_search_documents_created ON search_documents(created_at DESC);
CREATE INDEX idx_search_documents_searchable ON search_documents USING gin(searchable_text gin_trgm_ops);
-- Vector similarity index (ivfflat for approximate nearest neighbor)
CREATE INDEX idx_search_documents_embedding ON search_documents USING ivfflat(embedding vector_cosine_ops) WITH (lists = 100);

-- Search Embeddings Table
CREATE TABLE IF NOT EXISTS search_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES search_documents(id) ON DELETE CASCADE,
  embedding_provider TEXT NOT NULL DEFAULT 'openai',
  embedding_model TEXT NOT NULL DEFAULT 'text-embedding-3-small',
  vector vector(1536),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for search_embeddings
CREATE INDEX idx_search_embeddings_document ON search_embeddings(document_id);
CREATE INDEX idx_search_embeddings_provider ON search_embeddings(embedding_provider);
CREATE INDEX idx_search_embeddings_model ON search_embeddings(embedding_model);
CREATE INDEX idx_search_embeddings_vector ON search_embeddings USING ivfflat(vector vector_cosine_ops) WITH (lists = 100);

-- Memory Entities Table
CREATE TABLE IF NOT EXISTS memory_entities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  memory_type TEXT NOT NULL CHECK (memory_type IN ('important_incident', 'deployment_pattern', 'operational_decision', 'recurring_issue', 'ai_generated_memory')),
  source_entity_type TEXT NOT NULL,
  source_entity_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  importance_score FLOAT NOT NULL DEFAULT 0.5 CHECK (importance_score >= 0 AND importance_score <= 1),
  metadata JSONB DEFAULT '{}',
  embedding vector(1536),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for memory_entities
CREATE INDEX idx_memory_entities_org ON memory_entities(organization_id);
CREATE INDEX idx_memory_entities_workspace ON memory_entities(workspace_id);
CREATE INDEX idx_memory_entities_type ON memory_entities(memory_type);
CREATE INDEX idx_memory_entities_importance ON memory_entities(importance_score DESC);
CREATE INDEX idx_memory_entities_source ON memory_entities(source_entity_type, source_entity_id);
CREATE INDEX idx_memory_entities_created ON memory_entities(created_at DESC);
CREATE INDEX idx_memory_entities_embedding ON memory_entities USING ivfflat(embedding vector_cosine_ops) WITH (lists = 100);

-- Enable pg_trgm for trigram text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Row Level Security Policies

-- search_documents RLS
ALTER TABLE search_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can search documents in their org"
  ON search_documents FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "System can insert documents"
  ON search_documents FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update documents"
  ON search_documents FOR UPDATE
  WITH CHECK (true);

-- search_embeddings RLS
ALTER TABLE search_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access embeddings via documents"
  ON search_embeddings FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM search_documents
    WHERE search_documents.id = search_embeddings.document_id
    AND search_documents.organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "System can insert embeddings"
  ON search_embeddings FOR INSERT
  WITH CHECK (true);

-- memory_entities RLS
ALTER TABLE memory_entities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view memories in their org"
  ON memory_entities FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "System can insert memories"
  ON memory_entities FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update memories"
  ON memory_entities FOR UPDATE
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for search_documents updated_at
CREATE TRIGGER update_search_documents_updated_at
  BEFORE UPDATE ON search_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
