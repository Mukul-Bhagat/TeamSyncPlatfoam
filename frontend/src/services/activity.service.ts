import { supabase } from '@/lib/supabase';
import type { ActivityFeedEvent, ActivityMetadata, ActivityEventType, EntityType } from '@/features/activity/types/activity.types';

export class ActivityService {
  async createActivity(data: {
    organization_id?: string;
    workspace_id?: string;
    channel_id?: string;
    actor_id: string;
    entity_type: EntityType;
    entity_id: string;
    event_type: ActivityEventType;
    title: string;
    description?: string;
    metadata: ActivityMetadata;
  }): Promise<ActivityFeedEvent> {
    const { data: activity, error } = await supabase
      .from('activity_feed')
      .insert({
        organization_id: data.organization_id,
        workspace_id: data.workspace_id,
        channel_id: data.channel_id,
        actor_id: data.actor_id,
        entity_type: data.entity_type,
        entity_id: data.entity_id,
        event_type: data.event_type,
        title: data.title,
        description: data.description,
        metadata: data.metadata,
      })
      .select()
      .single();

    if (error) throw error;
    return activity;
  }

  async getActivities(options?: {
    organization_id?: string;
    workspace_id?: string;
    channel_id?: string;
    event_type?: ActivityEventType;
    entity_type?: EntityType;
    entity_id?: string;
    actor_id?: string;
    limit?: number;
    offset?: number;
  }): Promise<ActivityFeedEvent[]> {
    let query = supabase
      .from('activity_feed')
      .select('*')
      .order('created_at', { ascending: false });

    if (options?.organization_id) {
      query = query.eq('organization_id', options.organization_id);
    }

    if (options?.workspace_id) {
      query = query.eq('workspace_id', options.workspace_id);
    }

    if (options?.channel_id) {
      query = query.eq('channel_id', options.channel_id);
    }

    if (options?.event_type) {
      query = query.eq('event_type', options.event_type);
    }

    if (options?.entity_type) {
      query = query.eq('entity_type', options.entity_type);
    }

    if (options?.entity_id) {
      query = query.eq('entity_id', options.entity_id);
    }

    if (options?.actor_id) {
      query = query.eq('actor_id', options.actor_id);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  async getActivitiesByType(eventType: ActivityEventType, options?: {
    organization_id?: string;
    workspace_id?: string;
    limit?: number;
  }): Promise<ActivityFeedEvent[]> {
    return this.getActivities({
      event_type: eventType,
      organization_id: options?.organization_id,
      workspace_id: options?.workspace_id,
      limit: options?.limit,
    });
  }

  async getActivityStream(options?: {
    organization_id?: string;
    workspace_id?: string;
    limit?: number;
    offset?: number;
  }): Promise<ActivityFeedEvent[]> {
    return this.getActivities({
      organization_id: options?.organization_id,
      workspace_id: options?.workspace_id,
      limit: options?.limit,
      offset: options?.offset,
    });
  }

  async getEntityActivities(entityType: EntityType, entityId: string, limit?: number): Promise<ActivityFeedEvent[]> {
    return this.getActivities({
      entity_type: entityType,
      entity_id: entityId,
      limit,
    });
  }

  async getActivity(activityId: string): Promise<ActivityFeedEvent | null> {
    const { data, error } = await supabase
      .from('activity_feed')
      .select('*')
      .eq('id', activityId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data;
  }
}

export const activityService = new ActivityService();
