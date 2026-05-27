import type { ReactNode } from 'react';
import { Bot, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContextCardProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'ai' | 'info';
}

export function ContextCard({
  title,
  icon,
  children,
  className,
  variant = 'default',
}: ContextCardProps) {
  const defaultIcon = variant === 'ai' ? <Bot className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />;

  return (
    <div
      className={cn(
        'rounded-lg border bg-card/50 backdrop-blur-sm',
        'transition-all duration-fast hover:shadow-elevation-md',
        variant === 'ai' && 'border-primary/20 bg-gradient-subtle',
        className
      )}
    >
      <div className="flex items-center space-x-2 px-4 py-3 border-b">
        <div
          className={cn(
            'p-1.5 rounded-md',
            variant === 'ai'
              ? 'bg-primary/10 text-primary'
              : 'bg-muted text-muted-foreground'
          )}
        >
          {icon || defaultIcon}
        </div>
        <h3 className="font-heading font-semibold text-sm text-foreground">
          {title}
        </h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
