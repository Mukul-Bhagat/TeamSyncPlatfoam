import { supabase } from '@/lib/supabase';
import { channelService } from './channel.service';
import { activityService } from './activity.service';
import { auditService } from './audit.service';
import type { Project, ApiResponse, PaginationParams, PaginatedResponse } from '@/types';
import type {
  ProjectAuditLog,
  ProjectInvitation,
  ProjectMember,
  ProjectMemberStatus,
  ProjectRole,
  ProjectStatus,
  ProjectVisibility,
} from '@/features/projects/types/project.types';

export interface CreateProjectData {
  name: string;
  description?: string;
  team_id?: string;
  workspace_id?: string;
  visibility?: ProjectVisibility;
  status?: ProjectStatus;
  icon?: string;
  color?: string;
  members?: InviteProjectMemberInput[];
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  visibility?: ProjectVisibility;
  icon?: string;
  color?: string;
}

export interface InviteProjectMemberInput {
  email: string;
  role: ProjectRole;
  expires_at?: string;
}

export interface TransferProjectOwnershipInput {
  memberId: string;
}

const DEFAULT_PROJECT_COLOR = '#6366f1';
const DEFAULT_INVITATION_TTL_DAYS = 30;

const recordActivity = (
  payload: Parameters<typeof activityService.createActivity>[0]
) => {
  void activityService.createActivity(payload).catch(() => undefined);
};

const recordAudit = (
  payload: Parameters<typeof auditService.createAuditLog>[0]
) => {
  void auditService.createAuditLog(payload).catch(() => undefined);
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const createInvitationToken = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, '');
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
};

const buildProjectSearchContent = (project: Project) => {
  return [
    project.name,
    project.description || '',
    project.visibility || '',
    project.status,
  ]
    .filter(Boolean)
    .join(' ');
};

const projectChannelDefinitions = (project: Project) => [
  {
    name: `${project.name} Feed`,
    slug: `project-${project.id}`,
    description: `Project feed for ${project.name}`,
    type: 'text' as const,
    visibility: 'public' as const,
    icon: '✨',
  },
  {
    name: `${project.name} Chat`,
    slug: `project-${project.id}-chat`,
    description: `Project chat for ${project.name}`,
    type: 'text' as const,
    visibility: 'public' as const,
    icon: '💬',
  },
  {
    name: `${project.name} Announcements`,
    slug: `project-${project.id}-announcements`,
    description: `Project announcements for ${project.name}`,
    type: 'announcement' as const,
    visibility: 'public' as const,
    icon: '📣',
  },
];

async function resolveWorkspaceContext(workspaceId?: string) {
  if (!workspaceId) {
    return null;
  }

  const { data, error } = await supabase
    .from('workspaces')
    .select('id, organization_id, name')
    .eq('id', workspaceId)
    .single();

  if (error) throw error;
  return data as { id: string; organization_id: string; name: string };
}

