import { useState } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Topbar } from '@/components/navigation/Topbar';
import { Bell, Check, Archive, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications, useMarkAsRead, useMarkAsArchived, useMarkAllAsRead } from '@/features/notifications/hooks/useNotifications';

type FilterType = 'all' | 'unread' | 'archived';

export function NotificationCenterPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<FilterType>('all');
  const { data: notifications, isLoading } = useNotifications(user?.id || '', {
    unreadOnly: filter === 'unread',
  });
  const markAsRead = useMarkAsRead();
  const markAsArchived = useMarkAsArchived();
  const markAllAsRead = useMarkAllAsRead();

  const filteredNotifications = notifications?.filter((n) => {
    if (filter === 'unread') return !n.read_at;
    if (filter === 'archived') return !!n.archived_at;
    return !n.archived_at;
  });

  const handleMarkAsRead = (notificationId: string) => {
    markAsRead.mutate(notificationId);
  };

  const handleMarkAsArchived = (notificationId: string) => {
    markAsArchived.mutate(notificationId);
  };

  const handleMarkAllAsRead = () => {
    if (user?.id) {
      markAllAsRead.mutate(user.id);
    }
  };

  return (
    <DashboardLayout>
      <Topbar
        title="Notification Center"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Notifications' },
        ]}
        actions={
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground bg-glass border border-glass-border rounded-lg hover:bg-primary/10 transition-all duration-fast"
          >
            <Check className="w-4 h-4" />
            Mark All as Read
          </button>
        }
      />

      <div className="p-6">
        {/* Filters */}
        <div className="flex items-center gap-2 mb-6">
          <Filter className="w-5 h-5 text-muted-foreground" />
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={cn(
                'px-3 py-1.5 text-sm rounded-lg transition-colors',
                filter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-glass text-muted-foreground hover:text-foreground'
              )}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={cn(
                'px-3 py-1.5 text-sm rounded-lg transition-colors',
                filter === 'unread' ? 'bg-primary text-primary-foreground' : 'bg-glass text-muted-foreground hover:text-foreground'
              )}
            >
              Unread
            </button>
            <button
              onClick={() => setFilter('archived')}
              className={cn(
                'px-3 py-1.5 text-sm rounded-lg transition-colors',
                filter === 'archived' ? 'bg-primary text-primary-foreground' : 'bg-glass text-muted-foreground hover:text-foreground'
              )}
            >
              Archived
            </button>
          </div>
        </div>

        {/* Notifications List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">Loading notifications...</div>
          </div>
        ) : filteredNotifications && filteredNotifications.length > 0 ? (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  'p-4 rounded-lg border transition-all',
                  !notification.read_at ? 'bg-primary/5 border-primary/20' : 'bg-card border-glass-border'
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn(
                        'px-2 py-0.5 rounded-full text-xs font-medium',
                        notification.priority === 'critical' ? 'bg-red-500/10 text-red-500' :
                        notification.priority === 'high' ? 'bg-amber-500/10 text-amber-500' :
                        'bg-blue-500/10 text-blue-500'
                      )}>
                        {notification.priority}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(notification.created_at).toLocaleString()}
                      </span>
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">{notification.title}</h3>
                    {notification.message && (
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {!notification.read_at && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="p-2 rounded-lg hover:bg-primary/10 transition-colors"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4 text-muted-foreground" />
                      </button>
                    )}
                    <button
                      onClick={() => handleMarkAsArchived(notification.id)}
                      className="p-2 rounded-lg hover:bg-primary/10 transition-colors"
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
          <div className="flex flex-col items-center justify-center py-12">
            <Bell className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No notifications found</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
