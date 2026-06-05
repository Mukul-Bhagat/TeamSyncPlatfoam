import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { QueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/common/Toast';
import { useWorkspaceContextStore } from '@/store/workspace-context.store';
import { projectService } from '@/services/project.service';
import type { PaginationParams } from '@/types';
import type {
  ProjectAuditLog,
  ProjectInvitation,
  ProjectMember,
  ProjectMemberStatus,
  ProjectRole,
} from '@/features/projects/types/project.types';
import type {
  CreateProjectData,
  InviteProjectMemberInput,
  TransferProjectOwnershipInput,
  UpdateProjectData,
} from '@/services/project.service';

export function useProjects(params?: Partial<PaginationParams>) {
  const workspaceContext = useWorkspaceContextStore();
  const paginationParams: PaginationParams = {
    page: params?.page || 1,
    limit: params?.limit || 10,
    sortBy: params?.sortBy,
    sortOrder: params?.sortOrder,
    workspaceId: params?.workspaceId ?? workspaceContext.workspaceId ?? undefined,
    organizationId: params?.organizationId ?? workspaceContext.organizationId ?? undefined,
  };

  return useQuery({
    queryKey: ['projects', paginationParams],
    queryFn: () => projectService.getProjects(paginationParams),
    select: (data) => data.data,
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => projectService.getProject(id),
    select: (data) => data.data,
    enabled: !!id,
  });
}

export function useProjectMembers(projectId: string) {
  return useQuery({
    queryKey: ['project', projectId, 'members'],
    queryFn: () => projectService.listProjectMembers(projectId),
    enabled: !!projectId,
  });
}

export function useProjectInvitations(projectId: string) {
  return useQuery({
    queryKey: ['project', projectId, 'invitations'],
    queryFn: () => projectService.listProjectInvitations(projectId),
    enabled: !!projectId,
  });
}

export function useProjectAuditLogs(projectId: string) {
  return useQuery({
    queryKey: ['project', projectId, 'audit-logs'],
    queryFn: () => projectService.listProjectAuditLogs(projectId),
    enabled: !!projectId,
  });
}

function invalidateProjectQueries(queryClient: QueryClient, projectId?: string) {
  queryClient.invalidateQueries({ queryKey: ['projects'] });
  if (projectId) {
    queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    queryClient.invalidateQueries({ queryKey: ['project', projectId, 'members'] });
    queryClient.invalidateQueries({ queryKey: ['project', projectId, 'invitations'] });
    queryClient.invalidateQueries({ queryKey: ['project', projectId, 'audit-logs'] });
  }
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (input: CreateProjectData) => projectService.createProject(input),
    onSuccess: (data) => {
      invalidateProjectQueries(queryClient, data.data?.id);
      toast.success(data.message || 'Project created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create project');
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectData }) =>
      projectService.updateProject(id, data),
    onSuccess: (data) => {
      invalidateProjectQueries(queryClient, data.data?.id);
      toast.success(data.message || 'Project updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update project');
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: projectService.deleteProject,
    onSuccess: (data) => {
      invalidateProjectQueries(queryClient);
      toast.success(data.message || 'Project deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete project');
    },
  });
}

export function useInviteProjectMembers(projectId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (invites: InviteProjectMemberInput[]) =>
      projectService.inviteProjectMembers(projectId, invites),
    onSuccess: () => {
      invalidateProjectQueries(queryClient, projectId);
      toast.success('Invitations sent successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to invite project members');
    },
  });
}

export function useUpdateProjectMemberRole(projectId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: ProjectRole }) =>
      projectService.updateProjectMemberRole(projectId, memberId, role),
    onSuccess: () => {
      invalidateProjectQueries(queryClient, projectId);
      toast.success('Member role updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update member role');
    },
  });
}

export function useUpdateProjectMemberStatus(projectId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ memberId, status }: { memberId: string; status: ProjectMemberStatus }) =>
      projectService.updateProjectMemberStatus(projectId, memberId, status),
    onSuccess: () => {
      invalidateProjectQueries(queryClient, projectId);
      toast.success('Member status updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update member status');
    },
  });
}

export function useSuspendProjectMember(projectId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (memberId: string) => projectService.suspendProjectMember(projectId, memberId),
    onSuccess: () => {
      invalidateProjectQueries(queryClient, projectId);
      toast.success('Member suspended successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to suspend member');
    },
  });
}

export function useReactivateProjectMember(projectId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (memberId: string) => projectService.reactivateProjectMember(projectId, memberId),
    onSuccess: () => {
      invalidateProjectQueries(queryClient, projectId);
      toast.success('Member reactivated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to reactivate member');
    },
  });
}

export function useRemoveProjectMember(projectId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (memberId: string) => projectService.removeProjectMember(projectId, memberId),
    onSuccess: () => {
      invalidateProjectQueries(queryClient, projectId);
      toast.success('Member removed successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to remove member');
    },
  });
}

export function useTransferProjectOwnership(projectId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (input: TransferProjectOwnershipInput) =>
      projectService.transferProjectOwnership(projectId, input),
    onSuccess: () => {
      invalidateProjectQueries(queryClient, projectId);
      toast.success('Ownership transferred successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to transfer ownership');
    },
  });
}

export function useClaimPendingProjectInvitations() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => projectService.claimPendingInvitations(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export type {
  ProjectAuditLog,
  ProjectInvitation,
  ProjectMember,
  ProjectMemberStatus,
  ProjectRole,
};
