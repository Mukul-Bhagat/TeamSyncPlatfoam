# TeamSync Production Architecture Review & Redesign

## Executive Summary

This document presents a complete architectural redesign of TeamSync's collaboration module to achieve production-grade scalability from 10 to 100,000+ users. The redesign is inspired by industry leaders: Slack, ClickUp, Linear, Discord, Notion, Jira, and Microsoft Teams.

**Key Changes:**
- Projects as complete workspaces (not just chat)
- Project dashboard as default landing page
- Complete task management system
- Project knowledge base with wiki and decisions
- Unified search across all entities
- AI-ready architecture with vector embeddings
- Enterprise-grade real-time with Redis Pub/Sub
- Production notification system
- Multi-tenancy with Organization > Team > Project hierarchy
- Database partitioning for 100M+ messages
- Comprehensive security with RBAC + ABAC

---

## Current Architecture Analysis

### Critical Gaps Identified

| Area | Current State | Gap | Impact |
|------|--------------|-----|--------|
| **Project Scope** | Chat-focused | No task management, wiki, decisions | Limited value proposition |
| **Dashboard** | None | No project overview | Poor user experience |
| **Search** | Basic message search | No unified search | Information silos |
| **AI Readiness** | None | No embeddings, no RAG | Future technical debt |
| **Real-Time** | Supabase Realtime | No Redis, no presence | Scalability bottleneck |
| **Notifications** | Basic | No queue, no multi-channel | Poor user engagement |
| **Multi-Tenancy** | Flat structure | No organization hierarchy | Enterprise blocker |
| **Scalability** | Single database | No partitioning, no caching | Won't scale to 100K users |
| **Security** | RLS only | No ABAC, no audit logs | Compliance risk |
| **File Storage** | Supabase only | No abstraction layer | Migration pain |

### Technical Debt Risks

1. **Database Schema**: Not partitioned, will fail at 100M messages
2. **Search**: No vector search, no hybrid search
3. **Real-Time**: Direct database queries, no caching layer
4. **Notifications**: No queue, will block at scale
5. **File Storage**: Tightly coupled to Supabase
6. **AI**: No embeddings infrastructure
7. **Multi-Tenancy**: No organization isolation
8. **Audit Logging**: Not immutable, compliance risk

---

## Improved Database Schema

### Core Hierarchy

```
Organization (tenant)
├── Team (department/group)
│   ├── Project (workspace)
│   │   ├── Channel (communication)
│   │   ├── Task (work item)
│   │   ├── Wiki (knowledge)
│   │   ├── Decision (decision log)
│   │   ├── Meeting (scheduling)
│   │   └── File (storage)
│   └── Member (team member)
└── Organization Member (org-wide access)
```

### New Tables Required

#### 1. Organization & Multi-Tenancy

```sql
-- Organizations (Tenants)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  logo_url TEXT,
  domain VARCHAR(255), -- For SSO
  settings JSONB DEFAULT '{}',
  plan VARCHAR(50) DEFAULT 'free', -- free, pro, enterprise
  max_members INTEGER DEFAULT 10,
  max_projects INTEGER DEFAULT 5,
  max_storage_gb INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Organization Members
CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'member', -- owner, admin, member
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

-- Teams (Departments/Groups)
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(7),
  icon VARCHAR(50),
  parent_team_id UUID REFERENCES teams(id),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  UNIQUE(organization_id, slug)
);

-- Team Members
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'member', -- owner, admin, manager, member
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);
```

#### 2. Task Management System

```sql
-- Tasks
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  parent_task_id UUID REFERENCES tasks(id), -- For subtasks
  title VARCHAR(500) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'todo', -- backlog, todo, in_progress, review, testing, completed, blocked
  priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, urgent
  assignee_id UUID REFERENCES profiles(id),
  reporter_id UUID REFERENCES profiles(id) NOT NULL,
  due_date TIMESTAMPTZ,
  start_date TIMESTAMPTZ,
  estimated_hours DECIMAL(5,2),
  actual_hours DECIMAL(5,2),
  completion_percentage INTEGER DEFAULT 0,
  position INTEGER, -- For board view ordering
  labels JSONB DEFAULT '[]', -- Array of label objects
  custom_fields JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);

-- Task Dependencies
CREATE TABLE task_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  depends_on_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  dependency_type VARCHAR(20) DEFAULT 'finish_to_start', -- finish_to_start, start_to_start, finish_to_finish, start_to_finish
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(task_id, depends_on_task_id)
);

-- Task Comments
CREATE TABLE task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES task_comments(id), -- For threaded comments
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Task Attachments
CREATE TABLE task_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  file_id UUID REFERENCES project_files(id),
  uploaded_by UUID REFERENCES profiles(id),
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task Activity (Audit Log)
CREATE TABLE task_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  action VARCHAR(50) NOT NULL, -- created, updated, status_changed, assigned, commented, etc.
  field_name VARCHAR(100),
  old_value JSONB,
  new_value JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task Labels (Global)
CREATE TABLE task_labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task Mentions
CREATE TABLE task_mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  task_comment_id UUID REFERENCES task_comments(id),
  user_id UUID REFERENCES profiles(id),
  mentioned_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task Views (User preferences per view type)
CREATE TABLE task_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  view_type VARCHAR(20) NOT NULL, -- board, list, timeline, calendar
  column_id VARCHAR(100), -- For board view
  position INTEGER,
  is_collapsed BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(task_id, user_id, view_type)
);
```

