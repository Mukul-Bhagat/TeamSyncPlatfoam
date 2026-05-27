import { useState } from 'react';
import { Smile } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MessageReaction } from '@/features/messages/types/message.types';

interface MessageReactionsProps {
  reactions: MessageReaction[];
  onAddReaction?: (emoji: string) => void;
  onRemoveReaction?: (emoji: string) => void;
  currentUserId?: string;
}

const COMMON_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🎉', '🔥', '👏'];

export function MessageReactions({
  reactions,
  onAddReaction,
  onRemoveReaction,
  currentUserId,
}: MessageReactionsProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Group reactions by emoji
  const groupedReactions = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = [];
    }
    acc[reaction.emoji].push(reaction);
    return acc;
  }, {} as Record<string, MessageReaction[]>);

  const hasUserReacted = (emoji: string) => {
    return groupedReactions[emoji]?.some((r) => r.user_id === currentUserId);
  };

  const handleReactionClick = (emoji: string) => {
    if (hasUserReacted(emoji)) {
      onRemoveReaction?.(emoji);
    } else {
      onAddReaction?.(emoji);
    }
  };

  return (
    <div className="flex items-center gap-1 mt-2 flex-wrap">
      {/* Existing Reactions */}
      {Object.entries(groupedReactions).map(([emoji, emojiReactions]) => (
        <button
          key={emoji}
          onClick={() => handleReactionClick(emoji)}
          className={cn(
            'flex items-center gap-1 px-2 py-1 rounded-full text-sm',
            'transition-all duration-fast',
            'hover:scale-105',
            hasUserReacted(emoji)
              ? 'bg-primary/20 border border-primary/30 text-primary'
              : 'bg-glass border border-glass-border text-muted-foreground hover:border-primary/50'
          )}
        >
          <span>{emoji}</span>
          <span className="text-xs">{emojiReactions.length}</span>
        </button>
      ))}

      {/* Add Reaction Button */}
      <div className="relative">
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className={cn(
            'flex items-center gap-1 px-2 py-1 rounded-full text-sm',
            'transition-all duration-fast',
            'hover:scale-105',
            'bg-glass border border-glass-border text-muted-foreground hover:border-primary/50'
          )}
        >
          <Smile className="w-4 h-4" />
        </button>

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowEmojiPicker(false)}
            />
            <div className="absolute bottom-full left-0 mb-2 p-2 bg-glass border border-glass-border rounded-lg shadow-elevation-lg z-20">
              <div className="grid grid-cols-4 gap-1">
                {COMMON_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      onAddReaction?.(emoji);
                      setShowEmojiPicker(false);
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded hover:bg-muted transition-colors duration-fast text-lg"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
