import { useState } from 'react';
import { useNotifications, useMarkAsRead, useMarkAsArchived, useMarkAllAsRead } from '@/features/notifications/hooks/useNotifications';
import { NotificationPriority } from '@/features/notifications/types/notification.types';
import { Bell, Check, Archive } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface NotificationCenterProps {
  userId: string;
}

export function NotificationCenter({ userId }: NotificationCenterProps) {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [priorityFilter, setPriorityFilter] = useState<NotificationPriority | 'all'>('all');
  const navigate = useNavigate();
  
  const { data: notifications, isLoading } = useNotifications(userId, {
    unreadOnly: filter === 'unread',
    priority: priorityFilter === 'all' ? undefined : priorityFilter,
  });
  
  const markAsRead = useMarkAsRead();
  const markAsArchived = useMarkAsArchived();
  const markAllAsRead = useMarkAllAsRead();

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead.mutateAsync(notificationId);
  };

  const handleMarkAsArchived = async (notificationId: string) => {
    await markAsArchived.mutateAsync(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead.mutateAsync(userId);
  };

  const handleNotificationAction = (notification: any) => {
    const metadata = notification.metadata as any;
    
    switch (notification.type) {
      case 'message_mention':
        if (metadata.channel_id) {
          navigate(`/workspace/${notification.workspace_id}/channel/${metadata.channel_id}`);
        }
        break;
      case 'workspace_invite':
        if (metadata.workspace_id) {
          navigate(`/workspace/${metadata.workspace_id}`);
        }
        break;
      case 'deployment_alert':
      case 'incident_alert':
        if (metadata.workspace_id) {
          navigate(`/workspace/${metadata.workspace_id}`);
        }
        break;
      case 'ai_summary':
        if (metadata.channel_id) {
          navigate(`/workspace/${notification.workspace_id}/channel/${metadata.channel_id}`);
        }
        break;
      default:
        break;
    }
  };

  const getActionButton = (notification: any) => {
    const metadata = notification.metadata as any;
    
    switch (notification.type) {
      case 'message_mention':
        return (
          <button
            onClick={() => handleNotificationAction(notification)}
            className="px-3 py-1.5 text-xs bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
          >
            View Message
          </button>
        );
      case 'workspace_invite':
        return (
          <button
            onClick={() => handleNotificationAction(notification)}
            className="px-3 py-1.5 text-xs bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
          >
            Open Workspace
          </button>
        );
      case 'deployment_alert':
        return (
          <button
            onClick={() => handleNotificationAction(notification)}
            className="px-3 py-1.5 text-xs bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
          >
            View Deployment
          </button>
        );
      case 'incident_alert':
        return (
          <button
            onClick={() => handleNotificationAction(notification)}
            className="px-3 py-1.5 text-xs bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
          >
            View Incident
          </button>
        );
      case 'ai_summary':
        return (
          <button
            onClick={() => handleNotificationAction(notification)}
            className="px-3 py-1.5 text-xs bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
          >
            View Summary
          </button>
        );
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority: NotificationPriority) => {
    switch (priority) {
      case 'low':
        return <span className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground">Low</span>;
      case 'medium':
        return <span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">Medium</span>;
      case 'high':
        return <span className="px-2 py-0.5 text-xs rounded-full bg-warning/10 text-warning">High</span>;
      case 'critical':
        return <span className="px-2 py-0.5 text-xs rounded-full bg-danger/10 text-danger">Critical</span>;
    }
  };

  const getPriorityBorder = (priority: NotificationPriority) => {
    switch (priority) {
      case 'low':
        return 'border-l-2 border-l-muted';
      case 'medium':
        return 'border-l-2 border-l-primary/30';
      case 'high':
        return 'border-l-2 border-l-warning/50';
      case 'critical':
        return 'border-l-2 border-l-danger/50';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-glass-border">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllAsRead}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Mark all as read
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 p-4 border-b border-glass-border">
        <button
          onClick={() => setFilter('all')}
          className={cn(
            'px-3 py-1.5 text-xs rounded-lg transition-colors',
            filter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-glass text-muted-foreground hover:text-foreground'
          )}
        >
          All
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={cn(
            'px-3 py-1.5 text-xs rounded-lg transition-colors',
            filter === 'unread' ? 'bg-primary text-primary-foreground' : 'bg-glass text-muted-foreground hover:text-foreground'
          )}
        >
          Unread
        </button>
        
        <div className="flex-1" />
        
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as NotificationPriority | 'all')}
          className="px-2 py-1 text-xs bg-glass border border-glass-border rounded-lg text-foreground"
        >
          <option value="all">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto">
        {notifications && notifications.length > 0 ? (
          <div className="space-y-2 p-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  'p-4 rounded-lg bg-glass border border-glass-border hover:border-primary/30 transition-colors',
                  getPriorityBorder(notification.priority),
                  !notification.read_at && 'bg-primary/5'
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-medium text-foreground">{notification.title}</h3>
                      {getPriorityBadge(notification.priority)}
                    </div>
                    {notification.message && (
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getActionButton(notification)}
                    {!notification.read_at && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4 text-muted-foreground" />
                      </button>
                    )}
                    <button
                      onClick={() => handleMarkAsArchived(notification.id)}
                      className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                      title="Archive"
                    >
                      <Archive className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No notifications</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