#### 3. Project Knowledge Base

```sql
-- Wiki Pages
CREATE TABLE wiki_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  parent_page_id UUID REFERENCES wiki_pages(id), -- For nested pages
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  content TEXT NOT NULL, -- Rich text / markdown
  content_json JSONB, -- Structured content for rich editor
  icon VARCHAR(50),
  cover_image_url TEXT,
  status VARCHAR(20) DEFAULT 'draft', -- draft, published, archived
  author_id UUID REFERENCES profiles(id),
  editor_id UUID REFERENCES profiles(id),
  published_at TIMESTAMPTZ,
  version INTEGER DEFAULT 1,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  UNIQUE(project_id, slug)
);

-- Wiki Page Versions
CREATE TABLE wiki_page_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wiki_page_id UUID REFERENCES wiki_pages(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  content TEXT NOT NULL,
  content_json JSONB,
  author_id UUID REFERENCES profiles(id),
  change_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(wiki_page_id, version)
);

-- Wiki Page Approvals (For enterprise approval flows)
CREATE TABLE wiki_page_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wiki_page_id UUID REFERENCES wiki_pages(id) ON DELETE CASCADE,
  approver_id UUID REFERENCES profiles(id),
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
  comment TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wiki Page Comments
CREATE TABLE wiki_page_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wiki_page_id UUID REFERENCES wiki_pages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES wiki_page_comments(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Wiki Page Views (Analytics)
CREATE TABLE wiki_page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wiki_page_id UUID REFERENCES wiki_pages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 4. Decision Management System

```sql
-- Decisions
CREATE TABLE decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  context TEXT, -- Background information
  reason TEXT, -- Why this decision was made
  alternatives JSONB, -- Array of alternative options considered
  impact TEXT, -- Expected impact
  decision_date DATE NOT NULL,
  decision_maker_id UUID REFERENCES profiles(id),
  approver_id UUID REFERENCES profiles(id),
  status VARCHAR(20) DEFAULT 'proposed', -- proposed, approved, rejected, implemented
  category VARCHAR(100), -- technical, business, product, design
  tags JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Decision Votes (For team input)
CREATE TABLE decision_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID REFERENCES decisions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  vote VARCHAR(20) NOT NULL, -- approve, reject, abstain
  comment TEXT,
  voted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(decision_id, user_id)
);

-- Decision Links (Related decisions)
CREATE TABLE decision_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID REFERENCES decisions(id) ON DELETE CASCADE,
  related_decision_id UUID REFERENCES decisions(id) ON DELETE CASCADE,
  link_type VARCHAR(20) DEFAULT 'related', -- related, supersedes, depends_on
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 5. Project Dashboard

```sql
-- Project Dashboard Widgets
CREATE TABLE dashboard_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  widget_type VARCHAR(50) NOT NULL, -- project_health, open_tasks, upcoming_meetings, recent_files, team_activity, recent_discussions, milestones, progress, blockers
  position_x INTEGER NOT NULL,
  position_y INTEGER NOT NULL,
  width INTEGER DEFAULT 4,
  height INTEGER DEFAULT 3,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project Milestones
CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'upcoming', -- upcoming, in_progress, completed, overdue
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project Blockers
CREATE TABLE project_blockers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  severity VARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical
  blocked_by_id UUID REFERENCES profiles(id),
  blocked_task_id UUID REFERENCES tasks(id),
  status VARCHAR(20) DEFAULT 'active', -- active, resolved, ignored
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 6. Unified Search & AI

```sql
-- Search Index (Materialized view or separate table)
CREATE TABLE search_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  project_id UUID REFERENCES projects(id),
  entity_type VARCHAR(50) NOT NULL, -- message, task, file, wiki_page, decision, meeting
  entity_id UUID NOT NULL,
  title TEXT,
  content TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Full-text search indexes
CREATE INDEX idx_search_index_content ON search_index USING gin(to_tsvector('english', title || ' ' || content));
CREATE INDEX idx_search_index_entity ON search_index(entity_type, entity_id);
CREATE INDEX idx_search_index_project ON search_index(project_id);
CREATE INDEX idx_search_index_org ON search_index(organization_id);

