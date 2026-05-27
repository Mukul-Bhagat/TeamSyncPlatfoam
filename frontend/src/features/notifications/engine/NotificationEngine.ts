import { notificationService } from '@/services/notification.service';
import type { Notification, NotificationGroup, NotificationType, NotificationPriority, NotificationMetadata } from '../types/notification.types';

export interface NotificationGroupingRule {
  type: NotificationType;
  groupBy: string;
  timeWindow: number; // milliseconds
}

export class NotificationEngine {
  private groupingRules: NotificationGroupingRule[] = [
    {
      type: 'deployment_alert' as NotificationType,
      groupBy: 'workspace_id',
      timeWindow: 5 * 60 * 1000, // 5 minutes
    },
    {
      type: 'message_mention' as NotificationType,
      groupBy: 'channel_id',
      timeWindow: 10 * 60 * 1000, // 10 minutes
    },
    {
      type: 'incident_alert' as NotificationType,
      groupBy: 'workspace_id',
      timeWindow: 15 * 60 * 1000, // 15 minutes
    },
  ];

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
    // Check for deduplication
    const isDuplicate = await this.checkDuplicate(data);
    if (isDuplicate) {
      throw new Error('Duplicate notification');
    }

    return notificationService.createNotification(data);
  }

  private async checkDuplicate(data: {
    user_id: string;
    type: NotificationType;
    workspace_id?: string;
    channel_id?: string;
    metadata: unknown;
  }): Promise<boolean> {
    // Basic deduplication: check for same type and entity within time window
    const recentNotifications = await notificationService.getUserNotifications(data.user_id, {
      type: data.type,
      limit: 10,
    });

    for (const notification of recentNotifications) {
      const isSameWorkspace = notification.workspace_id === data.workspace_id;
      const isSameChannel = notification.channel_id === data.channel_id;
      const isRecent = Date.now() - new Date(notification.created_at).getTime() < 60000; // 1 minute

      if (isSameWorkspace && isSameChannel && isRecent) {
        return true;
      }
    }

    return false;
  }

  groupNotifications(notifications: Notification[]): NotificationGroup[] {
    const groups: Map<string, NotificationGroup> = new Map();

    for (const notification of notifications) {
      const rule = this.groupingRules.find((r) => r.type === notification.type);
      
      if (!rule) {
        // No grouping rule, create individual group
        const groupId = notification.id;
        groups.set(groupId, {
          id: groupId,
          type: notification.type,
          priority: notification.priority,
          count: 1,
          title: notification.title,
          notifications: [notification],
          created_at: notification.created_at,
        });
        continue;
      }

      // Determine group key based on grouping rule
      const groupKey = this.getGroupKey(notification, rule);
      
      if (groups.has(groupKey)) {
        const group = groups.get(groupKey)!;
        group.notifications.push(notification);
        group.count++;
        
        // Update created_at to the most recent
        const latestDate = new Date(notification.created_at);
        const groupDate = new Date(group.created_at);
        if (latestDate > groupDate) {
          group.created_at = notification.created_at;
        }
      } else {
        groups.set(groupKey, {
          id: groupKey,
          type: notification.type,
          priority: notification.priority,
          count: 1,
          title: this.getGroupTitle(notification, rule),
          notifications: [notification],
          created_at: notification.created_at,
        });
      }
    }

    return Array.from(groups.values()).sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  private getGroupKey(notification: Notification, rule: NotificationGroupingRule): string {
    const parts: string[] = [notification.type];
    
    if (rule.groupBy === 'workspace_id' && notification.workspace_id) {
      parts.push(notification.workspace_id);
    }
    if (rule.groupBy === 'channel_id' && notification.channel_id) {
      parts.push(notification.channel_id);
    }
    
    return parts.join(':');
  }

  private getGroupTitle(notification: Notification, _rule: NotificationGroupingRule): string {
    // Generate grouped title based on notification type
    switch (notification.type) {
      case 'deployment_alert' as const:
        return 'Deployment Alerts';
      case 'message_mention' as const:
        return 'Mentions';
      case 'incident_alert' as const:
        return 'Incident Alerts';
      default:
        return notification.title;
    }
  }

  prioritizeNotifications(notifications: Notification[]): Notification[] {
    const priorityOrder: Record<NotificationPriority, number> = {
      critical: 0,
      high: 1,
      medium: 2,
      low: 3,
    };

    return notifications.sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      // Same priority, sort by created_at
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }

  async aggregateFeed(userId: string, options?: {
    unreadOnly?: boolean;
    priority?: NotificationPriority;
    type?: NotificationType;
    limit?: number;
  }): Promise<NotificationGroup[]> {
    const notifications = await notificationService.getUserNotifications(userId, options);
    const prioritized = this.prioritizeNotifications(notifications);
    return this.groupNotifications(prioritized);
  }
}

export const notificationEngine = new NotificationEngine();