async function syncProjectSearchDocument(project: Project, organizationId?: string) {
  if (!organizationId) {
    return;
  }

  const { data: existing, error: existingError } = await supabase
    .from('search_documents')
    .select('id')
    .eq('entity_type', 'project')
    .eq('entity_id', project.id)
    .maybeSingle();

  if (existingError && existingError.code !== 'PGRST116') {
    throw existingError;
  }

  const payload = {
    organization_id: organizationId,
    workspace_id: project.workspace_id,
    entity_type: 'project',
    entity_id: project.id,
    title: project.name,
    content: project.description || project.name,
    searchable_text: buildProjectSearchContent(project),
    metadata: {
      project_id: project.id,
      project_name: project.name,
      organization_id: organizationId,
      visibility: project.visibility,
      status: project.status,
      icon: project.icon,
      color: project.color,
      workspace_id: project.workspace_id,
    },
    embedding: null,
  };

  if (existing?.id) {
    const { error } = await supabase
      .from('search_documents')
      .update({
        title: payload.title,
        content: payload.content,
        searchable_text: payload.searchable_text,
        metadata: payload.metadata,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id);

    if (error) throw error;
    return;
  }

  const { error } = await supabase.from('search_documents').insert(payload);
  if (error) throw error;
}

async function removeProjectSearchDocument(projectId: string) {
  const { error } = await supabase
    .from('search_documents')
    .delete()
    .eq('entity_type', 'project')
    .eq('entity_id', projectId);

  if (error) throw error;
}

async function removeDefaultProjectChannels(project: Pick<Project, 'id' | 'workspace_id'>) {
  if (!project.workspace_id) {
    return;
  }

  const slugs = [
    `project-${project.id}`,
    `project-${project.id}-chat`,
    `project-${project.id}-announcements`,
  ];

  const { error } = await supabase
    .from('channels')
    .delete()
    .eq('workspace_id', project.workspace_id)
    .in('slug', slugs);

  if (error) {
    throw error;
  }
}

function toProjectMemberPayload(
  projectId: string,
  email: string,
  role: ProjectRole,
  invitedBy: string
) {
  return {
    project_id: projectId,
    email: normalizeEmail(email),
    role,
    status: 'invited' as const,
    invited_by: invitedBy,
    user_id: null,
    joined_at: null,
  };
}

async function fetchProjectContext(projectId: string) {
  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (error) throw error;

  const workspaceContext = project.workspace_id
    ? await resolveWorkspaceContext(project.workspace_id)
    : null;

  return { project: project as Project, workspaceContext };
}

export const projectService = {
  async getProjects(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Project>>> {
    try {
      let query = supabase
        .from('projects')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (params?.workspaceId) {
        query = query.eq('workspace_id', params.workspaceId);
      } else if (params?.organizationId) {
        const { data: workspaces, error: workspaceError } = await supabase
          .from('workspaces')
          .select('id')
          .eq('organization_id', params.organizationId);

        if (workspaceError) throw workspaceError;

        const workspaceIds = (workspaces || []).map((workspace) => workspace.id);
        if (workspaceIds.length > 0) {
          query = query.in('workspace_id', workspaceIds);
        } else {
          return {
            data: {
              data: [],
              total: 0,
              page: params?.page || 1,
              limit: params?.limit || 10,
              totalPages: 0,
            },
            error: null,
          };
        }
      }

      if (params?.page && params?.limit) {
        const from = (params.page - 1) * params.limit;
        const to = from + params.limit - 1;
        query = query.range(from, to);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data: {
          data: data || [],
          total: count || 0,
          page: params?.page || 1,
          limit: params?.limit || 10,
          totalPages: Math.ceil((count || 0) / (params?.limit || 10)),
        },
        error: null,
      };
    } catch (error: any) {
      return {
        data: null,
        error: error.message || 'Failed to fetch projects',
      };
    }
  },

  async getProject(id: string): Promise<ApiResponse<Project>> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
      };
    } catch (error: any) {
      return {
        data: null,
        error: error.message || 'Failed to fetch project',
      };
    }
  },

  async createProject(data: CreateProjectData): Promise<ApiResponse<Project>> {
    try {
      if (!data.workspace_id) {
        throw new Error('Workspace is required to create a project');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const projectContext = await resolveWorkspaceContext(data.workspace_id);

      const { data: project, error } = await supabase
        .from('projects')
        .insert({
          name: data.name,
          description: data.description,
          team_id: data.team_id,
          workspace_id: data.workspace_id,
          owner_id: user.id,
          created_by: user.id,
          visibility: data.visibility || 'private',
          status: data.status || 'planning',
          icon: data.icon || null,
          color: data.color || DEFAULT_PROJECT_COLOR,
        })
        .select()
        .single();

      if (error) throw error;

      const projectRecord = project as Project;

      const { error: ownerMemberError } = await supabase
        .from('project_members')
        .upsert(
          {
            project_id: projectRecord.id,
            user_id: user.id,
            email: normalizeEmail(user.email || ''),
            role: 'owner',
            status: 'active',
            invited_by: user.id,
            joined_at: new Date().toISOString(),
          },
          {
            onConflict: 'project_id,email',
          }
        );

      if (ownerMemberError) throw ownerMemberError;

      await Promise.all(
        projectChannelDefinitions(projectRecord).map((channel) =>
          channelService.createChannel({
            workspace_id: projectRecord.workspace_id as string,
            name: channel.name,
            slug: channel.slug,
            description: channel.description,
            type: channel.type,
            visibility: channel.visibility,
            icon: channel.icon,
          })
        )
      );

      if (data.members && data.members.length > 0) {
        const sanitizedInvites = data.members.filter(
          (invite) => normalizeEmail(invite.email) !== normalizeEmail(user.email || '')
        );

        if (sanitizedInvites.length > 0) {
          await projectService.inviteProjectMembers(projectRecord.id, sanitizedInvites);
        }
      }

      await syncProjectSearchDocument(projectRecord, projectContext?.organization_id);

      recordActivity({
        workspace_id: projectRecord.workspace_id || undefined,
        actor_id: user.id,
        entity_type: 'project',
        entity_id: projectRecord.id,
        event_type: 'project_created',
        title: `Project created: ${projectRecord.name}`,
        description: projectRecord.description || `Created project ${projectRecord.name}`,
        metadata: {
          project_id: projectRecord.id,
          project_name: projectRecord.name,
          action: 'created project',
          workspace_id: projectRecord.workspace_id,
        },
      });

      recordAudit({
        project_id: projectRecord.id,
        workspace_id: projectRecord.workspace_id,
        organization_id: projectContext?.organization_id,
        actor_id: user.id,
        action: 'project_created',
        entity_type: 'project',
        entity_id: projectRecord.id,
        before_data: {},
        after_data: projectRecord as unknown as Record<string, unknown>,
        metadata: {
          project_name: projectRecord.name,
          visibility: projectRecord.visibility,
          status: projectRecord.status,
        },
      });

      return {
        data: projectRecord,
        error: null,
        message: 'Project created successfully',
      };
    } catch (error: any) {
      return {
        data: null,
        error: error.message || 'Failed to create project',
      };
    }
  },

  async updateProject(id: string, data: UpdateProjectData): Promise<ApiResponse<Project>> {
    try {
      const { data: existingProject, error: fetchError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const { data: project, error } = await supabase
        .from('projects')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedProject = project as Project;
      const workspaceContext = updatedProject.workspace_id
        ? await resolveWorkspaceContext(updatedProject.workspace_id)
        : null;

      if (updatedProject.workspace_id) {
        await syncProjectSearchDocument(
          updatedProject,
          workspaceContext?.organization_id
        );
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await activityService
          .createActivity({
            workspace_id: updatedProject.workspace_id || undefined,
            actor_id: user.id,
            entity_type: 'project',
            entity_id: updatedProject.id,
            event_type: 'project_updated',
            title: `Project updated: ${updatedProject.name}`,
            description: updatedProject.description || `Updated project ${updatedProject.name}`,
            metadata: {
              project_id: updatedProject.id,
              project_name: updatedProject.name,
              action: 'updated project',
              workspace_id: updatedProject.workspace_id,
            },
          })
          .catch(() => undefined);

        recordAudit({
          project_id: updatedProject.id,
          workspace_id: updatedProject.workspace_id,
          organization_id: workspaceContext?.organization_id,
          actor_id: user.id,
          action: 'project_updated',
          entity_type: 'project',
          entity_id: updatedProject.id,
          before_data: existingProject as unknown as Record<string, unknown>,
          after_data: updatedProject as unknown as Record<string, unknown>,
          metadata: {
            project_name: updatedProject.name,
            changes: data,
          },
        });
      }

      return {
        data: updatedProject,
        error: null,
        message: 'Project updated successfully',
      };
    } catch (error: any) {
      return {
        data: null,
        error: error.message || 'Failed to update project',
      };
    }
  },

  async deleteProject(id: string): Promise<ApiResponse<void>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { project, workspaceContext } = await fetchProjectContext(id);

      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await removeDefaultProjectChannels(project);
      await removeProjectSearchDocument(project.id);

      if (user) {
        await activityService
          .createActivity({
            workspace_id: project.workspace_id || undefined,
            actor_id: user.id,
            entity_type: 'project',
            entity_id: project.id,
            event_type: 'project_deleted',
            title: `Project deleted: ${project.name}`,
            description: project.description || `Deleted project ${project.name}`,
            metadata: {
              project_id: project.id,
              project_name: project.name,
              action: 'deleted project',
              workspace_id: project.workspace_id,
            },
          })
          .catch(() => undefined);

        recordAudit({
          project_id: project.id,
          workspace_id: project.workspace_id,
          organization_id: workspaceContext?.organization_id,
          actor_id: user.id,
          action: 'project_deleted',
          entity_type: 'project',
          entity_id: project.id,
          before_data: project as unknown as Record<string, unknown>,
          after_data: { deleted: true },
          metadata: {
            project_name: project.name,
          },
        });
      }

      return {
        data: null,
        error: null,
        message: 'Project deleted successfully',
      };
    } catch (error: any) {
      return {
        data: null,
        error: error.message || 'Failed to delete project',
      };
    }
  },

  async listProjectMembers(projectId: string): Promise<ProjectMember[]> {
    const { data, error } = await supabase
      .from('project_members')
      .select(`
        id,
        project_id,
        user_id,
        email,
        role,
        status,
        invited_by,
        joined_at,
        created_at,
        updated_at,
        profiles (
          id,
          full_name,
          username,
          avatar_url,
          email
        )
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data || []) as unknown as ProjectMember[];
  },

  async listProjectInvitations(projectId: string): Promise<ProjectInvitation[]> {
    const { data, error } = await supabase
      .from('project_invitations')
      .select(`
        *,
        invited_by_profile:profiles (
          id,
          full_name,
          username,
          avatar_url,
          email
        )
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as unknown as ProjectInvitation[];
  },

  async listProjectAuditLogs(projectId: string): Promise<ProjectAuditLog[]> {
    return auditService.listProjectAuditLogs(projectId);
  },

  async inviteProjectMembers(projectId: string, invites: InviteProjectMemberInput[]): Promise<ProjectInvitation[]> {
    const normalizedInvites = invites
      .map((invite) => ({
        ...invite,
        email: normalizeEmail(invite.email),
      }))
      .filter((invite) => invite.email.length > 0);

    if (normalizedInvites.length === 0) {
      return [];
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    const { project, workspaceContext } = await fetchProjectContext(projectId);
    const createdInvitations: ProjectInvitation[] = [];

    for (const invite of normalizedInvites) {
      const token = createInvitationToken();
      const expiresAt = invite.expires_at
        ? invite.expires_at
        : new Date(Date.now() + DEFAULT_INVITATION_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();

      const invitationPayload = {
        project_id: projectId,
        email: invite.email,
        role: invite.role,
        token,
        status: 'pending',
        expires_at: expiresAt,
        invited_by: user.id,
      };

      const memberPayload = toProjectMemberPayload(
        projectId,
        invite.email,
        invite.role,
        user.id
      );

      const { data: invitation, error: invitationError } = await supabase
        .from('project_invitations')
        .upsert(invitationPayload, {
          onConflict: 'project_id,email',
        })
        .select()
        .single();

      if (invitationError) throw invitationError;

      const { error: memberError } = await supabase
        .from('project_members')
        .upsert(memberPayload, {
          onConflict: 'project_id,email',
        });

      if (memberError) throw memberError;

      createdInvitations.push(invitation as ProjectInvitation);

      await activityService
        .createActivity({
          workspace_id: project.workspace_id ?? undefined,
          actor_id: user.id,
          entity_type: 'invitation',
          entity_id: invitation.id,
          event_type: 'member_invited',
          title: `Member invited: ${invite.email}`,
          description: `Invited ${invite.email} to ${project.name}`,
          metadata: {
            project_id: project.id,
            project_name: project.name,
            invitee_email: invite.email,
            role: invite.role,
            action: 'invited member',
          },
        })
        .catch(() => undefined);

      recordAudit({
        project_id: project.id,
        workspace_id: project.workspace_id,
        organization_id: workspaceContext?.organization_id,
        actor_id: user.id,
        action: 'member_invited',
        entity_type: 'invitation',
        entity_id: invitation.id,
        before_data: {},
        after_data: invitation as unknown as Record<string, unknown>,
        metadata: {
          project_name: project.name,
          invitee_email: invite.email,
          role: invite.role,
        },
      });
    }

    return createdInvitations;
  },

  async updateProjectMemberRole(
    projectId: string,
    memberId: string,
    role: ProjectRole
  ): Promise<ProjectMember> {
    const { project, workspaceContext } = await fetchProjectContext(projectId);
    const { data: existingMember, error: fetchError } = await supabase
      .from('project_members')
      .select('*')
      .eq('id', memberId)
      .single();

    if (fetchError) throw fetchError;

    const { data, error } = await supabase
      .from('project_members')
      .update({
        role,
      })
      .eq('id', memberId)
      .select()
      .single();

    if (error) throw error;

    const updatedMember = data as ProjectMember;
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      await activityService
        .createActivity({
          workspace_id: project.workspace_id ?? undefined,
          actor_id: user.id,
          entity_type: 'project',
          entity_id: project.id,
          event_type: 'member_role_updated',
          title: 'Project member role updated',
          description: `Updated ${updatedMember.email}'s role`,
          metadata: {
            project_id: project.id,
            project_name: project.name,
            user_id: updatedMember.user_id ?? undefined,
            user_name: updatedMember.email,
            role,
            action: 'updated member role',
          },
        })
        .catch(() => undefined);

      recordAudit({
        project_id: project.id,
        workspace_id: project.workspace_id,
        organization_id: workspaceContext?.organization_id,
        actor_id: user.id,
        action: 'member_role_updated',
        entity_type: 'project_member',
        entity_id: updatedMember.id,
        before_data: existingMember as unknown as Record<string, unknown>,
        after_data: updatedMember as unknown as Record<string, unknown>,
        metadata: {
          project_name: project.name,
          role,
        },
      });
    }

    return updatedMember;
  },

  async updateProjectMemberStatus(
    projectId: string,
    memberId: string,
    status: ProjectMemberStatus
  ): Promise<ProjectMember> {
    const { project, workspaceContext } = await fetchProjectContext(projectId);
    const { data: existingMember, error: fetchError } = await supabase
      .from('project_members')
      .select('*')
      .eq('id', memberId)
      .single();

    if (fetchError) throw fetchError;

    const updatePayload: Record<string, unknown> = { status };
    const eventType =
      status === 'suspended'
        ? 'member_suspended'
        : status === 'active'
          ? 'member_reactivated'
          : 'member_removed';

    if (status === 'active' && !existingMember.joined_at) {
      updatePayload.joined_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('project_members')
      .update(updatePayload)
      .eq('id', memberId)
      .select()
      .single();

    if (error) throw error;

    const updatedMember = data as ProjectMember;
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      await activityService
        .createActivity({
          workspace_id: project.workspace_id || undefined,
          actor_id: user.id,
          entity_type: 'project',
          entity_id: project.id,
          event_type: eventType,
          title:
            status === 'suspended'
              ? 'Project member suspended'
              : status === 'active'
                ? 'Project member reactivated'
                : 'Project member removed',
          description: `${updatedMember.email} is now ${status}`,
          metadata: {
            project_id: project.id,
            project_name: project.name,
            user_id: updatedMember.user_id ?? undefined,
            user_name: updatedMember.email,
            status,
            action:
              status === 'suspended'
                ? 'suspended member'
                : status === 'active'
                  ? 'reactivated member'
                  : 'removed member',
          },
        })
        .catch(() => undefined);

      recordAudit({
        project_id: project.id,
        workspace_id: project.workspace_id,
        organization_id: workspaceContext?.organization_id,
        actor_id: user.id,
        action: eventType,
        entity_type: 'project_member',
        entity_id: updatedMember.id,
        before_data: existingMember as unknown as Record<string, unknown>,
        after_data: updatedMember as unknown as Record<string, unknown>,
        metadata: {
          project_name: project.name,
          status,
        },
      });
    }

    return updatedMember;
  },

  async suspendProjectMember(projectId: string, memberId: string): Promise<ProjectMember> {
    return projectService.updateProjectMemberStatus(projectId, memberId, 'suspended');
  },

  async reactivateProjectMember(projectId: string, memberId: string): Promise<ProjectMember> {
    return projectService.updateProjectMemberStatus(projectId, memberId, 'active');
  },

  async removeProjectMember(projectId: string, memberId: string): Promise<ProjectMember> {
    return projectService.updateProjectMemberStatus(projectId, memberId, 'removed');
  },

  async transferProjectOwnership(
    projectId: string,
    input: TransferProjectOwnershipInput
  ): Promise<Project> {
    const { project, workspaceContext } = await fetchProjectContext(projectId);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    const { data: targetMember, error: targetMemberError } = await supabase
      .from('project_members')
      .select('*')
      .eq('id', input.memberId)
      .single();

    if (targetMemberError) throw targetMemberError;
    if (!targetMember.user_id || targetMember.status !== 'active') {
      throw new Error('Ownership can only be transferred to an active member');
    }

    const { data: currentOwnerMember, error: ownerMemberError } = await supabase
      .from('project_members')
      .select('*')
      .eq('project_id', projectId)
      .eq('role', 'owner')
      .single();

    if (ownerMemberError) throw ownerMemberError;

    const previousOwnerId = currentOwnerMember.user_id;
    const newOwnerId = targetMember.user_id;
    if (!previousOwnerId || !newOwnerId) {
      throw new Error('Ownership transfer requires valid member user ids');
    }

    const { error: targetUpdateError } = await supabase
      .from('project_members')
      .update({
        role: 'owner',
        status: 'active',
        joined_at: targetMember.joined_at || new Date().toISOString(),
      })
      .eq('id', targetMember.id);

    if (targetUpdateError) throw targetUpdateError;

    const { error: ownerUpdateError } = await supabase
      .from('project_members')
      .update({
        role: 'admin',
        status: 'active',
      })
      .eq('id', currentOwnerMember.id);

    if (ownerUpdateError) throw ownerUpdateError;

    const { data: updatedProject, error: projectUpdateError } = await supabase
      .from('projects')
      .update({
        owner_id: newOwnerId,
      })
      .eq('id', projectId)
      .select()
      .single();

    if (projectUpdateError) throw projectUpdateError;

    await activityService
      .createActivity({
        workspace_id: project.workspace_id || undefined,
        actor_id: user.id,
        entity_type: 'project',
        entity_id: project.id,
        event_type: 'member_role_updated',
        title: 'Project ownership transferred',
        description: `Transferred ownership to ${targetMember.email}`,
        metadata: {
          project_id: project.id,
          project_name: project.name,
          action: 'transferred ownership',
          previous_owner_id: previousOwnerId,
          new_owner_id: newOwnerId,
        },
      })
      .catch(() => undefined);

    recordAudit({
      project_id: project.id,
      workspace_id: project.workspace_id,
      organization_id: workspaceContext?.organization_id,
      actor_id: user.id,
      action: 'ownership_transferred',
      entity_type: 'project',
      entity_id: project.id,
      before_data: project as unknown as Record<string, unknown>,
      after_data: updatedProject as unknown as Record<string, unknown>,
      metadata: {
        project_name: project.name,
        previous_owner_id: previousOwnerId,
        new_owner_id: newOwnerId,
      },
    });

    return updatedProject as Project;
  },

  async claimPendingInvitations(): Promise<
    Array<{
      project_id: string;
      workspace_id: string;
      invitation_id: string;
      member_id: string;
      email: string;
      role: ProjectRole;
    }>
  > {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) {
      return [];
    }

    const { data, error } = await supabase.rpc('claim_project_invitations', {
      p_user_id: user.id,
      p_email: user.email,
    });

    if (error) throw error;
    return (data || []) as Array<{
      project_id: string;
      workspace_id: string;
      invitation_id: string;
      member_id: string;
      email: string;
      role: ProjectRole;
    }>;
  },
};