-- Vector Embeddings (for AI/semantic search)
CREATE TABLE embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  embedding vector(1536), -- OpenAI ada-002 dimension
  model VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(entity_type, entity_id)
);

-- Vector similarity index (requires pgvector extension)
CREATE INDEX idx_embeddings_similarity ON embeddings USING ivfflat(embedding vector_cosine_ops);

-- Message Embeddings
CREATE TABLE message_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES project_messages(id) ON DELETE CASCADE,
  embedding vector(1536),
  model VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(message_id)
);

-- Document Embeddings (Wiki, Decisions, etc.)
CREATE TABLE document_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  embedding vector(1536),
  model VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(entity_type, entity_id)
);

-- Meeting Embeddings
CREATE TABLE meeting_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES project_meetings(id) ON DELETE CASCADE,
  embedding vector(1536),
  model VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(meeting_id)
);

-- Task Embeddings
CREATE TABLE task_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  embedding vector(1536),
  model VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(task_id)
);
```

#### 7. Production Notification System

```sql
-- Notification Preferences
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL, -- mention, task_assignment, meeting_reminder, deadline_alert, message_reply, decision_update, wiki_update
  in_app BOOLEAN DEFAULT TRUE,
  email BOOLEAN DEFAULT FALSE,
  push BOOLEAN DEFAULT FALSE,
  sms BOOLEAN DEFAULT FALSE,
  whatsapp BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, project_id, notification_type)
);

-- Notification Queue (For processing)
CREATE TABLE notification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  notification_type VARCHAR(50) NOT NULL,
  title VARCHAR(500) NOT NULL,
  body TEXT,
  data JSONB DEFAULT '{}',
  channels JSONB DEFAULT '[]', -- ['in_app', 'email', 'push', 'sms', 'whatsapp']
  priority INTEGER DEFAULT 5, -- 1-10, 10 is highest
  scheduled_for TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'pending', -- pending, processing, sent, failed
  attempts INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ
);

-- User Notifications (Delivered notifications)
CREATE TABLE user_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  notification_queue_id UUID REFERENCES notification_queue(id),
  title VARCHAR(500) NOT NULL,
  body TEXT,
  data JSONB DEFAULT '{}',
  action_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notification Templates
CREATE TABLE notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_type VARCHAR(50) NOT NULL UNIQUE,
  title_template TEXT NOT NULL,
  body_template TEXT NOT NULL,
  email_subject_template TEXT,
  email_body_template TEXT,
  push_title_template TEXT,
  push_body_template TEXT,
  sms_template TEXT,
  variables JSONB DEFAULT '[]', -- Array of variable names
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 8. Enterprise File Management

```sql
-- Enhanced Files Table
ALTER TABLE project_files ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
ALTER TABLE project_files ADD COLUMN IF NOT EXISTS folder_path TEXT; -- Full path for nested folders
ALTER TABLE project_files ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]';
ALTER TABLE project_files ADD COLUMN IF NOT EXISTS preview_url TEXT;
ALTER TABLE project_files ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
ALTER TABLE project_files ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE;
ALTER TABLE project_files ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0;
ALTER TABLE project_files ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE project_files ADD COLUMN IF NOT EXISTS last_accessed_at TIMESTAMPTZ;
ALTER TABLE project_files ADD COLUMN IF NOT EXISTS storage_provider VARCHAR(50) DEFAULT 'supabase'; -- supabase, s3, gcs

-- File Sharing Links
CREATE TABLE file_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID REFERENCES project_files(id) ON DELETE CASCADE,
  share_token VARCHAR(100) UNIQUE NOT NULL,
  shared_by UUID REFERENCES profiles(id),
  expires_at TIMESTAMPTZ,
  max_downloads INTEGER,
  download_count INTEGER DEFAULT 0,
  password_hash TEXT, -- Optional password protection
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- File Locks (For collaborative editing)
CREATE TABLE file_locks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID REFERENCES project_files(id) ON DELETE CASCADE,
  locked_by UUID REFERENCES profiles(id),
  locked_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  UNIQUE(file_id)
);
```

#### 9. Enhanced Meeting System

