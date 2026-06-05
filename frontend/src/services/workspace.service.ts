import { supabase } from '@/lib/supabase';
import { activityService } from './activity.service';
import type {
  Workspace,
  WorkspaceMember,
  WorkspaceMemberWithProfile,
  CreateWorkspaceInput,
  UpdateWorkspaceInput,
  AddWorkspaceMemberInput,
  UpdateWorkspaceMemberRoleInput,
} from '@/features/workspace/types/workspace.types';

const recordActivity = (
  payload: Parameters<typeof activityService.createActivity>[0]
) => {
  void activityService.createActivity(payload).catch(() => undefined);
};

export const workspaceService = {
  async createWorkspace(input: CreateWorkspaceInput) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    const { data, error } = await supabase
      .from('workspaces')
      .insert({
        organization_id: input.organization_id,
        name: input.name,
        slug: input.slug,
        description: input.description,
        icon: input.icon,
        created_by: user.id,
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

    recordActivity({
      organization_id: data.organization_id,
      workspace_id: data.id,
      actor_id: user.id,
      entity_type: 'workspace',
      entity_id: data.id,
      event_type: 'workspace_created',
      title: `Workspace created: ${data.name}`,
      description: `Created workspace ${data.name}`,
      metadata: {
        workspace_id: data.id,
        workspace_name: data.name,
        action: 'created workspace',
      },
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
        status: 'active',
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

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      recordActivity({
        workspace_id: workspaceId,
        actor_id: user.id,
        entity_type: 'workspace',
        entity_id: workspaceId,
        event_type: 'member_role_updated',
        title: 'Workspace member role updated',
        description: `Updated workspace member role`,
        metadata: {
          user_id: userId,
          user_name: user.email || 'Unknown user',
          action: 'updated workspace member role',
          role: input.role,
        },
      });
    }

    return data as WorkspaceMember;
  },

  async listWorkspaceMembers(workspaceId: string) {
    const { data, error } = await supabase
      .from('workspace_members')
      .select(`
        id,
        role,
        status,
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
