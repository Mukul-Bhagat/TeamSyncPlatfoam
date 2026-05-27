import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRealtime } from '@/realtime/hooks';
import type { ActivityFeedEvent } from '../types/activity.types';

export function useActivitiesRealtime(options?: {
  workspaceId?: string;
  organizationId?: string;
}) {
  const queryClient = useQueryClient();
  const realtime = useRealtime();

  useEffect(() => {
    let channel = 'activity_feed';
    
    if (options?.workspaceId) {
      channel = `activity_feed:workspace_id=eq.${options.workspaceId}`;
    } else if (options?.organizationId) {
      channel = `activity_feed:organization_id=eq.${options.organizationId}`;
    }

    const _subscription = realtime.subscribe(channel, (event) => {
      const queryKey = ['activities', options];

      switch (event.type) {
        case 'INSERT': {
          const newActivity = event.payload as { record: ActivityFeedEvent };
          queryClient.setQueryData(queryKey, (old: ActivityFeedEvent[] = []) => {
            if (old.some((a) => a.id === newActivity.record.id)) {
              return old;
            }
            return [newActivity.record, ...old];
          });
          break;
        }

        case 'UPDATE': {
          const updatedActivity = event.payload as { record: ActivityFeedEvent };
          queryClient.setQueryData(queryKey, (old: ActivityFeedEvent[] = []) => {
            return old.map((a) =>
              a.id === updatedActivity.record.id ? updatedActivity.record : a
            );
          });
          break;
        }

        case 'DELETE': {
          const deletedActivity = event.payload as { old: ActivityFeedEvent };
          queryClient.setQueryData(queryKey, (old: ActivityFeedEvent[] = []) => {
            return old.filter((a) => a.id !== deletedActivity.old.id);
          });
          break;
        }
      }
    }, 'useActivitiesRealtime');

    return () => {
      realtime.unsubscribeByOwner('useActivitiesRealtime');
    };
  }, [options, realtime, queryClient]);
}