```sql
-- Enhanced Meetings Table
ALTER TABLE project_meetings ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
ALTER TABLE project_meetings ADD COLUMN IF NOT EXISTS calendar_event_id TEXT; -- Google Calendar, Outlook
ALTER TABLE project_meetings ADD COLUMN IF NOT EXISTS recurrence_rule TEXT; -- RRULE for recurring meetings
ALTER TABLE project_meetings ADD COLUMN IF NOT EXISTS recording_url TEXT;
ALTER TABLE project_meetings ADD COLUMN IF NOT EXISTS transcript_url TEXT;
ALTER TABLE project_meetings ADD COLUMN IF NOT EXISTS ai_summary TEXT;
ALTER TABLE project_meetings ADD COLUMN IF NOT EXISTS action_items JSONB DEFAULT '[]';

-- Meeting Recurrences
CREATE TABLE meeting_recurrences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES project_meetings(id) ON DELETE CASCADE,
  recurrence_rule TEXT NOT NULL, -- RRULE format
  next_occurrence TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  max_occurrences INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meeting Action Items
CREATE TABLE meeting_action_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES project_meetings(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id), -- Link to task if created
  description TEXT NOT NULL,
  assignee_id UUID REFERENCES profiles(id),
  due_date TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'pending', -- pending, in_progress, completed
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Calendar Integrations
CREATE TABLE calendar_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  provider VARCHAR(50) NOT NULL, -- google, outlook, caldav
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMPTZ,
  calendar_id TEXT,
  sync_enabled BOOLEAN DEFAULT TRUE,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 10. Enhanced Security & Audit

```sql
-- Immutable Audit Log (Append-only)
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  user_id UUID REFERENCES profiles(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  ip_address INET,
  user_agent TEXT,
  changes JSONB, -- Before/after values
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for audit log queries
CREATE INDEX idx_audit_log_org ON audit_log(organization_id, created_at DESC);
CREATE INDEX idx_audit_log_user ON audit_log(user_id, created_at DESC);
CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id, created_at DESC);

-- Session Management
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  session_token VARCHAR(255) UNIQUE NOT NULL,
  refresh_token VARCHAR(255) UNIQUE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  device_info JSONB,
  location JSONB,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_accessed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Security Events (For threat detection)
CREATE TABLE security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  user_id UUID REFERENCES profiles(id),
  event_type VARCHAR(50) NOT NULL, -- login_failed, suspicious_activity, data_export, etc.
  severity VARCHAR(20) DEFAULT 'low', -- low, medium, high, critical
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Data Retention Policies
CREATE TABLE data_retention_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  entity_type VARCHAR(50) NOT NULL,
  retention_days INTEGER NOT NULL,
  action VARCHAR(50) DEFAULT 'delete', -- delete, archive
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 11. Database Partitioning (For Scale)

```sql
-- Partition messages by date (for 100M+ messages)
CREATE TABLE project_messages_partitioned (
  LIKE project_messages INCLUDING ALL
) PARTITION BY RANGE (created_at);

-- Create monthly partitions
CREATE TABLE project_messages_2024_01 PARTITION OF project_messages_partitioned
  FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE project_messages_2024_02 PARTITION OF project_messages_partitioned
  FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');

-- Add more partitions as needed

-- Partition notifications by date
CREATE TABLE notification_queue_partitioned (
  LIKE notification_queue INCLUDING ALL
) PARTITION BY RANGE (created_at);

-- Partition audit log by date
CREATE TABLE audit_log_partitioned (
  LIKE audit_log INCLUDING ALL
) PARTITION BY RANGE (created_at);
```

---

## Search Architecture

### Unified Search Strategy

**Hybrid Search Approach:**
1. **Full-Text Search** (PostgreSQL GIN indexes) - For exact matches
2. **Vector Search** (pgvector) - For semantic similarity
3. **Keyword Search** (ILIKE with trigrams) - For partial matches
4. **Faceted Search** - Filter by type, project, date, etc.

### Search Pipeline

```
User Query
    ↓
Query Analysis (NLP)
    ↓
Parallel Execution:
    ├─ Full-Text Search (PostgreSQL)
    ├─ Vector Search (pgvector)
    └─ Keyword Search (trigrams)
    ↓
Result Fusion (Ranking)
    ↓
Permission Filtering (RLS)
    ↓
Result Aggregation
    ↓
Response (Ranked results)
```

### Search Implementation

