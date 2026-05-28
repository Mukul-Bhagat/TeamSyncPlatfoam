export type EntityType = 'message' | 'summary' | 'incident' | 'deployment' | 'activity' | 'workspace' | 'channel';
export type MemoryType = 'important_incident' | 'deployment_pattern' | 'operational_decision' | 'recurring_issue' | 'ai_generated_memory';

export interface SearchRequest {
  query: string;
  organization_id: string;
  workspace_id?: string;
  entity_type?: EntityType;
  limit?: number;
  use_semantic?: boolean;
}

export interface SearchResult {
  id: string;
  entity_type: EntityType;
  entity_id: string;
  title: string;
  content: string;
  score: number;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  query: string;
}

export interface MemoryRequest {
  organization_id: string;
  workspace_id?: string;
  memory_type?: MemoryType;
  limit?: number;
}

export interface MemoryEntity {
  id: string;
  organization_id: string;
  workspace_id?: string;
  memory_type: MemoryType;
  source_entity_type: string;
  source_entity_id: string;
  title: string;
  content: string;
  importance_score: number;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface MemoryResponse {
  memories: MemoryEntity[];
  total: number;
}
