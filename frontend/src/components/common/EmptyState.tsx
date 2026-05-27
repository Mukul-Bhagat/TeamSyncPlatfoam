import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const defaultIcon = <Inbox className="h-12 w-12 text-muted-foreground" />;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center',
        'animate-fade-in',
        className
      )}
    >
      <div className="mb-4">{icon || defaultIcon}</div>
      <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-6">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