```sql
-- Create search function
CREATE OR REPLACE FUNCTION search_unified(
  p_organization_id UUID,
  p_query TEXT,
  p_entity_types TEXT[] DEFAULT NULL,
  p_project_id UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  entity_type TEXT,
  entity_id UUID,
  title TEXT,
  content TEXT,
  score DECIMAL,
  metadata JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    si.entity_type,
    si.entity_id,
    si.title,
    si.content,
    ts_rank(to_tsvector('english', si.title || ' ' || si.content), plainto_tsquery('english', p_query)) AS score,
    si.metadata
  FROM search_index si
  WHERE si.organization_id = p_organization_id
    AND (p_entity_types IS NULL OR si.entity_type = ANY(p_entity_types))
    AND (p_project_id IS NULL OR si.project_id = p_project_id)
    AND to_tsvector('english', si.title || ' ' || si.content) @@ plainto_tsquery('english', p_query)
  ORDER BY score DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Vector search function
CREATE OR REPLACE FUNCTION search_semantic(
  p_organization_id UUID,
  p_query_embedding vector(1536),
  p_entity_types TEXT[] DEFAULT NULL,
  p_project_id UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  entity_type TEXT,
  entity_id UUID,
  title TEXT,
  content TEXT,
  similarity DECIMAL,
  metadata JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.entity_type,
    e.entity_id,
    si.title,
    si.content,
    1 - (e.embedding <=> p_query_embedding) AS similarity,
    si.metadata
  FROM embeddings e
  JOIN search_index si ON e.entity_type = si.entity_type AND e.entity_id = si.entity_id
  WHERE (p_entity_types IS NULL OR e.entity_type = ANY(p_entity_types))
    AND (p_project_id IS NULL OR si.project_id = p_project_id)
  ORDER BY e.embedding <=> p_query_embedding
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;
```

### Search Indexing Strategy

**Real-time Indexing:**
- Database triggers update search_index on INSERT/UPDATE
- Vector embeddings generated asynchronously via queue
- Background worker processes embedding queue

**Batch Indexing:**
- Re-index all content periodically
- Update embeddings when model changes
- Clean up stale entries

---

## AI Architecture

### AI Readiness

**Embedding Generation:**
```typescript
// Embedding Service
class EmbeddingService {
  async generateEmbedding(text: string): Promise<number[]> {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text
    })
    return response.data[0].embedding
  }

  async indexMessage(messageId: string) {
    const message = await getMessage(messageId)
    const embedding = await this.generateEmbedding(message.content)
    await saveEmbedding('message', messageId, embedding)
  }

  async indexDocument(entityType: string, entityId: string, content: string) {
    const embedding = await this.generateEmbedding(content)
    await saveEmbedding(entityType, entityId, embedding)
  }
}
```

**RAG (Retrieval-Augmented Generation):**
```typescript
class RAGService {
  async answerQuestion(question: string, projectId: string) {
    // 1. Generate query embedding
    const queryEmbedding = await this.generateEmbedding(question)

    // 2. Search for relevant documents
    const relevantDocs = await this.searchSemantic(queryEmbedding, projectId)

    // 3. Build context
    const context = relevantDocs.map(doc => doc.content).join('\n')

    // 4. Generate answer
    const answer = await this.generateAnswer(question, context)

    return { answer, sources: relevantDocs }
  }

  async generateAnswer(question: string, context: string) {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a helpful assistant for TeamSync. Answer questions based on the provided context.' },
        { role: 'user', content: `Context:\n${context}\n\nQuestion: ${question}` }
      ]
    })
    return response.choices[0].message.content
  }
}
```

**AI Features:**
1. **Semantic Search** - Find related content by meaning
2. **AI Chat Assistant** - Answer questions about project
3. **AI Task Creation** - Generate tasks from natural language
4. **AI Meeting Summary** - Summarize meeting transcripts
5. **AI Risk Detection** - Identify project risks from activity
6. **AI Project Summary** - Generate project overviews

---

## Real-Time Architecture

### Enterprise-Grade Real-Time

**Architecture:**
```
Client (WebSocket)
    ↓
WebSocket Gateway (Node.js)
    ↓
Redis Pub/Sub
    ↓
Worker Nodes (Process events)
    ↓
Database (Write)
    ↓
PostgreSQL NOTIFY (Read)
    ↓
WebSocket Gateway (Broadcast)
    ↓
Clients (Receive)
```

**Redis Pub/Sub:**
```typescript
// Publisher
class RealTimePublisher {
  async publish(channel: string, event: any) {
    await redis.publish(channel, JSON.stringify(event))
  }

  async publishMessage(message: Message) {
    await this.publish(`project:${message.project_id}:messages`, {
      type: 'message.created',
      data: message
    })
  }
}

// Subscriber
class RealTimeSubscriber {
  async subscribe(projectId: string) {
    const subscriber = redis.duplicate()
    await subscriber.subscribe(`project:${projectId}:messages`)
    subscriber.on('message', (channel, message) => {
      this.broadcastToClients(channel, JSON.parse(message))
    })
  }
}
```

**Presence System:**
```typescript
// Presence with Redis
class PresenceService {
  async setUserOnline(userId: string, projectId: string) {
    await redis.hset(
      `presence:${projectId}`,
      userId,
      JSON.stringify({
        online: true,
        lastSeen: new Date().toISOString()
      })
    )
    await redis.expire(`presence:${projectId}`, 300) // 5 minutes
  }

  async getProjectPresence(projectId: string) {
    const presence = await redis.hgetall(`presence:${projectId}`)
    return Object.entries(presence).map(([userId, data]) => ({
      userId,
      ...JSON.parse(data)
    }))
  }
}
```

