import type { Message } from '@/features/messages/types/message.types';
import { MessageSquare } from 'lucide-react';

interface TextMessageRendererProps {
  message: Message;
  onReplyInThread?: (messageId: string) => void;
}

export function TextMessageRenderer({ message, onReplyInThread }: TextMessageRendererProps) {
  return (
    <div className="group flex gap-3 p-4 hover:bg-glass/30 transition-colors duration-fast">
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-gradient-subtle flex items-center justify-center">
          {message.sender?.avatar_url ? (
            <img
              src={message.sender.avatar_url}
              alt={message.sender.full_name || 'User'}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="font-heading font-semibold text-sm text-primary">
              {message.sender?.full_name?.[0] || message.sender?.username?.[0] || 'U'}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-medium text-foreground">
            {message.sender?.full_name || message.sender?.username || 'Unknown User'}
          </span>
          <span className="text-xs text-muted-foreground">
            {new Date(message.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          {message.edited_at && (
            <span className="text-xs text-muted-foreground">(edited)</span>
          )}
        </div>

        {/* Message Content */}
        <p className="text-sm text-foreground whitespace-pre-wrap break-words">
          {message.content}
        </p>

        {/* Thread Entry Point */}
        <div className="mt-2 flex items-center gap-2">
          <button
            onClick={() => onReplyInThread?.(message.id)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors duration-fast"
          >
            <MessageSquare className="w-3 h-3" />
            <span>Reply in thread</span>
          </button>
        </div>
      </div>
    </div>
  );
}
