import type { ReactNode } from 'react';
import { Hash, Lock, Settings, Users, Pin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChannelType } from '@/features/channels/types/channel.types';

interface ChannelLayoutProps {
  children?: ReactNode;
  rightPanelContent?: ReactNode;
  rightPanelTitle?: string;
  className?: string;
  channel: {
    id: string;
    name: string;
    description?: string;
    type: ChannelType;
    visibility: string;
    icon?: string;
  };
}

export function ChannelLayout({
  children,
  rightPanelContent,
  rightPanelTitle = 'Channel Details',
  className,
  channel,
}: ChannelLayoutProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Channel Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-glass-border bg-glass/50 backdrop-blur-glass-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
            {channel.icon ? (
              <span className="text-lg">{channel.icon}</span>
            ) : (
              <Hash className="w-5 h-5 text-primary" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-foreground">{channel.name}</h1>
              {channel.visibility === 'private' && (
                <Lock className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
            {channel.description && (
              <p className="text-sm text-muted-foreground">{channel.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg hover:bg-muted transition-colors duration-fast" title="Pinned Items">
            <Pin className="w-5 h-5 text-muted-foreground" />
          </button>
          <button className="p-2 rounded-lg hover:bg-muted transition-colors duration-fast" title="Members">
            <Users className="w-5 h-5 text-muted-foreground" />
          </button>
          <button className="p-2 rounded-lg hover:bg-muted transition-colors duration-fast" title="Settings">
            <Settings className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Center Content */}
        <main className={cn('flex-1 overflow-y-auto', className)}>
          {children}
        </main>

        {/* Right Context Panel */}
        {rightPanelContent && (
          <aside className="w-80 border-l border-glass-border bg-glass/30 backdrop-blur-glass-sm overflow-y-auto">
            <div className="p-4 border-b border-glass-border">
              <h2 className="text-sm font-semibold text-foreground">{rightPanelTitle}</h2>
            </div>
            <div className="p-4">
              {rightPanelContent}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
