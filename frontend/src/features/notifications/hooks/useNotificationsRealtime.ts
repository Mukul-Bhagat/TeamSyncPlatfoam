import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRealtime } from '@/realtime/hooks';
import type { Notification } from '../types/notification.types';

export function useNotificationsRealtime(userId: string) {
  const queryClient = useQueryClient();
  const realtime = useRealtime();

  useEffect(() => {
    if (!userId) return;

    const channel = `notifications:user_id=eq.${userId}`;

    const _subscription = realtime.subscribe(channel, (event) => {
      const queryKey = ['notifications', userId];

      switch (event.type) {
        case 'INSERT': {
          const newNotification = event.payload as { record: Notification };
          queryClient.setQueryData(queryKey, (old: Notification[] = []) => {
            if (old.some((n) => n.id === newNotification.record.id)) {
              return old;
            }
            return [newNotification.record, ...old];
          });
          // Also update unread count
          queryClient.invalidateQueries({ queryKey: ['unread-count', userId] });
          break;
        }

        case 'UPDATE': {
          const updatedNotification = event.payload as { record: Notification };
          queryClient.setQueryData(queryKey, (old: Notification[] = []) => {
            return old.map((n) =>
              n.id === updatedNotification.record.id ? updatedNotification.record : n
            );
          });
          // Update unread count if read_at changed
          if (updatedNotification.record.read_at) {
            queryClient.invalidateQueries({ queryKey: ['unread-count', userId] });
          }
          break;
        }

        case 'DELETE': {
          const deletedNotification = event.payload as { old: Notification };
          queryClient.setQueryData(queryKey, (old: Notification[] = []) => {
            return old.filter((n) => n.id !== deletedNotification.old.id);
          });
          // Update unread count if it was unread
          if (!deletedNotification.old.read_at) {
            queryClient.invalidateQueries({ queryKey: ['unread-count', userId] });
          }
          break;
        }
      }
    }, 'useNotificationsRealtime');

    return () => {
      realtime.unsubscribeByOwner('useNotificationsRealtime');
    };
  }, [userId, realtime, queryClient]);
}
