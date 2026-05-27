import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '@/services/notification.service';
import type { NotificationPriority, NotificationType } from '../types/notification.types';

export function useNotifications(userId: string, options?: {
  unreadOnly?: boolean;
  priority?: NotificationPriority;
  type?: NotificationType;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['notifications', userId, options],
    queryFn: () => notificationService.getUserNotifications(userId, options),
    enabled: !!userId,
  });
}

export function useNotification(notificationId: string) {
  return useQuery({
    queryKey: ['notification', notificationId],
    queryFn: () => notificationService.getNotification(notificationId),
    enabled: !!notificationId,
  });
}

export function useUnreadCount(userId: string) {
  return useQuery({
    queryKey: ['unread-count', userId],
    queryFn: () => notificationService.getUnreadCount(userId),
    enabled: !!userId,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function useWorkspaceUnreadCount(userId: string, workspaceId: string) {
  return useQuery({
    queryKey: ['unread-count', 'workspace', workspaceId, userId],
    queryFn: () => notificationService.getWorkspaceUnreadCount(userId, workspaceId),
    enabled: !!userId && !!workspaceId,
    refetchInterval: 30000,
  });
}

export function useChannelUnreadCount(userId: string, channelId: string) {
  return useQuery({
    queryKey: ['unread-count', 'channel', channelId, userId],
    queryFn: () => notificationService.getChannelUnreadCount(userId, channelId),
    enabled: !!userId && !!channelId,
    refetchInterval: 30000,
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => notificationService.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
    },
  });
}

export function useMarkAsArchived() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => notificationService.markAsArchived(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
    },
  });
}

export function useBatchMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationIds: string[]) => notificationService.batchMarkAsRead(notificationIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => notificationService.markAllAsRead(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => notificationService.deleteNotification(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
    },
  });
}
