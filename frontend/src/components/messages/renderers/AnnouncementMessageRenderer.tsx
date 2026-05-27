import type { Message } from '@/features/messages/types/message.types';
import { Megaphone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnnouncementMessageRendererProps {
  message: Message;
}

export function AnnouncementMessageRenderer({ message }: AnnouncementMessageRendererProps) {
  const metadata = message.metadata as any;
  const priority = metadata?.priority || 'medium';

  const priorityConfig = {
    low: { color: 'text-muted-foreground', bg: 'bg-muted' },
    medium: { color: 'text-primary', bg: 'bg-primary/10' },
    high: { color: 'text-warning', bg: 'bg-warning/10' },
    urgent: { color: 'text-danger', bg: 'bg-danger/10' },
  };

  const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium;

  return (
    <div className={cn('p-4 border rounded-lg', config.bg, 'border-glass-border')}>
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-white/10">
          <Megaphone className={cn('w-5 h-5', config.color)} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-foreground">Announcement</span>
            <span className={cn('text-xs px-2 py-0.5 rounded-full uppercase', config.bg, config.color)}>
              {priority}
            </span>
          </div>
          {message.content && (
            <p className="text-sm text-foreground whitespace-pre-wrap">{message.content}</p>
          )}
          {metadata?.expiresAt && (
            <div className="mt-2 text-xs text-muted-foreground">
              Expires: {new Date(metadata.expiresAt).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
