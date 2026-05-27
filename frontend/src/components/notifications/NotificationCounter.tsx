import { useUnreadCount, useWorkspaceUnreadCount, useChannelUnreadCount } from '@/features/notifications/hooks/useNotifications';
import { cn } from '@/lib/utils';

interface NotificationCounterProps {
  userId: string;
  className?: string;
  showZero?: boolean;
}

export function NotificationCounter({ userId, className, showZero = false }: NotificationCounterProps) {
  const { data: count } = useUnreadCount(userId);

  if (!count && !showZero) return null;

  return (
    <span
      className={cn(
        'flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-medium rounded-full',
        'bg-primary text-primary-foreground',
        'transition-all duration-fast',
        className
      )}
    >
      {count || 0}
    </span>
  );
}

interface WorkspaceNotificationCounterProps {
  userId: string;
  workspaceId: string;
  className?: string;
  showZero?: boolean;
}

export function WorkspaceNotificationCounter({ userId, workspaceId, className, showZero = false }: WorkspaceNotificationCounterProps) {
  const { data: count } = useWorkspaceUnreadCount(userId, workspaceId);

  if (!count && !showZero) return null;

  return (
    <span
      className={cn(
        'flex items-center justify-center min-w-[18px] h-4 px-1 text-[10px] font-medium rounded-full',
        'bg-primary text-primary-foreground',
        'transition-all duration-fast',
        className
      )}
    >
      {count || 0}
    </span>
  );
}

interface ChannelNotificationCounterProps {
  userId: string;
  channelId: string;
  className?: string;
  showZero?: boolean;
}

export function ChannelNotificationCounter({ userId, channelId, className, showZero = false }: ChannelNotificationCounterProps) {
  const { data: count } = useChannelUnreadCount(userId, channelId);

  if (!count && !showZero) return null;

  return (
    <span
      className={cn(
        'flex items-center justify-center min-w-[16px] h-3.5 px-0.5 text-[9px] font-medium rounded-full',
        'bg-primary text-primary-foreground',
        'transition-all duration-fast',
        className
      )}
    >
      {count || 0}
    </span>
  );
}
