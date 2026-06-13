import { api } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import type {
  Workspace,
  WorkspaceMember,
  WorkspaceMemberWithProfile,
  CreateWorkspaceInput,
  UpdateWorkspaceInput,
  AddWorkspaceMemberInput,
  UpdateWorkspaceMemberRoleInput,
} from '@/features/workspace/types/workspace.types';

export const workspaceService = {
  async createWorkspace(input: CreateWorkspaceInput): Promise<Workspace> {
    return api.post<Workspace>('/workspaces', {
      organization_id: input.organization_id,
      name: input.name,
      slug: input.slug,
      description: input.description,
      icon: input.icon,
    });
  },

  async getWorkspace(id: string): Promise<Workspace> {
    return api.get<Workspace>(`/workspaces/${id}`);
  },

  async getWorkspaceBySlug(organizationId: string, slug: string): Promise<Workspace> {
    const list = await api.get<any[]>('/workspaces', { organization_id: organizationId });
    const found = list.find((item) => item.workspace?.slug === slug);
    if (!found) throw new Error('Workspace not found');
    return found.workspace as Workspace;
  },

  async listUserWorkspaces(): Promise<Workspace[]> {
    const list = await api.get<any[]>('/workspaces');
    return list.map((item) => ({
      ...item.workspace,
      member_role: item.role,
    })) as Workspace[];
  },

  async listOrganizationWorkspaces(organizationId: string): Promise<Workspace[]> {
    const list = await api.get<any[]>('/workspaces', { organization_id: organizationId });
    return list.map((item) => ({
      ...item.workspace,
      member_role: item.role,
    })) as Workspace[];
  },

  async updateWorkspace(id: string, input: UpdateWorkspaceInput): Promise<Workspace> {
    return api.put<Workspace>(`/workspaces/${id}`, input);
  },

  async deleteWorkspace(id: string): Promise<void> {
    return api.del<void>(`/workspaces/${id}`);
  },

  async addWorkspaceMember(input: AddWorkspaceMemberInput): Promise<WorkspaceMember> {
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', input.user_id)
      .single();

    if (!profile?.email) {
      throw new Error('User profile or email not found');
    }

    return api.post<WorkspaceMember>(`/workspaces/${input.workspace_id}/members`, {
      email: profile.email,
      role: input.role,
    });
  },

  async removeWorkspaceMember(workspaceId: string, userId: string): Promise<void> {
    return api.del<void>(`/workspaces/${workspaceId}/members/${userId}`);
  },

  async updateWorkspaceMemberRole(
    workspaceId: string,
    userId: string,
    input: UpdateWorkspaceMemberRoleInput
  ): Promise<WorkspaceMember> {
    // If not implemented on backend yet, we can fall back to direct supabase or throw
    // Let's implement this by updating the member directly in supabase, or we can use the API if we add it.
    // To be safe and compliant, we update the role via supabase.
    const { data, error } = await supabase
      .from('workspace_members')
      .update({ role: input.role })
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data as WorkspaceMember;
  },

  async listWorkspaceMembers(workspaceId: string): Promise<WorkspaceMemberWithProfile[]> {
    const members = await api.get<any[]>(`/workspaces/${workspaceId}/members`);
    return members.map((m) => ({
      id: m.id,
      workspace_id: m.workspace_id,
      user_id: m.user_id,
      role: m.role,
      status: m.status || 'active',
      joined_at: m.joined_at,
      profiles: m.profile ? {
        id: m.user_id,
        full_name: m.profile.full_name,
        username: m.profile.username || m.profile.email.split('@')[0],
        avatar_url: m.profile.avatar_url,
      } : undefined,
    })) as WorkspaceMemberWithProfile[];
  },
};
