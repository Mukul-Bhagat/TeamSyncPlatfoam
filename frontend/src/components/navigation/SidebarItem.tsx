import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  href?: string;
  onClick?: () => void;
  active?: boolean;
  badge?: number | string;
  children?: ReactNode;
  expanded?: boolean;
  onExpand?: () => void;
  className?: string;
}

export function SidebarItem({
  icon: Icon,
  label,
  href,
  onClick,
  active = false,
  badge,
  children,
  expanded = false,
  onExpand,
  className,
}: SidebarItemProps) {
  const hasChildren = children && onExpand;
  const Component = href ? 'a' : 'button';

  return (
    <div className="flex flex-col">
      <Component
        href={href}
        onClick={onClick}
        className={cn(
          'flex items-center justify-between w-full px-3 py-2.5 rounded-lg',
          'transition-all duration-fast ease-out-cubic',
          'group relative',
          active
            ? 'bg-gradient-subtle text-foreground border border-primary/20'
            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
          className
        )}
      >
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <Icon
            className={cn(
              'h-5 w-5 flex-shrink-0 transition-colors duration-fast',
              active ? 'text-primary' : 'group-hover:text-foreground'
            )}
          />
          <span className="font-medium text-sm truncate">{label}</span>
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0">
          {badge && (
            <span
              className={cn(
                'px-2 py-0.5 text-xs font-medium rounded-full',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {badge}
            </span>
          )}
          {hasChildren && (
            <ChevronRight
              className={cn(
                'h-4 w-4 transition-transform duration-fast',
                expanded && 'rotate-90'
              )}
            />
          )}
        </div>

        {/* Active indicator */}
        {active && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
        )}
      </Component>

      {/* Nested children */}
      {hasChildren && expanded && (
        <div className="ml-4 mt-1 space-y-1 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
}
