import type { Message } from '@/features/messages/types/message.types';
import { MessageRenderer } from './MessageRenderer';
import { useMemo, useRef, useEffect } from 'react';

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
  onReplyInThread?: (messageId: string) => void;
}

interface GroupedMessages {
  [key: string]: Message[];
}

export function MessageList({ messages, isLoading, onReplyInThread }: MessageListProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const previousMessageCount = useRef(messages.length);

  // Group messages by date for date separators
  const groupedMessages = useMemo(() => {
    const groups: GroupedMessages = {};
    
    messages.forEach((message) => {
      const date = new Date(message.created_at).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return groups;
  }, [messages]);

  // Group consecutive messages from the same sender
  const groupConsecutiveMessages = (messages: Message[]) => {
    const grouped: Message[][] = [];
    let currentGroup: Message[] = [];

    messages.forEach((message, index) => {
      const prevMessage = messages[index - 1];
      const isSameSender = prevMessage?.sender_id === message.sender_id;
      const isWithinTime = prevMessage 
        ? new Date(message.created_at).getTime() - new Date(prevMessage.created_at).getTime() < 5 * 60 * 1000 // 5 minutes
        : false;

      if (isSameSender && isWithinTime && !message.parent_message_id) {
        currentGroup.push(message);
      } else {
        if (currentGroup.length > 0) {
          grouped.push(currentGroup);
        }
        currentGroup = [message];
      }
    });

    if (currentGroup.length > 0) {
      grouped.push(currentGroup);
    }

    return grouped;
  };

  // Intelligent auto-scroll
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Only auto-scroll if new messages were added
    if (messages.length > previousMessageCount.current) {
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;

      if (isNearBottom) {
        container.scrollTop = container.scrollHeight;
      }
    }

    previousMessageCount.current = messages.length;
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading messages...</div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-muted-foreground">No messages yet</p>
          <p className="text-sm text-muted-foreground mt-1">Be the first to send a message!</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
      {Object.entries(groupedMessages).map(([date, dateMessages]) => (
        <div key={date}>
          {/* Date Separator */}
          <div className="sticky top-0 z-10 py-2 bg-background/80 backdrop-blur-glass-sm">
            <div className="flex items-center justify-center">
              <span className="text-xs text-muted-foreground px-3 py-1 bg-glass border border-glass-border rounded-full">
                {new Date(date).toLocaleDateString(undefined, {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>

          {/* Messages for this date */}
          {groupConsecutiveMessages(dateMessages).map((group, groupIndex) => (
            <div key={groupIndex}>
              {group.map((message) => (
                <MessageRenderer 
                  key={message.id} 
                  message={message} 
                  onReplyInThread={onReplyInThread}
                />
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
