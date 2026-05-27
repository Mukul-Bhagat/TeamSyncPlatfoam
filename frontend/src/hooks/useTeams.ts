import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teamService } from '@/services/team.service';
import { useToast } from '@/components/common/Toast';
import type { PaginationParams } from '@/types';

export function useTeams(params?: Partial<PaginationParams>) {
  return useQuery({
    queryKey: ['teams', params],
    queryFn: () => {
      const paginationParams: PaginationParams = {
        page: params?.page || 1,
        limit: params?.limit || 10,
      };
      return teamService.getTeams(paginationParams);
    },
    select: (data) => data.data,
  });
}

export function useTeam(id: string) {
  return useQuery({
    queryKey: ['team', id],
    queryFn: () => teamService.getTeam(id),
    select: (data) => data.data,
    enabled: !!id,
  });
}

export function useTeamMembers(teamId: string) {
  return useQuery({
    queryKey: ['team-members', teamId],
    queryFn: () => teamService.getTeamMembers(teamId),
    select: (data) => data.data,
    enabled: !!teamId,
  });
}

export function useCreateTeam() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: teamService.createTeam,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast.success(data.message || 'Team created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create team');
    },
  });
}

export function useUpdateTeam() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      teamService.updateTeam(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['team', data.data?.id] });
      toast.success(data.message || 'Team updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update team');
    },
  });
}

export function useDeleteTeam() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: teamService.deleteTeam,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast.success(data.message || 'Team deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete team');
    },
  });
}

export function useInviteMember() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ teamId, data }: { teamId: string; data: any }) =>
      teamService.inviteMember(teamId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast.success(data.message || 'Member invited successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to invite member');
    },
  });
}
