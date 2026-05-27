import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRealtime } from './useRealtime';
import type { Message } from '@/features/messages/types/message.types';

export function useChannelMessages(channelId: string) {
  const queryClient = useQueryClient();
  const realtime = useRealtime();
  const subscriptionRef = useRef<string>();

  useEffect(() => {
    if (!channelId) return;

    const channel = `messages:channel_id=eq.${channelId}`;

    const subscription = realtime.subscribe(channel, (event) => {
      const queryKey = ['messages', channelId];

      switch (event.type) {
        case 'INSERT': {
          const newMessage = event.payload as { record: Message };
          queryClient.setQueryData(queryKey, (old: Message[] = []) => {
            // Check if message already exists to avoid duplicates
            if (old.some((m) => m.id === newMessage.record.id)) {
              return old;
            }
            return [...old, newMessage.record];
          });
          break;
        }

        case 'UPDATE': {
          const updatedMessage = event.payload as { record: Message };
          queryClient.setQueryData(queryKey, (old: Message[] = []) => {
            return old.map((m) =>
              m.id === updatedMessage.record.id ? updatedMessage.record : m
            );
          });
          break;
        }

        case 'DELETE': {
          const deletedMessage = event.payload as { old: Message };
          queryClient.setQueryData(queryKey, (old: Message[] = []) => {
            return old.filter((m) => m.id !== deletedMessage.old.id);
          });
          break;
        }
      }
    }, 'useChannelMessages');

    subscriptionRef.current = subscription.id;

    return () => {
      if (subscriptionRef.current) {
        realtime.unsubscribeByOwner('useChannelMessages');
      }
    };
  }, [channelId, realtime, queryClient]);
}
