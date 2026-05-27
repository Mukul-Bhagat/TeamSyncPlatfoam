import { useState } from 'react';
import { useWorkspaces } from '@/features/workspace/hooks/useWorkspaces';
import { Layers, ChevronDown, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkspaceSwitcherProps {
  organizationId: string;
  currentWorkspaceId?: string;
  onWorkspaceChange?: (workspaceId: string) => void;
  onCreateWorkspace?: () => void;
}

export function WorkspaceSwitcher({
  organizationId,
  currentWorkspaceId,
  onWorkspaceChange,
  onCreateWorkspace,
}: WorkspaceSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: workspaces, isLoading } = useWorkspaces(organizationId);

  const currentWorkspace = workspaces?.find((ws) => ws.id === currentWorkspaceId);

  if (isLoading) {
    return (
      <div className="w-full h-10 bg-glass border border-glass-border rounded-lg animate-pulse" />
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center justify-between px-3 py-2',
          'bg-glass border border-glass-border rounded-lg',
          'hover:border-primary/50 transition-all duration-fast',
          'focus:outline-none focus:ring-2 focus:ring-ring'
        )}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center">
            {currentWorkspace?.icon ? (
              <span className="text-sm">{currentWorkspace.icon}</span>
            ) : (
              <Layers className="w-4 h-4 text-accent" />
            )}
          </div>
          <span className="text-sm font-medium text-foreground truncate">
            {currentWorkspace?.name || 'Select Workspace'}
          </span>
        </div>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-muted-foreground transition-transform duration-fast',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div
            className={cn(
              'absolute top-full left-0 right-0 mt-2',
              'bg-glass border border-glass-border rounded-lg',
              'shadow-elevation-lg backdrop-blur-xl',
              'overflow-hidden z-20 animate-in fade-in slide-in-from-top-2'
            )}
          >
            <div className="p-2 space-y-1 max-h-64 overflow-y-auto">
              {workspaces?.map((workspace) => (
                <button
                  key={workspace.id}
                  onClick={() => {
                    onWorkspaceChange?.(workspace.id);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 rounded-lg',
                    'text-left transition-all duration-fast',
                    'hover:bg-accent/10',
                    currentWorkspaceId === workspace.id
                      ? 'bg-accent/20 text-accent'
                      : 'text-foreground'
                  )}
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center">
                    {workspace.icon ? (
                      <span className="text-sm">{workspace.icon}</span>
                    ) : (
                      <Layers className="w-4 h-4" />
                    )}
                  </div>
                  <span className="text-sm font-medium truncate">
                    {workspace.name}
                  </span>
                </button>
              ))}
            </div>

            {onCreateWorkspace && (
              <div className="border-t border-glass-border p-2">
                <button
                  onClick={() => {
                    onCreateWorkspace();
                    setIsOpen(false);
                  }}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 rounded-lg',
                    'text-sm font-medium text-muted-foreground',
                    'hover:text-foreground hover:bg-accent/10',
                    'transition-all duration-fast'
                  )}
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Workspace</span>
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
