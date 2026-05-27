import type { ActivityFeedEvent } from '@/features/activity/types/activity.types';
import { Hash } from 'lucide-react';

interface ChannelActivityRendererProps {
  activity: ActivityFeedEvent;
}

export function ChannelActivityRenderer({ activity }: ChannelActivityRendererProps) {
  const metadata = activity.metadata as any;

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-glass border border-glass-border hover:border-primary/30 transition-colors">
      <div className="w-8 h-8 rounded-lg bg-gradient-subtle flex items-center justify-center">
        <Hash className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{activity.title}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {metadata.channel_name} • {metadata.channel_type}
        </p>
        {activity.description && (
          <p className="text-xs text-muted-foreground mt-1">{activity.description}</p>
        )}
      </div>
      <div className="text-xs text-muted-foreground">
        {new Date(activity.created_at).toLocaleTimeString()}
      </div>
    </div>
  );
}
