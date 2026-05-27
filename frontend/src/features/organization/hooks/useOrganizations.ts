import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { organizationService } from '@/services/organization.service';
import type {
  CreateOrganizationInput,
  UpdateOrganizationInput,
  AddMemberInput,
  UpdateMemberRoleInput,
} from '@/features/organization/types/organization.types';

export function useOrganizations() {
  return useQuery({
    queryKey: ['organizations'],
    queryFn: () => organizationService.listUserOrganizations(),
  });
}

export function useOrganization(id: string) {
  return useQuery({
    queryKey: ['organization', id],
    queryFn: () => organizationService.getOrganization(id),
    enabled: !!id,
  });
}

export function useCreateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateOrganizationInput) =>
      organizationService.createOrganization(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateOrganizationInput }) =>
      organizationService.updateOrganization(id, input),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['organization', id] });
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
}

export function useDeleteOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => organizationService.deleteOrganization(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
}

export function useAddMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AddMemberInput) =>
      organizationService.addMember(input),
    onSuccess: (_, { organization_id }) => {
      queryClient.invalidateQueries({ queryKey: ['organization', organization_id, 'members'] });
    },
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ organizationId, userId }: { organizationId: string; userId: string }) =>
      organizationService.removeMember(organizationId, userId),
    onSuccess: (_, { organizationId }) => {
      queryClient.invalidateQueries({ queryKey: ['organization', organizationId, 'members'] });
    },
  });
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ organizationId, userId, input }: { organizationId: string; userId: string; input: UpdateMemberRoleInput }) =>
      organizationService.updateMemberRole(organizationId, userId, input),
    onSuccess: (_, { organizationId }) => {
      queryClient.invalidateQueries({ queryKey: ['organization', organizationId, 'members'] });
    },
  });
}

export function useOrganizationMembers(organizationId: string) {
  return useQuery({
    queryKey: ['organization', organizationId, 'members'],
    queryFn: () => organizationService.listOrganizationMembers(organizationId),
    enabled: !!organizationId,
  });
}
