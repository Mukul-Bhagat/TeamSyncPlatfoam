import type { Message } from '@/features/messages/types/message.types';
import { Info } from 'lucide-react';

interface SystemMessageRendererProps {
  message: Message;
}

export function SystemMessageRenderer({ message }: SystemMessageRendererProps) {
  return (
    <div className="flex items-center justify-center py-4">
      <div className="flex items-center gap-2 px-4 py-2 bg-glass/50 border border-glass-border rounded-full">
        <Info className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          {message.content || 'System event'}
        </span>
      </div>
    </div>
  );
}