**Typing Indicators:**
```typescript
class TypingIndicatorService {
  async setTyping(userId: string, channelId: string) {
    await redis.setex(
      `typing:${channelId}:${userId}`,
      5, // 5 seconds
      'true'
    )
    await this.publishTypingEvent(channelId, userId)
  }

  async getTypingUsers(channelId: string) {
    const keys = await redis.keys(`typing:${channelId}:*`)
    return keys.map(key => key.split(':')[2])
  }
}
```

---

## Notification Architecture

### Production Notification System

**Architecture:**
```
Event Trigger
    ↓
Notification Queue (PostgreSQL)
    ↓
Worker (Poll/Notify)
    ↓
Router (Determine channels)
    ↓
Channel Processors:
    ├─ In-App (WebSocket)
    ├─ Email (SES/SendGrid)
    ├─ Push (FCM/APNS)
    ├─ SMS (Twilio)
    └─ WhatsApp (Twilio API)
    ↓
Delivery Status
    ↓
Audit Log
```

**Notification Queue Worker:**
```typescript
class NotificationWorker {
  async process() {
    while (true) {
      const notification = await this.getNextNotification()
      if (!notification) {
        await sleep(1000)
        continue
      }

      try {
        await this.sendNotification(notification)
        await this.markAsSent(notification.id)
      } catch (error) {
        await this.incrementAttempts(notification.id)
        if (notification.attempts >= 3) {
          await this.markAsFailed(notification.id, error.message)
        }
      }
    }
  }

  async sendNotification(notification: Notification) {
    const channels = notification.channels
    await Promise.all([
      channels.includes('in_app') && this.sendInApp(notification),
      channels.includes('email') && this.sendEmail(notification),
      channels.includes('push') && this.sendPush(notification),
      channels.includes('sms') && this.sendSMS(notification),
      channels.includes('whatsapp') && this.sendWhatsApp(notification)
    ])
  }
}
```

**Notification Templates:**
```typescript
class NotificationTemplateService {
  async render(templateType: string, variables: any) {
    const template = await this.getTemplate(templateType)
    return {
      title: this.renderTemplate(template.title_template, variables),
      body: this.renderTemplate(template.body_template, variables),
      emailSubject: this.renderTemplate(template.email_subject_template, variables),
      emailBody: this.renderTemplate(template.email_body_template, variables)
    }
  }
}
```

---

## Scalability Strategy

### Database Scaling

**Partitioning Strategy:**
- Messages: Partition by month (created_at)
- Notifications: Partition by week (created_at)
- Audit Log: Partition by month (created_at)
- Activity Logs: Partition by month (created_at)

**Indexing Strategy:**
- All foreign keys indexed
- All frequently queried columns indexed
- Composite indexes for common query patterns
- Partial indexes for filtered queries
- GIN indexes for full-text search
- BRIN indexes for time-series data

**Caching Strategy:**
```typescript
// Multi-level caching
class CacheService {
  // L1: In-memory (per instance)
  private localCache = new LRUCache({ max: 1000 })

  // L2: Redis (shared)
  async get(key: string) {
    // Check L1
    let value = this.localCache.get(key)
    if (value) return value

    // Check L2
    value = await redis.get(key)
    if (value) {
      this.localCache.set(key, value)
      return JSON.parse(value)
    }

    return null
  }

  async set(key: string, value: any, ttl: number) {
    this.localCache.set(key, value)
    await redis.setex(key, ttl, JSON.stringify(value))
  }
}
```

**Read Replicas:**
- Primary for writes
- Read replicas for reads
- Connection pooling (PgBouncer)
- Query routing by operation type

### Application Scaling

**Horizontal Scaling:**
- Stateless application servers
- Load balancer (ALB/NLB)
- Auto-scaling groups
- Container orchestration (Kubernetes/ECS)

**Database Connection Pooling:**
```typescript
// PgBouncer configuration
[databases]
teamsync = host=postgres.example.com port=5432 dbname=teamsync

[pgbouncer]
pool_mode = transaction
max_client_conn = 10000
default_pool_size = 25
reserve_pool_size = 5
reserve_pool_timeout = 3
```

**Queue Scaling:**
- Multiple worker processes
- Worker per queue type
- Auto-scaling based on queue depth
- Dead letter queues for failures

---

## Performance Optimizations

### Query Optimizations

**1. Use CTEs for complex queries:**
```sql
WITH project_stats AS (
  SELECT
    project_id,
    COUNT(*) FILTER (WHERE status = 'completed') AS completed_tasks,
    COUNT(*) FILTER (WHERE status = 'in_progress') AS in_progress_tasks,
    COUNT(*) AS total_tasks
  FROM tasks
  WHERE project_id = $1
  GROUP BY project_id
)
SELECT * FROM project_stats;
```

