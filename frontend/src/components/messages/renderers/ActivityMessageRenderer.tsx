import type { Message } from '@/features/messages/types/message.types';
import { Activity } from 'lucide-react';

interface ActivityMessageRendererProps {
  message: Message;
}

export function ActivityMessageRenderer({ message }: ActivityMessageRendererProps) {
  const metadata = message.metadata as any;

  return (
    <div className="p-3 bg-glass/30 border-l-2 border-primary/50 rounded-r">
      <div className="flex items-center gap-2">
        <Activity className="w-4 h-4 text-primary" />
        <span className="text-sm text-foreground">
          {message.content || metadata?.action || 'Activity event'}
        </span>
      </div>
      {metadata?.entityType && (
        <div className="text-xs text-muted-foreground mt-1">
          {metadata.entityType}: {metadata.entityId}
        </div>
      )}
    </div>
  );
}
