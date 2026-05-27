import type { ReactNode } from 'react';
import { usePanelStore } from '@/store/usePanelStore';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RightPanelProps {
  children: ReactNode;
  title?: string;
  className?: string;
}

export function RightPanel({ children, title, className }: RightPanelProps) {
  const {
    rightPanelCollapsed,
    rightPanelMobileOpen,
    toggleRightPanel,
    setRightPanelMobileOpen,
  } = usePanelStore();

  return (
    <>
      {/* Mobile backdrop */}
      {rightPanelMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-fade-in"
          onClick={() => setRightPanelMobileOpen(false)}
        />
      )}

      {/* Right Panel */}
      <aside
        className={cn(
          'fixed right-0 top-0 z-50 h-full bg-card/95 backdrop-blur-glass-md border-l',
          'transition-all duration-normal ease-out-cubic',
          'shadow-elevation-lg',
          // Desktop behavior
          'hidden lg:flex flex-col',
          rightPanelCollapsed ? 'w-16' : 'w-[350px]',
          // Mobile behavior
          'lg:hidden',
          rightPanelMobileOpen ? 'translate-x-0 w-[320px]' : 'translate-x-full',
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b">
          {!rightPanelCollapsed && (
            <>
              {title && (
                <h2 className="font-heading font-semibold text-lg text-foreground">
                  {title}
                </h2>
              )}
              <button
                onClick={toggleRightPanel}
                className="p-2 rounded-lg hover:bg-muted transition-colors duration-fast"
                aria-label="Collapse panel"
              >
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            </>
          )}
          
          {rightPanelCollapsed && (
            <button
              onClick={toggleRightPanel}
              className="p-2 rounded-lg hover:bg-muted transition-colors duration-fast"
              aria-label="Expand panel"
            >
              <ChevronLeft className="h-5 w-5 text-muted-foreground" />
            </button>
          )}

          {/* Mobile close button */}
          <button
            onClick={() => setRightPanelMobileOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors duration-fast"
            aria-label="Close panel"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {!rightPanelCollapsed ? (
            <div className="p-4">{children}</div>
          ) : (
            <div className="flex flex-col items-center py-4 space-y-4">
              {/* Collapsed state could show icons for quick access */}
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-primary" />
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile toggle button (visible when panel is closed) */}
      <button
        onClick={() => setRightPanelMobileOpen(true)}
        className={cn(
          'lg:hidden fixed bottom-4 right-4 z-30',
          'p-3 rounded-full bg-primary text-primary-foreground',
          'shadow-elevation-lg',
          'transition-all duration-normal ease-out-cubic',
          'hover:scale-105 active:scale-95',
          rightPanelMobileOpen && 'hidden'
        )}
        aria-label="Open context panel"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
    </>
  );
}
