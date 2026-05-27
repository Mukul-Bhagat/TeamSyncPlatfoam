import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { channelService } from '@/services/channel.service';
import type {
  CreateChannelInput,
  UpdateChannelInput,
  AddChannelMemberInput,
  UpdateChannelMemberRoleInput,
} from '@/features/channels/types/channel.types';

export function useChannels(workspaceId: string) {
  return useQuery({
    queryKey: ['channels', workspaceId],
    queryFn: () => channelService.listWorkspaceChannels(workspaceId),
    enabled: !!workspaceId,
  });
}

export function useChannel(id: string) {
  return useQuery({
    queryKey: ['channel', id],
    queryFn: () => channelService.getChannel(id),
    enabled: !!id,
  });
}

export function useCreateChannel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateChannelInput) =>
      channelService.createChannel(input),
    onSuccess: (_, { workspace_id }) => {
      queryClient.invalidateQueries({ queryKey: ['channels', workspace_id] });
    },
  });
}

export function useUpdateChannel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateChannelInput }) =>
      channelService.updateChannel(id, input),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['channel', id] });
      queryClient.invalidateQueries({ queryKey: ['channels'] });
    },
  });
}

export function useDeleteChannel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => channelService.deleteChannel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels'] });
    },
  });
}

export function useJoinChannel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (channelId: string) => channelService.joinChannel(channelId),
    onSuccess: (_, channelId) => {
      queryClient.invalidateQueries({ queryKey: ['channel', channelId, 'members'] });
      queryClient.invalidateQueries({ queryKey: ['channels'] });
    },
  });
}

export function useLeaveChannel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (channelId: string) => channelService.leaveChannel(channelId),
    onSuccess: (_, channelId) => {
      queryClient.invalidateQueries({ queryKey: ['channel', channelId, 'members'] });
      queryClient.invalidateQueries({ queryKey: ['channels'] });
    },
  });
}

export function useAddChannelMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AddChannelMemberInput) =>
      channelService.addChannelMember(input),
    onSuccess: (_, { channel_id }) => {
      queryClient.invalidateQueries({ queryKey: ['channel', channel_id, 'members'] });
    },
  });
}

export function useRemoveChannelMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ channelId, userId }: { channelId: string; userId: string }) =>
      channelService.removeChannelMember(channelId, userId),
    onSuccess: (_, { channelId }) => {
      queryClient.invalidateQueries({ queryKey: ['channel', channelId, 'members'] });
    },
  });
}

export function useUpdateChannelMemberRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ channelId, userId, input }: { channelId: string; userId: string; input: UpdateChannelMemberRoleInput }) =>
      channelService.updateChannelMemberRole(channelId, userId, input),
    onSuccess: (_, { channelId }) => {
      queryClient.invalidateQueries({ queryKey: ['channel', channelId, 'members'] });
    },
  });
}

export function useChannelMembers(channelId: string) {
  return useQuery({
    queryKey: ['channel', channelId, 'members'],
    queryFn: () => channelService.listChannelMembers(channelId),
    enabled: !!channelId,
  });
}
