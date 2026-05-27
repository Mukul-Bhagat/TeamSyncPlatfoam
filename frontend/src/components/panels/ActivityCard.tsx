import type { ReactNode } from 'react';
import { Clock, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityCardProps {
  avatar?: string;
  user: string;
  action: string;
  timestamp: string;
  metadata?: ReactNode;
  className?: string;
}

export function ActivityCard({
  avatar,
  user,
  action,
  timestamp,
  metadata,
  className,
}: ActivityCardProps) {
  return (
    <div
      className={cn(
        'flex items-start space-x-3 p-3 rounded-lg',
        'bg-muted/30 hover:bg-muted/50',
        'transition-all duration-fast',
        'border border-transparent hover:border-border',
        className
      )}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        {avatar ? (
          <img
            src={avatar}
            alt={user}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-subtle flex items-center justify-center">
            <User className="h-4 w-4 text-primary" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm">
          <span className="font-medium text-foreground">{user}</span>
          <span className="text-muted-foreground"> {action}</span>
        </p>
        <div className="flex items-center space-x-2 mt-1">
          <Clock className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{timestamp}</span>
        </div>
        {metadata && <div className="mt-2">{metadata}</div>}
      </div>
    </div>
  );
}
