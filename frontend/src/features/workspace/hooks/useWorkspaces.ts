import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workspaceService } from '@/services/workspace.service';
import type {
  CreateWorkspaceInput,
  UpdateWorkspaceInput,
  AddWorkspaceMemberInput,
  UpdateWorkspaceMemberRoleInput,
} from '@/features/workspace/types/workspace.types';

export function useWorkspaces(organizationId: string) {
  return useQuery({
    queryKey: ['workspaces', organizationId],
    queryFn: () => workspaceService.listOrganizationWorkspaces(organizationId),
    enabled: !!organizationId,
  });
}

export function useWorkspace(id: string) {
  return useQuery({
    queryKey: ['workspace', id],
    queryFn: () => workspaceService.getWorkspace(id),
    enabled: !!id,
  });
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateWorkspaceInput) =>
      workspaceService.createWorkspace(input),
    onSuccess: (_, { organization_id }) => {
      queryClient.invalidateQueries({ queryKey: ['workspaces', organization_id] });
    },
  });
}

export function useUpdateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateWorkspaceInput }) =>
      workspaceService.updateWorkspace(id, input),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['workspace', id] });
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
}

export function useDeleteWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => workspaceService.deleteWorkspace(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
}

export function useAddWorkspaceMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AddWorkspaceMemberInput) =>
      workspaceService.addWorkspaceMember(input),
    onSuccess: (_, { workspace_id }) => {
      queryClient.invalidateQueries({ queryKey: ['workspace', workspace_id, 'members'] });
    },
  });
}

export function useRemoveWorkspaceMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workspaceId, userId }: { workspaceId: string; userId: string }) =>
      workspaceService.removeWorkspaceMember(workspaceId, userId),
    onSuccess: (_, { workspaceId }) => {
      queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId, 'members'] });
    },
  });
}

export function useUpdateWorkspaceMemberRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workspaceId, userId, input }: { workspaceId: string; userId: string; input: UpdateWorkspaceMemberRoleInput }) =>
      workspaceService.updateWorkspaceMemberRole(workspaceId, userId, input),
    onSuccess: (_, { workspaceId }) => {
      queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId, 'members'] });
    },
  });
}

export function useWorkspaceMembers(workspaceId: string) {
  return useQuery({
    queryKey: ['workspace', workspaceId, 'members'],
    queryFn: () => workspaceService.listWorkspaceMembers(workspaceId),
    enabled: !!workspaceId,
  });
}
