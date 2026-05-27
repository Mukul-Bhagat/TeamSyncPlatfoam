import type { Message } from '@/features/messages/types/message.types';
import { Brain, Sparkles } from 'lucide-react';

interface AIMessageRendererProps {
  message: Message;
}

export function AIMessageRenderer({ message }: AIMessageRendererProps) {
  const metadata = message.metadata as any;

  return (
    <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-lg">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/20">
          <Brain className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-foreground flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-primary" />
              AI Response
            </span>
            {metadata?.model && (
              <span className="text-xs text-muted-foreground">
                ({metadata.model})
              </span>
            )}
          </div>
          {message.content && (
            <p className="text-sm text-foreground whitespace-pre-wrap">{message.content}</p>
          )}
          {metadata?.tokens && (
            <div className="mt-2 text-xs text-muted-foreground">
              {metadata.tokens} tokens
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
