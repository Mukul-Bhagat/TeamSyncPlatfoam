import { supabase } from '@/lib/supabase';
import type { Notification, NotificationMetadata, NotificationPriority, NotificationType } from '@/features/notifications/types/notification.types';

export class NotificationService {
  async createNotification(data: {
    user_id: string;
    organization_id?: string;
    workspace_id?: string;
    channel_id?: string;
    type: NotificationType;
    title: string;
    message?: string;
    metadata: NotificationMetadata;
    priority?: NotificationPriority;
  }): Promise<Notification> {
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        user_id: data.user_id,
        organization_id: data.organization_id,
        workspace_id: data.workspace_id,
        channel_id: data.channel_id,
        type: data.type,
        title: data.title,
        message: data.message,
        metadata: data.metadata,
        priority: data.priority || 'medium',
      })
      .select()
      .single();

    if (error) throw error;
    return notification;
  }

  async getUserNotifications(userId: string, options?: {
    unreadOnly?: boolean;
    priority?: NotificationPriority;
    type?: NotificationType;
    limit?: number;
    offset?: number;
  }): Promise<Notification[]> {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .is('archived_at', null)
      .order('created_at', { ascending: false });

    if (options?.unreadOnly) {
      query = query.is('read_at', null);
    }

    if (options?.priority) {
      query = query.eq('priority', options.priority);
    }

    if (options?.type) {
      query = query.eq('type', options.type);
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

  async getNotification(notificationId: string): Promise<Notification | null> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', notificationId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data;
  }

  async markAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', notificationId);

    if (error) throw error;
  }

  async markAsArchived(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ archived_at: new Date().toISOString() })
      .eq('id', notificationId);

    if (error) throw error;
  }

  async batchMarkAsRead(notificationIds: string[]): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .in('id', notificationIds);

    if (error) throw error;
  }

  async markAllAsRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .is('read_at', null);

    if (error) throw error;
  }

  async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .is('read_at', null)
      .is('archived_at', null);

    if (error) throw error;
    return count || 0;
  }

  async getWorkspaceUnreadCount(userId: string, workspaceId: string): Promise<number> {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('workspace_id', workspaceId)
      .is('read_at', null)
      .is('archived_at', null);

    if (error) throw error;
    return count || 0;
  }

  async getChannelUnreadCount(userId: string, channelId: string): Promise<number> {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('channel_id', channelId)
      .is('read_at', null)
      .is('archived_at', null);

    if (error) throw error;
    return count || 0;
  }

  async deleteNotification(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) throw error;
  }
}

export const notificationService = new NotificationService();
