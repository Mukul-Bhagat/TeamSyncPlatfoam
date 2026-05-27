import { useQuery } from '@tanstack/react-query';
import { activityService } from '@/services/activity.service';
import type { ActivityEventType, EntityType } from '../types/activity.types';

export function useActivities(options?: {
  organization_id?: string;
  workspace_id?: string;
  channel_id?: string;
  event_type?: ActivityEventType;
  entity_type?: EntityType;
  entity_id?: string;
  actor_id?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['activities', options],
    queryFn: () => activityService.getActivities(options),
  });
}

export function useActivitiesByType(eventType: ActivityEventType, options?: {
  organization_id?: string;
  workspace_id?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['activities', 'type', eventType, options],
    queryFn: () => activityService.getActivitiesByType(eventType, options),
  });
}

export function useActivityStream(options?: {
  organization_id?: string;
  workspace_id?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['activities', 'stream', options],
    queryFn: () => activityService.getActivityStream(options),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function useEntityActivities(entityType: EntityType, entityId: string, limit?: number) {
  return useQuery({
    queryKey: ['activities', 'entity', entityType, entityId, limit],
    queryFn: () => activityService.getEntityActivities(entityType, entityId, limit),
  });
}

export function useActivity(activityId: string) {
  return useQuery({
    queryKey: ['activity', activityId],
    queryFn: () => activityService.getActivity(activityId),
    enabled: !!activityId,
  });
}
