import type { SearchResult } from '@/features/search/types/search.types';
import { MessageSquare, Calendar } from 'lucide-react';

interface MessageResultProps {
  result: SearchResult;
  onSelect: (result: SearchResult) => void;
}

export function MessageResult({ result, onSelect }: MessageResultProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <button
      onClick={() => onSelect(result)}
      className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors border border-transparent hover:border-border"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
          <MessageSquare className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">{result.title}</div>
          <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{result.content}</div>
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(result.created_at)}</span>
          </div>
        </div>
      </div>
    </button>
  );
}
