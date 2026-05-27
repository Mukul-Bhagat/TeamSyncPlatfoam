import { useParams } from 'react-router-dom';
import { useChannel } from '@/features/channels/hooks/useChannels';
import { useMessages } from '@/features/messages/hooks/useMessages';
import { useCreateMessage } from '@/features/messages/hooks/useMessages';
import { useChannelMessages, usePresence } from '@/realtime/hooks';
import { ChannelLayout } from '@/components/layouts/ChannelLayout';
import { ChannelType } from '@/features/channels/types/channel.types';
import { MessageType } from '@/features/messages/types/message.types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { MessageList } from '@/components/messages/MessageList';
import { MessageEditor } from '@/components/messages/MessageEditor';
import { ActivityFeed } from '@/components/activity/ActivityFeed';
import { Mic, Megaphone, AlertTriangle, Rocket, Brain } from 'lucide-react';

export function ChannelPage() {
  const { channelId } = useParams<{ channelId: string }>();
  const { data: channel, isLoading, error } = useChannel(channelId || '');
  const { data: messages, isLoading: messagesLoading } = useMessages(channelId || '');
  const createMessage = useCreateMessage();
  
  // Enable realtime message sync
  useChannelMessages(channelId || '');
  
  // Realtime presence
  const { getChannelPresence } = usePresence();
  const channelPresence = getChannelPresence(channelId || '');

  const handleSendMessage = async (content: string) => {
    if (!channelId) return;
    try {
      await createMessage.mutateAsync({
        channel_id: channelId,
        type: MessageType.TEXT,
        content,
      });
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleReplyInThread = (messageId: string) => {
    console.log('Reply in thread:', messageId);
    // Future: Open thread sidebar or navigate to thread view
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !channel) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-lg font-medium text-foreground">Channel not found</p>
          <p className="text-sm text-muted-foreground">The channel you're looking for doesn't exist or you don't have access.</p>
        </div>
      </div>
    );
  }

  const renderChannelContent = () => {
    switch (channel.type) {
      case ChannelType.TEXT:
        return (
          <div className="flex flex-col h-full">
            <MessageList
              messages={messages || []}
              isLoading={messagesLoading}
              onReplyInThread={handleReplyInThread}
            />
            <MessageEditor
              onSend={handleSendMessage}
              placeholder={`Message #${channel.name}`}
              disabled={createMessage.isPending}
            />
          </div>
        );

      case ChannelType.VOICE:
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <Mic className="w-16 h-16 text-muted-foreground mx-auto" />
              <div>
                <h2 className="text-xl font-semibold text-foreground">{channel.name}</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  Voice channel - coming soon
                </p>
              </div>
            </div>
          </div>
        );

      case ChannelType.ANNOUNCEMENT:
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <Megaphone className="w-16 h-16 text-muted-foreground mx-auto" />
              <div>
                <h2 className="text-xl font-semibold text-foreground">{channel.name}</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  Announcement channel - coming soon
                </p>
              </div>
            </div>
          </div>
        );

      case ChannelType.INCIDENT:
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <AlertTriangle className="w-16 h-16 text-muted-foreground mx-auto" />
              <div>
                <h2 className="text-xl font-semibold text-foreground">{channel.name}</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  Incident room - coming soon
                </p>
              </div>
            </div>
          </div>
        );

      case ChannelType.DEPLOYMENT:
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <Rocket className="w-16 h-16 text-muted-foreground mx-auto" />
              <div>
                <h2 className="text-xl font-semibold text-foreground">{channel.name}</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  Deployment feed - coming soon
                </p>
              </div>
            </div>
          </div>
        );

      case ChannelType.AI:
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <Brain className="w-16 h-16 text-muted-foreground mx-auto" />
              <div>
                <h2 className="text-xl font-semibold text-foreground">{channel.name}</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  AI room - coming soon
                </p>
              </div>
            </div>
          </div>
        );

      case ChannelType.ACTIVITY_FEED:
        return (
          <div className="flex flex-col h-full">
            <ActivityFeed workspaceId={channelId} limit={50} />
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-lg font-medium text-foreground">Unknown channel type</p>
            </div>
          </div>
        );
    }
  };

  return (
    <ChannelLayout
      channel={channel}
      rightPanelContent={
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">About</h3>
            <p className="text-sm text-muted-foreground">
              {channel.description || 'No description provided.'}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">Channel Type</h3>
            <p className="text-sm text-muted-foreground capitalize">{channel.type.replace('_', ' ')}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">Visibility</h3>
            <p className="text-sm text-muted-foreground capitalize">{channel.visibility}</p>
          </div>
          <div className="pt-4 border-t border-glass-border">
            <h3 className="text-sm font-semibold text-foreground mb-2">Active Users</h3>
            {channelPresence.length > 0 ? (
              <div className="space-y-2">
                {channelPresence.map((user) => (
                  <div key={user.userId} className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-subtle flex items-center justify-center">
                      <span className="text-xs text-primary">
                        {user.userId[0].toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {user.userId}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No active users</p>
            )}
          </div>
          <div className="pt-4 border-t border-glass-border">
            <h3 className="text-sm font-semibold text-foreground mb-2">Recent Activity</h3>
            <div className="max-h-48 overflow-y-auto">
              <ActivityFeed workspaceId={channelId} limit={5} />
            </div>
          </div>
          <div className="pt-4 border-t border-glass-border">
            <h3 className="text-sm font-semibold text-foreground mb-2">Pinned Messages</h3>
            <p className="text-sm text-muted-foreground">No pinned messages yet</p>
          </div>
          <div className="pt-4 border-t border-glass-border">
            <h3 className="text-sm font-semibold text-foreground mb-2">Thread Activity</h3>
            <p className="text-sm text-muted-foreground">No active threads</p>
          </div>
        </div>
      }
    >
      {renderChannelContent()}
    </ChannelLayout>
  );
}
