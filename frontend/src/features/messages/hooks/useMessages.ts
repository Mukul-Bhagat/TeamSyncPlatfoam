import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messageService } from '@/services/message.service';
import type {
  CreateMessageInput,
  UpdateMessageInput,
  AddReactionInput,
  UploadAttachmentInput,
} from '@/features/messages/types/message.types';

export function useMessages(channelId: string, limit = 50, offset = 0) {
  return useQuery({
    queryKey: ['messages', channelId, limit, offset],
    queryFn: () => messageService.getChannelMessages(channelId, limit, offset),
    enabled: !!channelId,
  });
}

export function useMessage(id: string) {
  return useQuery({
    queryKey: ['message', id],
    queryFn: () => messageService.getMessage(id),
    enabled: !!id,
  });
}

export function useCreateMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateMessageInput) => messageService.createMessage(input),
    onSuccess: (_, { channel_id }) => {
      queryClient.invalidateQueries({ queryKey: ['messages', channel_id] });
    },
  });
}

export function useUpdateMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateMessageInput }) =>
      messageService.updateMessage(id, input),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['message', id] });
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });
}

export function useDeleteMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => messageService.deleteMessage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });
}

export function useAddReaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AddReactionInput) => messageService.addReaction(input),
    onSuccess: (_, { message_id }) => {
      queryClient.invalidateQueries({ queryKey: ['message', message_id, 'reactions'] });
      queryClient.invalidateQueries({ queryKey: ['message', message_id] });
    },
  });
}

export function useRemoveReaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ messageId, emoji }: { messageId: string; emoji: string }) =>
      messageService.removeReaction(messageId, emoji),
    onSuccess: (_, { messageId }) => {
      queryClient.invalidateQueries({ queryKey: ['message', messageId, 'reactions'] });
      queryClient.invalidateQueries({ queryKey: ['message', messageId] });
    },
  });
}

export function useMessageReactions(messageId: string) {
  return useQuery({
    queryKey: ['message', messageId, 'reactions'],
    queryFn: () => messageService.getMessageReactions(messageId),
    enabled: !!messageId,
  });
}

export function useUploadAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UploadAttachmentInput) => messageService.uploadAttachment(input),
    onSuccess: (_, { message_id }) => {
      queryClient.invalidateQueries({ queryKey: ['message', message_id, 'attachments'] });
      queryClient.invalidateQueries({ queryKey: ['message', message_id] });
    },
  });
}

export function useDeleteAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (attachmentId: string) => messageService.deleteAttachment(attachmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message'] });
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });
}

export function useMessageAttachments(messageId: string) {
  return useQuery({
    queryKey: ['message', messageId, 'attachments'],
    queryFn: () => messageService.getMessageAttachments(messageId),
    enabled: !!messageId,
  });
}