**2. Materialized views for aggregations:**
```sql
CREATE MATERIALIZED VIEW project_dashboard_stats AS
SELECT
  p.id AS project_id,
  COUNT(DISTINCT m.id) AS message_count,
  COUNT(DISTINCT t.id) AS task_count,
  COUNT(DISTINCT f.id) AS file_count,
  COUNT(DISTINCT w.id) AS wiki_count
FROM projects p
LEFT JOIN project_messages m ON m.project_id = p.id
LEFT JOIN tasks t ON t.project_id = p.id
LEFT JOIN project_files f ON f.project_id = p.id
LEFT JOIN wiki_pages w ON w.project_id = p.id
GROUP BY p.id;

CREATE INDEX idx_project_dashboard_stats ON project_dashboard_stats(project_id);

-- Refresh periodically
REFRESH MATERIALIZED VIEW CONCURRENTLY project_dashboard_stats;
```

**3. Pagination with cursor:**
```typescript
async getMessagesCursor(projectId: string, cursor: string | null, limit: number) {
  let query = this.supabase
    .from('project_messages')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (cursor) {
    query = query.lt('created_at', cursor)
  }

  const { data } = await query
  return data
}
```

### Caching Strategy

**Cache Keys:**
```
user:{userId}:profile
project:{projectId}:members
project:{projectId}:channels
channel:{channelId}:messages:page:{page}
task:{taskId}:details
wiki:{wikiId}:content
```

**Cache Invalidation:**
- Time-based expiration (TTL)
- Event-based invalidation (on updates)
- Cache warming (pre-load popular data)

---

## Security Architecture Improvements

### RBAC + ABAC

**Role-Based Access Control (RBAC):**
- Organization roles: Owner, Admin, Member, Viewer
- Project roles: Owner, Admin, Manager, Member, Viewer
- Team roles: Owner, Admin, Member

**Attribute-Based Access Control (ABAC):**
```sql
-- ABAC Policy Table
CREATE TABLE access_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  resource_type VARCHAR(50) NOT NULL, -- task, file, wiki, etc.
  action VARCHAR(50) NOT NULL, -- read, write, delete, share
  policy_expression TEXT NOT NULL, -- JSON logic expression
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Example policy: "Only task assignee or project admin can edit task"
INSERT INTO access_policies (organization_id, resource_type, action, policy_expression)
VALUES (
  'org-123',
  'task',
  'edit',
  '{
    "OR": [
      {"AND": [{"user.role": "project_admin"}, {"user.project_id": "resource.project_id"}]},
      {"user.id": "resource.assignee_id"}
    ]
  }'
);
```

### Immutable Audit Log

**Append-Only Table:**
```sql
-- Prevent updates and deletes
CREATE TRIGGER audit_log_immutable
  BEFORE UPDATE OR DELETE ON audit_log
  FOR EACH ROW
  EXECUTE FUNCTION prevent_audit_log_modification();

CREATE OR REPLACE FUNCTION prevent_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Audit log is immutable';
END;
$$ LANGUAGE plpgsql;
```

### Data Encryption

**At Rest:**
- Database: Transparent Data Encryption (TDE)
- Storage: Server-side encryption (SSE-S3 or SSE-KMS)
- Backups: Encrypted with customer-managed keys

**In Transit:**
- TLS 1.3 for all connections
- Certificate pinning for mobile apps
- mTLS for service-to-service communication

---

## Multi-Tenancy Architecture

### Tenant Isolation

**Database-Level Isolation:**
- All tables have organization_id
- Row-Level Security (RLS) policies
- Separate schemas per tenant (optional for enterprise)

**Application-Level Isolation:**
- Tenant context in all requests
- Tenant-aware caching
- Tenant-specific rate limits

**Example RLS Policy:**
```sql
-- Policy: Users can only access their organization's data
CREATE POLICY organization_isolation ON tasks
  FOR ALL
  USING (
    organization_id = current_organization_id()
  );

CREATE FUNCTION current_organization_id()
RETURNS UUID AS $$
  SELECT organization_id FROM organization_members
  WHERE user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;
```

---

## Performance Targets

### Target Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Project Load | < 1s | Time to render dashboard |
| Chat Load | < 300ms | Time to load 50 messages |
| Search | < 500ms | Time to return results |
| Task Load | < 500ms | Time to load task details |
| Notification Delivery | < 2s | Time from trigger to delivery |
| Message Delivery | < 100ms | Time from send to receive |
| File Upload | < 2s (100MB) | Upload time |
| File Download | < 1s (100MB) | Download time |

### Monitoring

