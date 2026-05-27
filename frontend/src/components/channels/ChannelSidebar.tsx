import { useState } from 'react';
import { useChannels } from '@/features/channels/hooks/useChannels';
import { ChannelType } from '@/features/channels/types/channel.types';
import { CHANNEL_CATEGORIES, CHANNEL_TYPE_LABELS } from '@/features/channels/utils/channel.utils';
import { useTyping, usePresence } from '@/realtime/hooks';
import { ChevronDown, ChevronRight, Plus, Search, Hash, Lock, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChannelSidebarProps {
  workspaceId: string;
  currentChannelId?: string;
  onChannelSelect?: (channelId: string) => void;
  onCreateChannel?: () => void;
}

export function ChannelSidebar({
  workspaceId,
  currentChannelId,
  onChannelSelect,
  onCreateChannel,
}: ChannelSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<ChannelType>>(new Set());
  const { data: channels, isLoading } = useChannels(workspaceId);
  const { getTypingUsers } = useTyping();
  const { getChannelPresence } = usePresence();

  const toggleCategory = (type: ChannelType) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  const filteredChannels = channels?.filter((channel) =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupChannelsByType = (channelsList: typeof channels) => {
    if (!channelsList) return {};

    return channelsList.reduce((acc, channel) => {
      if (!acc[channel.type]) {
        acc[channel.type] = [];
      }
      acc[channel.type].push(channel);
      return acc;
    }, {} as Record<ChannelType, typeof channels>);
  };

  const groupedChannels = groupChannelsByType(filteredChannels);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-10 bg-glass border border-glass-border rounded-lg animate-pulse" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 bg-glass border border-glass-border rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search channels..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={cn(
            'w-full pl-10 pr-4 py-2',
            'bg-glass border border-glass-border rounded-lg',
            'text-sm text-foreground placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-ring',
            'transition-all duration-fast'
          )}
        />
      </div>

      {/* Create Channel Button */}
      <button
        onClick={onCreateChannel}
        className={cn(
          'w-full flex items-center justify-center gap-2 px-3 py-2',
          'bg-glass border border-glass-border rounded-lg',
          'text-sm font-medium text-muted-foreground',
          'hover:text-foreground hover:border-primary/50',
          'transition-all duration-fast'
        )}
      >
        <Plus className="w-4 h-4" />
        <span>Create Channel</span>
      </button>

      {/* Channel Categories */}
      <div className="space-y-1 max-h-[calc(100vh-300px)] overflow-y-auto">
        {CHANNEL_CATEGORIES.map((type) => {
          const categoryChannels = groupedChannels[type];
          if (!categoryChannels || categoryChannels.length === 0) return null;

          const isCollapsed = collapsedCategories.has(type);

          return (
            <div key={type} className="space-y-1">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(type)}
                className={cn(
                  'w-full flex items-center gap-2 px-2 py-1.5',
                  'text-xs font-semibold text-muted-foreground uppercase tracking-wider',
                  'hover:text-foreground transition-colors duration-fast'
                )}
              >
                {isCollapsed ? (
                  <ChevronRight className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
                <span>{CHANNEL_TYPE_LABELS[type]}</span>
                <span className="ml-auto text-[10px] opacity-60">
                  {categoryChannels.length}
                </span>
              </button>

              {/* Channel List */}
              {!isCollapsed && (
                <div className="space-y-0.5 pl-4">
                  {categoryChannels.map((channel) => {
                    const isActive = currentChannelId === channel.id;
                    const ChannelIcon = channel.icon ? undefined : Hash;
                    const typingUsers = getTypingUsers(channel.id);
                    const channelPresence = getChannelPresence(channel.id);
                    const hasActivity = typingUsers.length > 0 || channelPresence.length > 0;

                    return (
                      <button
                        key={channel.id}
                        onClick={() => onChannelSelect?.(channel.id)}
                        className={cn(
                          'w-full flex items-center gap-2 px-2 py-1.5 rounded-lg',
                          'text-left transition-all duration-fast',
                          'group',
                          isActive
                            ? 'bg-primary/20 text-primary'
                            : 'text-muted-foreground hover:text-foreground hover:bg-primary/10'
                        )}
                      >
                        {channel.icon ? (
                          <span className="text-sm">{channel.icon}</span>
                        ) : (
                          <ChannelIcon className="w-4 h-4" />
                        )}
                        <span className="text-sm font-medium truncate flex-1">
                          {channel.name}
                        </span>
                        {channel.visibility === 'private' && (
                          <Lock className="w-3 h-3 opacity-60" />
                        )}
                        {hasActivity && (
                          <Activity className="w-3 h-3 text-primary animate-pulse" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {filteredChannels && filteredChannels.length === 0 && (
          <div className="px-2 py-4 text-center">
            <p className="text-sm text-muted-foreground">No channels found</p>
          </div>
        )}
      </div>
    </div>
  );
}
