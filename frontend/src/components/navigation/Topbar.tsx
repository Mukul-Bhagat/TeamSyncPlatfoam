import type { ReactNode } from 'react';
import { Bell, Search, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TopbarProps {
  title?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  actions?: ReactNode;
  className?: string;
}

export function Topbar({ title, breadcrumbs, actions, className }: TopbarProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-30 bg-card/80 backdrop-blur-glass-md border-b',
        'transition-all duration-normal ease-out-cubic',
        className
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        {/* Left section - Breadcrumbs/Title */}
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          {breadcrumbs && breadcrumbs.length > 0 ? (
            <nav className="flex items-center space-x-2 text-sm">
              {breadcrumbs.map((crumb, index) => (
                <div key={crumb.label} className="flex items-center space-x-2">
                  {index > 0 && (
                    <span className="text-muted-foreground">/</span>
                  )}
                  {crumb.href ? (
                    <a
                      href={crumb.href}
                      className="text-muted-foreground hover:text-foreground transition-colors duration-fast"
                    >
                      {crumb.label}
                    </a>
                  ) : (
                    <span className="text-foreground font-medium">{crumb.label}</span>
                  )}
                </div>
              ))}
            </nav>
          ) : title ? (
            <h1 className="font-heading font-semibold text-lg text-foreground truncate">
              {title}
            </h1>
          ) : null}
        </div>

        {/* Center section - Search (hidden on mobile) */}
        <div className="hidden md:flex flex-1 justify-center max-w-lg mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              className={cn(
                'w-full pl-10 pr-4 py-2',
                'bg-background border rounded-lg',
                'text-sm text-foreground placeholder:text-muted-foreground',
                'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
                'transition-all duration-fast'
              )}
            />
          </div>
        </div>

        {/* Right section - Actions */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          <button
            className={cn(
              'p-2 rounded-lg hover:bg-muted transition-colors duration-fast',
              'relative'
            )}
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5 text-muted-foreground" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-primary rounded-full" />
          </button>
          
          {actions}

          <button
            className={cn(
              'p-2 rounded-lg hover:bg-muted transition-colors duration-fast',
              'md:hidden'
            )}
            aria-label="More options"
          >
            <MoreVertical className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
      </div>
    </header>
  );
}
