import { supabase } from '@/lib/supabase';
import type { ProjectAuditLog } from '@/features/projects/types/project.types';

export interface CreateAuditLogInput {
  project_id?: string;
  workspace_id?: string;
  organization_id?: string;
  actor_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  before_data?: Record<string, unknown>;
  after_data?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export class AuditService {
  async createAuditLog(input: CreateAuditLogInput): Promise<ProjectAuditLog> {
    const { data, error } = await supabase
      .from('audit_logs')
      .insert({
        project_id: input.project_id,
        workspace_id: input.workspace_id,
        organization_id: input.organization_id,
        actor_id: input.actor_id,
        action: input.action,
        entity_type: input.entity_type,
        entity_id: input.entity_id,
        before_data: input.before_data ?? {},
        after_data: input.after_data ?? {},
        metadata: input.metadata ?? {},
      })
      .select(`
        *,
        actor_profile:profiles (
          id,
          full_name,
          username,
          avatar_url,
          email
        )
      `)
      .single();

    if (error) throw error;
    return data as ProjectAuditLog;
  }

  async listProjectAuditLogs(projectId: string, limit = 100): Promise<ProjectAuditLog[]> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select(`
        *,
        actor_profile:profiles (
          id,
          full_name,
          username,
          avatar_url,
          email
        )
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []) as ProjectAuditLog[];
  }
}

export const auditService = new AuditService();
