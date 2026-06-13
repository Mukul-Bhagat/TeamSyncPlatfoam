import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { QueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/common/Toast';
import { useWorkspaceContextStore } from '@/store/workspace-context.store';
import { projectService } from '@/services/project.service';
import type { ApiResponse, PaginationParams } from '@/types';
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

export interface UseProjectsOptions extends Partial<PaginationParams> {
  useContextDefaults?: boolean;
}

function unwrapApiResponse<T>(
  response: ApiResponse<T>,
  fallbackMessage: string,
  requireData = false
): ApiResponse<T> {
  if (response.error) {
    throw new Error(response.error);
  }

  if (requireData && (response.data === null || response.data === undefined)) {
    throw new Error(fallbackMessage);
  }

  return response;
}

function getErrorMessage(error: unknown, fallbackMessage: string) {
  return error instanceof Error ? error.message : fallbackMessage;
}

export function useProjects(params?: UseProjectsOptions) {
  const workspaceContext = useWorkspaceContextStore();
  const useContextDefaults = params?.useContextDefaults ?? true;
  const paginationParams: PaginationParams = {
    page: params?.page || 1,
    limit: params?.limit || 10,
    sortBy: params?.sortBy,
    sortOrder: params?.sortOrder,
    workspaceId: params?.workspaceId ?? (useContextDefaults ? workspaceContext.workspaceId ?? undefined : undefined),
    organizationId: params?.organizationId ?? (useContextDefaults ? workspaceContext.organizationId ?? undefined : undefined),
  };

  return useQuery({
    queryKey: ['projects', paginationParams],
    queryFn: async () =>
      unwrapApiResponse(
        await projectService.getProjects(paginationParams),
        'Failed to fetch projects',
        true
      ),
    select: (data) => data.data,
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: async () =>
      unwrapApiResponse(
        await projectService.getProject(id),
        'Failed to fetch project',
        true
      ),
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
    mutationFn: async (input: CreateProjectData) =>
      unwrapApiResponse(
        await projectService.createProject(input),
        'Failed to create project',
        true
      ),
    onSuccess: (data) => {
      invalidateProjectQueries(queryClient, data.data?.id);
      toast.success(data.message || 'Project created successfully');
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Failed to create project'));
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateProjectData }) =>
      unwrapApiResponse(
        await projectService.updateProject(id, data),
        'Failed to update project',
        true
      ),
    onSuccess: (data) => {
      invalidateProjectQueries(queryClient, data.data?.id);
      toast.success(data.message || 'Project updated successfully');
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Failed to update project'));
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) =>
      unwrapApiResponse(await projectService.deleteProject(id), 'Failed to delete project'),
    onSuccess: (data) => {
      invalidateProjectQueries(queryClient);
      toast.success(data.message || 'Project deleted successfully');
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Failed to delete project'));
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
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Failed to invite project members'));
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
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Failed to update member role'));
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
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Failed to update member status'));
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
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Failed to suspend member'));
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
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Failed to reactivate member'));
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
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Failed to remove member'));
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
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Failed to transfer ownership'));
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
