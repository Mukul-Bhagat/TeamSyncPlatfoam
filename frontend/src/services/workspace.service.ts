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
  async createWorkspace(input: CreateWorkspaceInput) {
    const { data, error } = await supabase
      .from('workspaces')
      .insert({
        organization_id: input.organization_id,
        name: input.name,
        slug: input.slug,
        description: input.description,
        icon: input.icon,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .select()
      .single();

    if (error) throw error;

    // Add creator as admin member
    await this.addWorkspaceMember({
      workspace_id: data.id,
      user_id: data.created_by,
      role: 'admin',
    });

    return data as Workspace;
  },

  async getWorkspace(id: string) {
    const { data, error } = await supabase
      .from('workspaces')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Workspace;
  },

  async getWorkspaceBySlug(organizationId: string, slug: string) {
    const { data, error } = await supabase
      .from('workspaces')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('slug', slug)
      .single();

    if (error) throw error;
    return data as Workspace;
  },

  async listOrganizationWorkspaces(organizationId: string) {
    const { data, error } = await supabase
      .from('workspaces')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Workspace[];
  },

  async updateWorkspace(id: string, input: UpdateWorkspaceInput) {
    const { data, error } = await supabase
      .from('workspaces')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Workspace;
  },

  async deleteWorkspace(id: string) {
    const { error } = await supabase
      .from('workspaces')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async addWorkspaceMember(input: AddWorkspaceMemberInput) {
    const { data, error } = await supabase
      .from('workspace_members')
      .insert({
        workspace_id: input.workspace_id,
        user_id: input.user_id,
        role: input.role,
      })
      .select()
      .single();

    if (error) throw error;
    return data as WorkspaceMember;
  },

  async removeWorkspaceMember(workspaceId: string, userId: string) {
    const { error } = await supabase
      .from('workspace_members')
      .delete()
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId);

    if (error) throw error;
  },

  async updateWorkspaceMemberRole(workspaceId: string, userId: string, input: UpdateWorkspaceMemberRoleInput) {
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

  async listWorkspaceMembers(workspaceId: string) {
    const { data, error } = await supabase
      .from('workspace_members')
      .select(`
        id,
        role,
        joined_at,
        user_id,
        profiles (
          id,
          full_name,
          username,
          avatar_url
        )
      `)
      .eq('workspace_id', workspaceId);

    if (error) throw error;
    return data as WorkspaceMemberWithProfile[];
  },
};