**Key Metrics to Monitor:**
- P50, P95, P99 latency
- Error rates (4xx, 5xx)
- Database connection pool usage
- Redis hit rate
- Queue depth
- CPU/Memory utilization
- Network I/O

---

## Final Production Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │   Web    │  │  Mobile  │  │ Desktop  │  │   CLI    │        │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘        │
└───────┼────────────┼────────────┼────────────┼─────────────────┘
        │            │            │            │
        └────────────┴────────────┴────────────┘
                     │
        ┌────────────▼────────────┐
        │   CDN (CloudFront)      │
        │   Static Assets         │
        └────────────┬────────────┘
                     │
        ┌────────────▼────────────┐
        │  Load Balancer (ALB)     │
        │  SSL Termination        │
        └────────────┬────────────┘
                     │
        ┌────────────▼────────────┐
        │  API Gateway             │
        │  Rate Limiting          │
        │  Authentication         │
        └────────────┬────────────┘
                     │
        ┌────────────▼────────────┐
        │  Application Servers     │
        │  (Node.js/Fastify)      │
        │  - Auto-scaling         │
        │  - Stateless             │
        └────────────┬────────────┘
                     │
        ┌────────────▼────────────┐
        │  WebSocket Gateway      │
        │  (Real-time)            │
        └────────────┬────────────┘
                     │
        ┌────────────▼────────────┐
        │  Redis Cluster          │
        │  - Caching              │
        │  - Pub/Sub              │
        │  - Sessions             │
        │  - Rate Limits          │
        └────────────┬────────────┘
                     │
        ┌────────────▼────────────┐
        │  PostgreSQL Primary     │
        │  - Writes               │
        │  - Partitioned Tables   │
        │  - RLS Policies         │
        └────────────┬────────────┘
                     │
        ┌────────────▼────────────┐
        │  PostgreSQL Replicas     │
        │  - Reads                │
        │  - Read Replicas (3)    │
        └────────────┬────────────┘
                     │
        ┌────────────▼────────────┐
        │  Object Storage         │
        │  (S3/Supabase Storage)  │
        │  - Files                │
        │  - Thumbnails           │
        │  - Previews             │
        └────────────┬────────────┘
                     │
        ┌────────────▼────────────┐
        │  Search Engine          │
        │  (PostgreSQL + pgvector)│
        │  - Full-text Search     │
        │  - Vector Search        │
        │  - Hybrid Search        │
        └────────────┬────────────┘
                     │
        ┌────────────▼────────────┐
        │  Queue System           │
        │  (PostgreSQL + Workers) │
        │  - Notifications        │
        │  - Embeddings           │
        │  - Email                │
        └────────────┬────────────┘
                     │
        ┌────────────▼────────────┐
        │  AI Services            │
        │  (OpenAI API)           │
        │  - Embeddings           │
        │  - Chat Completion      │
        │  - Summarization        │
        └────────────┬────────────┘
                     │
        ┌────────────▼────────────┐
        │  External Services      │
        │  - Email (SES)         │
        │  - SMS (Twilio)        │
        │  - Push (FCM)          │
        │  - Calendar (Google)   │
        │  - Video (Zoom/Meet)    │
        └─────────────────────────┘
```

---

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-4)
1. Implement organization/team hierarchy
2. Add multi-tenancy to all tables
3. Implement RBAC + ABAC
4. Add immutable audit log
5. Set up database partitioning

### Phase 2: Core Features (Weeks 5-8)
1. Implement task management system
2. Implement project dashboard
3. Implement wiki/knowledge base
4. Implement decision management
5. Implement unified search

### Phase 3: AI & Real-Time (Weeks 9-12)
1. Add vector embeddings infrastructure
2. Implement semantic search
3. Set up Redis Pub/Sub
4. Implement WebSocket gateway
5. Implement presence system

### Phase 4: Notifications (Weeks 13-14)
1. Implement notification queue
2. Implement notification workers
3. Add email notifications
4. Add push notifications
5. Implement notification preferences

### Phase 5: Enterprise Features (Weeks 15-16)
1. Enhanced file management
2. Meeting integrations
3. Calendar sync
4. Advanced security features
5. Compliance features

---

## Conclusion

This architectural redesign transforms TeamSync from a simple chat application into a complete project operating system. The architecture is designed to scale from 10 to 100,000+ users without major rewrites, following best practices from industry leaders.

**Key Achievements:**
- Complete workspace concept (not just chat)
- Production-grade scalability
- AI-ready infrastructure
- Enterprise security
- Multi-tenancy support
- Unified search across all entities
- Real-time performance
- Comprehensive notification system

**Next Steps:**
1. Review and approve this architecture
2. Create detailed implementation plans for each phase
3. Set up development environment with new schema
4. Begin Phase 1 implementation
5. Establish performance monitoring
